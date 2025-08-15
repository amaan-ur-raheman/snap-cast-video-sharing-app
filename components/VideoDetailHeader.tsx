"use client";

import { deleteVideo, updateVideoVisibility } from "@/lib/actions/video";
import { authClient } from "@/lib/auth-client";
import { daysAgo } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageWIthFallback from "./ImageWIthFallback";
import DropdownList from "./DropdownList";
import { visibilities } from "@/constants";

/**
 * VideoDetailHeader Component
 * 
 * A component that displays the header section of a video detail page, including:
 * - Video title
 * - User information (profile image, username)
 * - Creation date
 * - Actions like copying link, deleting video, and changing visibility
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the video
 * @param {Date} props.createdAt - The creation date of the video
 * @param {string} props.userImg - URL of the user's profile image
 * @param {string} props.username - Username of the video owner
 * @param {string} props.videoId - Unique identifier for the video
 * @param {string} props.ownerId - Unique identifier for the video owner
 * @param {Visibility} props.visibility - Current visibility setting of the video
 * @param {string} props.thumbnailUrl - URL of the video thumbnail
 * @param {string} props.id - Unique identifier used in sharing links
 * @returns {JSX.Element} The rendered video detail header
 */
const VideoDetailHeader = ({
	title,
	createdAt,
	userImg,
	username,
	videoId,
	ownerId,
	visibility,
	thumbnailUrl,
	id,
}: VideoDetailHeaderProps) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const [copied, setCopied] = useState(false);
	const [visibilityState, setVisibilityState] = useState<Visibility>(
		visibility as Visibility
	);
	const [isUpdating, setIsUpdating] = useState(false);
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const userId = session?.user.id;
	const isOwner = ownerId === userId;

	/**
	 * The handleDelete function sets a loading state, deletes a video using the videoId and thumbnailUrl,
	 * navigates to the home page, logs any errors, and resets the loading state.
	 */
	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await deleteVideo(videoId, thumbnailUrl);
			router.push("/");
		} catch (error) {
			console.error("Error deleting video:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	/**
	 * The function `handleVisibilityChange` updates the visibility of a video and handles any errors that
	 * occur during the process.
	 * @param {string} option - The `option` parameter in the `handleVisibilityChange` function is a
	 * string that represents the new visibility state that the video should be updated to.
	 */
	const handleVisibilityChange = async (option: string) => {
		if (option !== visibilityState) {
			setIsUpdating(true);
			try {
				await updateVideoVisibility(videoId, option as Visibility);
				setVisibilityState(option as Visibility);
			} catch (error) {
				console.error("Error updating visibility:", error);
			} finally {
				setIsUpdating(false);
			}
		}
	};

	/**
	 * The function `handleCopyLink` copies the current video's URL to the clipboard and sets a state
	 * variable to indicate that the link has been copied.
	 */
	const handleCopyLink = () => {
		navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
		setCopied(true);
	};

	useEffect(() => {
		const changeChecked = setTimeout(() => {
			if (copied) setCopied(false);
		}, 2000);

		return () => clearTimeout(changeChecked);
	}, [copied]);

	/**
	 * The TriggerVisibility component renders a visibility trigger with icons and text.
	 */
	const TriggerVisibility = () => (
		<div className="visibility-trigger">
			<div>
				<Image
					src="/assets/icons/eye.svg"
					alt="Visibility"
					width={16}
					height={16}
					className="mt-0.5"
				/>
				<p>{visibilityState}</p>
			</div>
			<Image
				src="/assets/icons/arrow-down.svg"
				alt="arrow down"
				width={16}
				height={16}
			/>
		</div>
	);

	return (
		<header className="detail-header">
			<aside className="user-info">
				<h1>{title}</h1>
				<figure>
					<button onClick={() => router.push(`/profile/${ownerId}`)}>
						<ImageWIthFallback
							src={userImg ?? ""}
							alt={username as string}
							width={24}
							height={24}
							className="rounded-full"
						/>
						<h2>{username ?? "Guest"}</h2>
					</button>
					<figcaption>
						<span className="mt-1">⋅</span>
						{daysAgo(createdAt)}
					</figcaption>
				</figure>
			</aside>
			<aside className="cta">
				<button title="Copy link" onClick={handleCopyLink}>
					<Image
						src={
							copied
								? "/assets/images/checked.png"
								: "/assets/icons/link.svg"
						}
						alt="copy link"
						width={24}
						height={24}
					/>
				</button>
				{isOwner && (
					<div className="user-btn">
						<button
							className="delete-btn"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete Video"}
						</button>
						<div className="bar" />
						{isUpdating ? (
							<div className="update-stats">
								<p>Updating...</p>
							</div>
						) : (
							<DropdownList
								options={visibilities}
								selectedOption={visibilityState}
								onOptionSelect={handleVisibilityChange}
								triggerElement={TriggerVisibility()}
							/>
						)}
					</div>
				)}
			</aside>
		</header>
	);
};

export default VideoDetailHeader;
