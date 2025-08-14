import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";
import { getAllVideosByUser } from "@/lib/actions/video";
import { redirect } from "next/navigation";

const Page = async ({ params, searchParams }: ParamsWithSearch) => {
	const { id } = await params;
	const { query, filter } = await searchParams;

	const { user, videos } = await getAllVideosByUser(id, query, filter);

	if (!user) redirect("/404");

	return (
		<div className="wrapper page">
			<Header
				title={user?.name || "Guest"}
				subHeader={user?.email}
				userImg={user?.image || "/assets/images/dummy.jpg"}
			/>

			{videos?.length > 0 ? (
				<section className="video-grid">
					{videos.map(({ video, user }) => (
						<VideoCard
							key={video.id}
							{...video}
							thumbnail={video.thumbnailUrl}
							userImg={user?.image || "/assets/images/dummy.jpg"}
							username={user?.name || "Guest"}
						/>
					))}
				</section>
			) : (
				<EmptyState
					icon="/assets/icons/video.svg"
					title="No videos Available Yet"
					description="Upload your first video to get started"
				/>
			)}
		</div>
	);
};

export default Page;
