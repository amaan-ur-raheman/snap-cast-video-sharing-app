import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import { getTranscript, getVideoById } from "@/lib/actions/video";
import { redirect } from "next/navigation";

/**
 * Video detail page component that displays a specific video and its information
 * @param {Object} params - Route parameters containing videoId
 * @returns {JSX.Element} Video detail page with player, header and info components
 */
const Page = async ({ params }: Params) => {
	// Extract videoId from route params
	const { videoId } = await params;

	// Fetch video and associated user data
	const { user, video } = await getVideoById(videoId);

	// Redirect to 404 if video not found
	if (!video) redirect("/404");

	// Get video transcript
	const transcript = await getTranscript(videoId);

	return (
		<div className="wrapper page">
			{/* Video header with user/owner information */}
			<VideoDetailHeader
				{...video}
				userImg={user?.image}
				username={user?.name}
				ownerId={video.userId}
			/>
			<section className="video-details">
				<div className="content">
					{/* Video player component */}
					<VideoPlayer videoId={video.videoId} />
				</div>
				{/* Video metadata and transcript */}
				<VideoInfo
					transcript={transcript}
					title={video.title}
					createdAt={video.createdAt}
					description={video.description}
					videoId={videoId}
					videoUrl={video.videoUrl}
				/>
			</section>
		</div>
	);
};

export default Page;
