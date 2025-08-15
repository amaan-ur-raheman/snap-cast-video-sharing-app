"use client";

import { cn, parseTranscript } from "@/lib/utils";
import { useState } from "react";
import EmptyState from "./EmptyState";
import { infos } from "@/constants";

/**
 * A component that displays video information including transcript and metadata
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.transcript - The video transcript text
 * @param {string} props.createdAt - Video creation timestamp
 * @param {string} props.description - Video description text
 * @param {string} props.videoId - Unique identifier for the video
 * @param {string} props.videoUrl - URL where the video can be accessed
 * @param {string} props.title - Title of the video
 * 
 * Features:
 * - Toggleable views between transcript and metadata
 * - Transcript view shows timestamped text segments
 * - Metadata view displays video details like title, description, ID and URL
 * - Empty state handling for missing transcripts
 */
const VideoInfo = ({
	transcript,
	createdAt,
	description,
	videoId,
	videoUrl,
	title,
}: VideoInfoProps) => {
	const [info, setInfo] = useState("transcript");
	const parsedTranscript = parseTranscript(transcript || "");

	/* The `renderTranscript` function is responsible for rendering the transcript of the video. It
    creates a `<ul>` element with a class name of "transcript" and then checks if the
    `parsedTranscript` array has items. If it does, it maps over each item to generate `<li>` elements
    containing the time and text of each transcript item. If the `parsedTranscript` array is empty, it
    renders an `EmptyState` component with a specific icon, title, and description indicating that no
    transcript is available for the video. */
    const renderTranscript = () => (
		<ul className="transcript">
			{parsedTranscript.length > 0 ? (
				parsedTranscript.map((item, index) => (
					<li key={index}>
						<h2>[{item.time}]</h2>
						<p>{item.text}</p>
					</li>
				))
			) : (
				<EmptyState
					icon="/assets/icons/copy.svg"
					title="No transcript available"
					description="This video doesn’t include any transcribed content!"
				/>
			)}
		</ul>
	);

	const metaDatas = [
		{
			label: "Video Title",
			value: `${title}-${new Date(createdAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			})}`,
		},
		{
			label: "Video Description",
			value: description,
		},
		{
			label: "Video Id",
			value: videoId,
		},
		{
			label: "Video Url",
			value: videoUrl,
		},
	];

	/* The `renderMetaData` function is responsible for rendering the metadata of the video. It creates a
    `<div>` element with a class name of "metadata" and then maps over the `metaDatas` array to
    generate `<article>` elements for each metadata item. */
    const renderMetaData = () => (
		<div className="metadata">
			{metaDatas.map(({ label, value }, index) => (
				<article key={index}>
					<h2>{label}</h2>
					<p
						className={cn({
							"text-pink-100 truncate": label === "Video Url",
						})}
					>
						{value}
					</p>
				</article>
			))}
		</div>
	);

	return (
		<section className="video-info">
			<nav>
				{infos.map((item) => (
					<button
						key={item}
						className={cn({
							"text-pink-100 border-b-2 border-pink-100":
								info === item,
						})}
						onClick={() => setInfo(item)}
					>
						{item}
					</button>
				))}
			</nav>
			{info === "transcript" ? renderTranscript() : renderMetaData()}
		</section>
	);
};

export default VideoInfo;
