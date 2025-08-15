"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import {
	apiFetch,
	doesTitleMatch,
	getEnv,
	getOrderByClause,
	withErrorHandling,
} from "../utils";
import { BUNNY } from "@/constants";
import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import aj from "../arcjet";
import { fixedWindow, request } from "@arcjet/next";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
	streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
	storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
};

// Helper functions with descriptive names
const revalidatePaths = (paths: string[]) => {
	paths.forEach((path) => revalidatePath(path));
};

const getSessionUserId = async (): Promise<string> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) throw new Error("Unauthenticated");
	return session.user.id;
};

const validateWithArcjet = async (fingerprint: string) => {
	const rateLimit = aj.withRule(
		fixedWindow({
			mode: "LIVE",
			window: "1m",
			max: 2,
			characteristics: ["fingerprint"],
		})
	);

	const req = await request();

	const decision = await rateLimit.protect(req, { fingerprint });

	if (decision.isDenied()) {
		throw new Error("Rate limit exceeded");
	}
};

/**
 * The function builds a query to select videos along with user information by joining the videos and
 * user tables.
 * @returns The `buildVideoWithUserQuery` function is returning a query that selects the `video` field
 * from the `videos` table and the `user` field with `id`, `name`, and `image` properties from the
 * `user` table. It then performs a left join between the `videos` and `user` tables on the `userId`
 * and `id` fields respectively.
 */
const buildVideoWithUserQuery = () => {
	return db
		.select({
			video: videos,
			user: { id: user.id, name: user.name, image: user.image },
		})
		.from(videos)
		.leftJoin(user, eq(videos.userId, user.id));
};

// Server Actions
export const getVideoUploadUrl = withErrorHandling(async () => {
	await getSessionUserId();
	const videoResponse = await apiFetch<BunnyVideoResponse>(
		`${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
		{
			method: "POST",
			bunnyType: "stream",
			body: { title: "Temp Title", collectionId: "" },
		}
	);

	const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;
	return {
		videoId: videoResponse.guid,
		uploadUrl,
		accessKey: ACCESS_KEYS.streamAccessKey,
	};
});

export const getThumbnailUploadUrl = withErrorHandling(
	async (videoId: string) => {
		const timestampedFileName = `${Date.now()}-${videoId}-thumbnail`;
		const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${timestampedFileName}`;
		const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${timestampedFileName}`;

		return {
			uploadUrl,
			cdnUrl,
			accessKey: ACCESS_KEYS.storageAccessKey,
		};
	}
);

export const saveVideoDetails = withErrorHandling(
	async (videoDetails: VideoDetails) => {
		const userId = await getSessionUserId();
		await validateWithArcjet(userId);

		await apiFetch(
			`${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
			{
				method: "POST",
				bunnyType: "stream",
				body: {
					title: videoDetails.title,
					description: videoDetails.description,
				},
			}
		);

		const now = new Date();
		await db.insert(videos).values({
			...videoDetails,
			videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
			userId,
			createdAt: now,
			updatedAt: now,
		});

		revalidatePaths(["/"]);
		return { videoId: videoDetails.videoId };
	}
);

/**
 * This `getAllVideos` function is responsible for fetching a list of videos based on certain criteria.
 * @param searchQuery - The `searchQuery` parameter is a string that is used to filter the videos based on
 * their title. It is an optional parameter, and if not provided, it defaults to an empty string.
 * @param sortFilter - The `sortFilter` parameter is used to specify the sorting order of the videos. It
 * can have the following values:
 * @param pageNumber - The `pageNumber` parameter is used to specify the page number of the videos to be
 * retrieved. It is an optional parameter with a default value of 1.
 * @param pageSize - The `pageSize` parameter is used to specify the number of videos to be retrieved per
 * page. It is an optional parameter with a default value of 8.
 * @returns The function `getAllVideos` returns a Promise that resolves to an object with two properties:
 * `videos` and `pagination`.
 */
export const getAllVideos = withErrorHandling(
	async (
		searchQuery: string = "",
		sortFilter?: string,
		pageNumber: number = 1,
		pageSize: number = 8
	) => {
		const session = await auth.api.getSession({ headers: await headers() });
		const currentUserId = session?.user.id;

		const canSeeTheVideos = or(
			eq(videos.visibility, "public"),
			eq(videos.userId, currentUserId!)
		);

		const whereCondition = searchQuery.trim()
			? and(canSeeTheVideos, doesTitleMatch(videos, searchQuery))
			: canSeeTheVideos;

		const [{ totalCount }] = await db
			.select({ totalCount: sql<number>`count(*)` })
			.from(videos)
			.where(whereCondition);

		const totalVideos = Number(totalCount || 0);
		const totalPages = Math.ceil(totalVideos / pageSize);

		const videoRecords = await buildVideoWithUserQuery()
			.where(whereCondition)
			.orderBy(
				sortFilter
					? getOrderByClause(sortFilter)
					: sql`${videos.createdAt} DESC`
			)
			.limit(pageSize)
			.offset((pageNumber - 1) * pageSize);

		return {
			videos: videoRecords,
			pagination: {
				currentPage: pageNumber,
				totalPages,
				totalVideos,
				pageSize,
			},
		};
	}
);

/**
 * Fetches a specific video record along with its associated user information
 *
 * This server action retrieves a single video by its unique identifier and includes:
 * - All video metadata (title, description, URLs, visibility, etc.)
 * - Associated user information (id, name, profile image)
 *
 * The function uses a joined query to fetch both video and user data in a single
 * database operation for better performance.
 *
 * @param videoId - The unique identifier of the video to retrieve
 * @returns A Promise that resolves to the video record with user details, or undefined if not found
 * @throws Will throw an error if the database query fails
 */
export const getVideoById = withErrorHandling(async (videoId: string) => {
	const [videoRecord] = await buildVideoWithUserQuery().where(
		eq(videos.id, videoId)
	);

	return videoRecord;
});

/**
 * Fetches the auto-generated English transcript/captions for a video
 *
 * This server action retrieves the VTT (Web Video Text Tracks) file containing
 * the automatically generated English captions from Bunny.net's transcription service.
 *
 * The transcript is returned as plain text in VTT format, which includes:
 * - Timing information for each caption segment
 * - The actual transcribed text
 * - Metadata and formatting information
 *
 * @param videoId - The unique identifier of the video whose transcript should be fetched
 * @returns A Promise that resolves to the transcript text in VTT format
 * @throws Will throw an error if the transcript fetch fails or is not available
 */
export const getTranscript = withErrorHandling(async (videoId: string) => {
	const response = await fetch(
		`${BUNNY.TRANSCRIPT_URL}/${videoId}/captions/en-auto.vtt`
	);
	return response.text();
});

/**
 * Increments the view count for a specific video
 *
 * This server action performs the following:
 * 1. Atomically increments the video's view counter by 1 in the database
 * 2. Updates the video's last modified timestamp
 * 3. Revalidates the video's detail page cache to reflect the new view count
 *
 * The view count increment is done using a SQL expression to ensure
 * atomic updates even with concurrent requests.
 *
 * @param videoId - The unique identifier of the video whose views should be incremented
 * @returns An empty object to indicate successful increment
 * @throws Will throw an error if the database update fails
 */
export const incrementVideoViews = withErrorHandling(
	async (videoId: string) => {
		await db
			.update(videos)
			.set({ views: sql`${videos.views} + 1`, updatedAt: new Date() })
			.where(eq(videos.videoId, videoId));

		revalidatePaths([`/video/${videoId}`]);
		return {};
	}
);

export const getAllVideosByUser = withErrorHandling(
	async (
		userIdParameter: string,
		searchQuery: string = "",
		sortFilter?: string
	) => {
		const currentUserId = (
			await auth.api.getSession({ headers: await headers() })
		)?.user.id;
		const isOwner = userIdParameter === currentUserId;

		const [userInfo] = await db
			.select({
				id: user.id,
				name: user.name,
				image: user.image,
				email: user.email,
			})
			.from(user)
			.where(eq(user.id, userIdParameter));
		if (!userInfo) throw new Error("User not found");

		const conditions = [
			eq(videos.userId, userIdParameter),
			!isOwner && eq(videos.visibility, "public"),
			searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
		].filter(Boolean) as any[];

		const userVideos = await buildVideoWithUserQuery()
			.where(and(...conditions))
			.orderBy(
				sortFilter
					? getOrderByClause(sortFilter)
					: desc(videos.createdAt)
			);

		return { user: userInfo, videos: userVideos, count: userVideos.length };
	}
);

/**
 * Updates the visibility status of a video
 *
 * This function performs the following operations:
 * 1. Validates the request using Arcjet rate limiting
 * 2. Updates the video's visibility status in the database
 * 3. Updates the video's last modified timestamp
 * 4. Revalidates relevant cache paths to reflect changes
 *
 * @param videoId - The unique identifier of the video to update
 * @param visibility - The new visibility status to set ('public' or 'private')
 * @returns An empty object to indicate successful update
 * @throws Will throw an error if validation fails or database update fails
 */
export const updateVideoVisibility = withErrorHandling(
	async (videoId: string, visibility: Visibility) => {
		await validateWithArcjet(videoId);
		await db
			.update(videos)
			.set({ visibility, updatedAt: new Date() })
			.where(eq(videos.videoId, videoId));

		revalidatePaths(["/", `/video/${videoId}`]);
		return {};
	}
);

/**
 * Fetches and returns the current processing status of a video from Bunny.net CDN
 *
 * This server action queries the Bunny.net API to get detailed information about
 * the video's processing state, including:
 * - Whether processing is complete (status === 4)
 * - Current encoding progress percentage
 * - Raw status code from Bunny.net
 *
 * The status codes from Bunny.net represent:
 * - 0: Queued
 * - 1: Processing
 * - 4: Completed
 * - 5: Failed
 *
 * @param videoId - The unique identifier of the video on Bunny.net
 * @returns An object containing:
 *          - isProcessed: boolean indicating if processing is complete
 *          - encodingProgress: number between 0-100 showing encoding progress
 *          - status: raw status code from Bunny.net
 * @throws Will throw an error if the API request fails
 */
export const getVideoProcessingStatus = withErrorHandling(
	async (videoId: string) => {
		const processingInfo = await apiFetch<BunnyVideoResponse>(
			`${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
			{ bunnyType: "stream" }
		);

		return {
			isProcessed: processingInfo.status === 4,
			encodingProgress: processingInfo.encodeProgress || 0,
			status: processingInfo.status,
		};
	}
);

/**
 * Deletes a video and its associated thumbnail from both storage and database
 *
 * This function performs three main operations:
 * 1. Deletes the video from Bunny.net video streaming service
 * 2. Deletes the associated thumbnail from Bunny.net storage
 * 3. Removes the video entry from the local database
 *
 * After deletion, it revalidates the homepage and video detail page paths
 * to ensure the UI reflects the changes.
 *
 * @param videoId - The unique identifier of the video to be deleted
 * @param thumbnailUrl - The complete URL of the video's thumbnail
 * @returns An empty object to indicate successful deletion
 * @throws Will throw an error if any deletion operation fails
 */
export const deleteVideo = withErrorHandling(
	async (videoId: string, thumbnailUrl: string) => {
		await apiFetch(
			`${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
			{ method: "DELETE", bunnyType: "stream" }
		);

		const thumbnailPath = thumbnailUrl.split("thumbnails/")[1];
		await apiFetch(
			`${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${thumbnailPath}`,
			{ method: "DELETE", bunnyType: "storage", expectJson: false }
		);

		await db.delete(videos).where(eq(videos.videoId, videoId));
		revalidatePaths(["/", `/video/${videoId}`]);
		return {};
	}
);
