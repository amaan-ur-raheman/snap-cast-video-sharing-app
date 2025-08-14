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

export const getVideoById = withErrorHandling(async (videoId: string) => {
	const [videoRecord] = await buildVideoWithUserQuery().where(
		eq(videos.id, videoId)
	);

	return videoRecord;
});

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
