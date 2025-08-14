import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ilike, sql } from "drizzle-orm";
import { DEFAULT_VIDEO_CONFIG, DEFAULT_RECORDING_CONFIG } from "@/constants";
import { videos } from "@/drizzle/schema";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * The function `updateURLParams` updates URL parameters based on the provided updates and returns the
 * updated URL string.
 * @param {URLSearchParams} currentParams - `currentParams` is the current URL parameters that you want
 * to update. It is of type `URLSearchParams`, which represents a set of key/value pairs in a URL query
 * string.
 * @param updates - The `updates` parameter is a record object that contains key-value pairs where the
 * key is a parameter name and the value is the updated value for that parameter. The value can be a
 * string, null, or undefined.
 * @param {string} [basePath=/] - The `basePath` parameter in the `updateURLParams` function is a
 * string that represents the base path for the URL. It is used as the initial part of the URL before
 * the query parameters. If no `basePath` is provided, the default value is set to "/".
 * @returns The `updateURLParams` function returns a string representing the updated URL with the
 * modified parameters based on the provided `currentParams`, `updates`, and `basePath` parameters.
 */
export const updateURLParams = (
	currentParams: URLSearchParams,
	updates: Record<string, string | null | undefined>,
	basePath: string = "/"
): string => {
	const params = new URLSearchParams(currentParams.toString());

	// Process each parameter update
	Object.entries(updates).forEach(([name, value]) => {
		if (value) {
			params.set(name, value);
		} else {
			params.delete(name);
		}
	});

	return `${basePath}?${params.toString()}`;
};

// Get env helper function
export const getEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) throw new Error(`Missing required env: ${key}`);
	return value;
};

// API fetch helper with required Bunny CDN options
export const apiFetch = async <T = Record<string, unknown>>(
	url: string,
	options: Omit<ApiFetchOptions, "bunnyType"> & {
		bunnyType: "stream" | "storage";
	}
): Promise<T> => {
	const {
		method = "GET",
		headers = {},
		body,
		expectJson = true,
		bunnyType,
	} = options;

	const key = getEnv(
		bunnyType === "stream"
			? "BUNNY_STREAM_ACCESS_KEY"
			: "BUNNY_STORAGE_ACCESS_KEY"
	);

	const requestHeaders = {
		...headers,
		AccessKey: key,
		...(bunnyType === "stream" && {
			accept: "application/json",
			...(body && { "content-type": "application/json" }),
		}),
	};

	const requestOptions: RequestInit = {
		method,
		headers: requestHeaders,
		...(body && { body: JSON.stringify(body) }),
	};

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		throw new Error(`API error ${response.text()}`);
	}

	if (method === "DELETE" || !expectJson) {
		return true as T;
	}

	return await response.json();
};

// Higher order function to handle errors
export const withErrorHandling = <T, A extends unknown[]>(
	fn: (...args: A) => Promise<T>
) => {
	return async (...args: A): Promise<T> => {
		try {
			const result = await fn(...args);
			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred";
			return errorMessage as unknown as T;
		}
	};
};

/**
 * The function `getOrderByClause` returns an SQL order by clause based on the provided filter,
 * defaulting to ordering by creation date in descending order.
 * @param {string} [filter] - The `filter` parameter is used to determine the order in which the videos
 * should be sorted. It can have the following values:
 * @returns The function `getOrderByClause` returns an SQL order by clause based on the provided
 * filter. If the filter is "Most Viewed", it returns an order by clause for sorting by views in
 * descending order. If the filter is "Least Viewed", it returns an order by clause for sorting by
 * views in ascending order. If the filter is "Oldest First", it returns an order by clause
 */
export const getOrderByClause = (filter?: string) => {
	switch (filter) {
		case "Most Viewed":
			return sql`${videos.views} DESC`;
		case "Least Viewed":
			return sql`${videos.views} ASC`;
		case "Oldest First":
			return sql`${videos.createdAt} ASC`;
		case "Most Recent":
		default:
			return sql`${videos.createdAt} DESC`;
	}
};

/**
 * The function generates a pagination array based on the current page and total number of pages,
 * displaying a subset of pages with ellipses for navigation.
 * @param {number} currentPage - The `currentPage` parameter represents the current page number in a
 * pagination system. It is the page that the user is currently viewing or interacting with.
 * @param {number} totalPages - The `totalPages` parameter represents the total number of pages in a
 * pagination system. This function `generatePagination` is designed to generate an array representing
 * the pagination links based on the current page and total number of pages. The function handles
 * different scenarios for displaying pagination links depending on the current page and total
 * @returns The function `generatePagination` returns an array representing the pagination links based
 * on the current page and total number of pages. The array contains the pagination links to be
 * displayed.
 */
export const generatePagination = (currentPage: number, totalPages: number) => {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}
	if (currentPage <= 3) {
		return [1, 2, 3, 4, 5, "...", totalPages];
	}
	if (currentPage >= totalPages - 2) {
		return [
			1,
			"...",
			totalPages - 4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}
	return [
		1,
		"...",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"...",
		totalPages,
	];
};

/**
 * The function `getMediaStreams` retrieves media streams for display and microphone input based on the
 * specified parameters.
 * @param {boolean} withMic - The `withMic` parameter is a boolean value that determines whether to
 * include microphone audio in the media streams. If `withMic` is `true`, the function will request
 * access to the user's microphone and include it in the returned `MediaStreams`. If `withMic` is
 * `false`,
 * @returns The function `getMediaStreams` returns an object with the following properties:
 * - `displayStream`: A `MediaStream` object representing the display stream with video and audio
 * tracks.
 * - `micStream`: A `MediaStream` object representing the microphone stream if `withMic` is `true`,
 * otherwise `null`.
 * - `hasDisplayAudio`: A boolean indicating whether the display stream has audio tracks
 */
export const getMediaStreams = async (
	withMic: boolean
): Promise<MediaStreams> => {
	const displayStream = await navigator.mediaDevices.getDisplayMedia({
		video: DEFAULT_VIDEO_CONFIG,
		audio: true,
	});

	const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
	let micStream: MediaStream | null = null;

	if (withMic) {
		micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		micStream
			.getAudioTracks()
			.forEach((track: MediaStreamTrack) => (track.enabled = true));
	}

	return { displayStream, micStream, hasDisplayAudio };
};

/**
 * The `createAudioMixer` function in TypeScript creates an audio mixer using the provided
 * AudioContext, display stream, microphone stream (if available), and a flag indicating the presence
 * of display audio.
 * @param {AudioContext} ctx - The `ctx` parameter is an instance of the `AudioContext` class, which
 * represents an audio-processing graph built from audio modules linked together.
 * @param {MediaStream} displayStream - The `displayStream` parameter is a MediaStream representing the
 * audio stream from the display or screen that is being captured.
 * @param {MediaStream | null} micStream - The `micStream` parameter in the `createAudioMixer` function
 * represents the MediaStream coming from the microphone. It can be either a valid MediaStream object
 * or `null` if there is no microphone audio input.
 * @param {boolean} hasDisplayAudio - The `hasDisplayAudio` parameter is a boolean value that indicates
 * whether the `displayStream` contains audio that needs to be mixed. If `hasDisplayAudio` is `true`,
 * the audio from the `displayStream` will be mixed with a gain value of 0.7.
 * @returns The function `createAudioMixer` returns the `destination` MediaStreamDestination node where
 * the audio streams from `displayStream` and `micStream` (if available) are mixed together with
 * different gain values and connected.
 */
export const createAudioMixer = (
	ctx: AudioContext,
	displayStream: MediaStream,
	micStream: MediaStream | null,
	hasDisplayAudio: boolean
) => {
	if (!hasDisplayAudio && !micStream) return null;

	const destination = ctx.createMediaStreamDestination();
	const mix = (stream: MediaStream, gainValue: number) => {
		const source = ctx.createMediaStreamSource(stream);
		const gain = ctx.createGain();
		gain.gain.value = gainValue;
		source.connect(gain).connect(destination);
	};

	if (hasDisplayAudio) mix(displayStream, 0.7);
	if (micStream) mix(micStream, 1.5);

	return destination;
};

/**
 * The function `setupMediaRecorder` creates a new `MediaRecorder` object with the provided
 * `MediaStream` and default recording configuration.
 * @param {MediaStream} stream - A MediaStream object representing a stream of media content, typically
 * audio or video, that is being captured from a media input device such as a microphone or camera.
 * @returns A `MediaRecorder` object is being returned. If the creation of the `MediaRecorder` object
 * with the `DEFAULT_RECORDING_CONFIG` fails, then a `MediaRecorder` object is created without any
 * additional configuration.
 */
export const setupMediaRecorder = (stream: MediaStream) => {
	try {
		return new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
	} catch {
		return new MediaRecorder(stream);
	}
};

export const getVideoDuration = (url: string): Promise<number | null> =>
	new Promise((resolve) => {
		const video = document.createElement("video");
		video.preload = "metadata";
		video.onloadedmetadata = () => {
			const duration =
				isFinite(video.duration) && video.duration > 0
					? Math.round(video.duration)
					: null;
			URL.revokeObjectURL(video.src);
			resolve(duration);
		};
		video.onerror = () => {
			URL.revokeObjectURL(video.src);
			resolve(null);
		};
		video.src = url;
	});

export const setupRecording = (
	stream: MediaStream,
	handlers: RecordingHandlers
): MediaRecorder => {
	const recorder = new MediaRecorder(stream, DEFAULT_RECORDING_CONFIG);
	recorder.ondataavailable = handlers.onDataAvailable;
	recorder.onstop = handlers.onStop;
	return recorder;
};

export const cleanupRecording = (
	recorder: MediaRecorder | null,
	stream: MediaStream | null,
	originalStreams: MediaStream[] = []
) => {
	if (recorder?.state !== "inactive") {
		recorder?.stop();
	}

	stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
	originalStreams.forEach((s) =>
		s.getTracks().forEach((track: MediaStreamTrack) => track.stop())
	);
};

export const createRecordingBlob = (
	chunks: Blob[]
): { blob: Blob; url: string } => {
	const blob = new Blob(chunks, { type: "video/webm" });
	const url = URL.createObjectURL(blob);
	return { blob, url };
};

export const calculateRecordingDuration = (startTime: number | null): number =>
	startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

export function parseTranscript(transcript: string): TranscriptEntry[] {
	const lines = transcript.replace(/^WEBVTT\s*/, "").split("\n");
	const result: TranscriptEntry[] = [];
	let tempText: string[] = [];
	let startTime: string | null = null;

	for (const line of lines) {
		const trimmedLine = line.trim();
		const timeMatch = trimmedLine.match(
			/(\d{2}:\d{2}:\d{2})\.\d{3}\s-->\s(\d{2}:\d{2}:\d{2})\.\d{3}/
		);

		if (timeMatch) {
			if (tempText.length > 0 && startTime) {
				result.push({ time: startTime, text: tempText.join(" ") });
				tempText = [];
			}
			startTime = timeMatch[1] ?? null;
		} else if (trimmedLine) {
			tempText.push(trimmedLine);
		}

		if (tempText.length >= 3 && startTime) {
			result.push({ time: startTime, text: tempText.join(" ") });
			tempText = [];
			startTime = null;
		}
	}

	if (tempText.length > 0 && startTime) {
		result.push({ time: startTime, text: tempText.join(" ") });
	}

	return result;
}

export function daysAgo(inputDate: Date): string {
	const input = new Date(inputDate);
	const now = new Date();

	const diffTime = now.getTime() - input.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return "Today";
	} else if (diffDays === 1) {
		return "1 day ago";
	} else {
		return `${diffDays} days ago`;
	}
}

export const createIframeLink = (videoId: string) =>
	`https://iframe.mediadelivery.net/embed/479965/${videoId}?autoplay=true&preload=true`;

/**
 * The function `doesTitleMatch` is used to check if a search query matches the title of a video after
 * removing special characters and spaces.
 * @param {any} videos - The `videos` parameter is likely an object or an array containing video data.
 * It seems to have a property or key called `title` which holds the title of the video. The function
 * `doesTitleMatch` is designed to check if the title of a video matches a given search query after
 * removing
 * @param {string} searchQuery - The `searchQuery` parameter is a string that represents the search
 * query entered by the user. It is used to search for a match in the `videos` based on the title.
 */
export const doesTitleMatch = (videos: any, searchQuery: string) =>
	ilike(
		sql`REPLACE(REPLACE(REPLACE(LOWER(${videos.title}), '-', ''), '.', ''), ' ', '')`,
		`%${searchQuery.replace(/[-. ]/g, "").toLowerCase()}%`
	);
