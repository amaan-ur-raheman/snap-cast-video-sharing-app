"use client";

import { initialVideoState } from "@/constants";
import {
	getVideoProcessingStatus,
	incrementVideoViews,
} from "@/lib/actions/video";
import { cn, createIframeLink } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

/**
 * VideoPlayer component that displays a video iframe and handles video processing status
 * @param {Object} props - Component props
 * @param {string} props.videoId - Unique identifier for the video
 * @param {string} props.className - Additional CSS classes to apply to the component
 * @returns {JSX.Element} Video player component
 */
const VideoPlayer = ({ videoId, className }: VideoPlayerProps) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [state, setState] = useState(initialVideoState);

	useEffect(() => {
        /**
         * Checks the processing status of a video and updates component state
         * @returns {Promise<boolean>} Promise that resolves to true if video is processed, false otherwise
         */
        const checkProcessingStatus = async () => {
            const status = await getVideoProcessingStatus(videoId);
            setState((prev) => ({
                ...prev,
                isProcessing: !status.isProcessed,
            }));

            return status.isProcessed;
        };

		checkProcessingStatus();

		const intervalId = setInterval(async () => {
			const isProcessed = await checkProcessingStatus();

			if (isProcessed) {
				clearInterval(intervalId);
			}
		}, 3000);

		return () => {
			clearInterval(intervalId);
		};
	}, [videoId]);

	/**
	 * Effect to increment video view count when video is loaded and not processing
	 */
	useEffect(() => {
		if (
			state.isLoaded &&
			!state.hasIncrementedView &&
			!state.isProcessing
		) {
			const incrementView = async () => {
				try {
					await incrementVideoViews(videoId);
					setState((prev) => ({ ...prev, hasIncrementedView: true }));
				} catch (error) {
					console.error("Failed to increment view count:", error);
				}
			};

			incrementView();
		}
	}, [videoId, state.isLoaded, state.hasIncrementedView, state.isProcessing]);

	return (
		<div className={cn("video-player", className)}>
			{state.isProcessing ? (
				<div>
					<p>Processing video...</p>
				</div>
			) : (
				<iframe
					ref={iframeRef}
					src={createIframeLink(videoId)}
					loading="lazy"
					title="Video player"
					style={{ border: 0, zIndex: 50 }}
					allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
					allowFullScreen
					onLoad={() =>
						setState((prev) => ({ ...prev, isLoaded: true }))
					}
				/>
			)}
		</div>
	);
};

export default VideoPlayer;
