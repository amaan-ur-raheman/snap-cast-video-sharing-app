"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ImageWIthFallback from "./ImageWIthFallback";

/**
 * A card component that displays video content with interactive features.
 * 
 * @param {Object} props - The component props
 * @param {string} props.id - Unique identifier for the video
 * @param {string} props.title - Title of the video
 * @param {string} props.thumbnail - URL of the video thumbnail image
 * @param {Date} props.createdAt - Creation date of the video
 * @param {string} props.userImg - URL of the user's profile image
 * @param {string} props.username - Username of the video creator
 * @param {number} props.views - Number of views on the video
 * @param {'public' | 'private'} props.visibility - Visibility status of the video
 * @param {number} [props.duration] - Duration of the video in seconds (optional)
 * 
 * @returns {JSX.Element} A card displaying video information with a clickable link and copy URL functionality.
 * The card shows the video thumbnail, creator details, view count, upload date, and video duration.
 * Users can click to view the video or copy the video URL via a dedicated button.
 */
const VideoCard = ({
	id,
	title,
	thumbnail,
	createdAt,
	userImg,
	username,
	views,
	visibility,
	duration,
}: VideoCardProps) => {
	const [copied, setCopied] = useState(false);

	/**
	 * The `handleCopy` function in TypeScript React copies a specific URL to the clipboard and sets a
	 * state to indicate that the URL has been copied.
	 * @param e - The parameter `e` in the `handleCopy` function is a React.MouseEvent event object. It is
	 * used to handle mouse events in React components.
	 */
	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

	return (
		<Link href={`/video/${id}`} className="video-card">
			<Image
				src={thumbnail}
				alt="thumbnail"
				width={290}
				height={160}
				className="thumbnail"
			/>
			<article>
				<div>
					<figure>
						<ImageWIthFallback
							src={userImg}
							alt={username}
							width={34}
							height={34}
							className="rounded-full aspect-square"
						/>
						<figcaption>
							<h3>{username}</h3>
							<p>{visibility}</p>
						</figcaption>
					</figure>
					<aside>
						<Image
							src="/assets/icons/eye.svg"
							alt="views"
							width={16}
							height={16}
						/>
						<span>{views}</span>
					</aside>
				</div>
				<h2>
					{title} -{" "}
					{createdAt.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
				</h2>
			</article>
			<button
				onClick={handleCopy}
				title="Copy Button"
				className="copy-btn"
			>
				<Image
					src={
						copied
							? "/assets/icons/checkmark.svg"
							: "/assets/icons/link.svg"
					}
					alt="copy"
					width={18}
					height={18}
				/>
			</button>
			{duration && (
				<div className="duration">{Math.ceil(duration / 60)} min</div>
			)}
		</Link>
	);
};

export default VideoCard;
