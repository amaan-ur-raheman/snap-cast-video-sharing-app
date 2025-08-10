import Header from "@/components/Header";

const Page = async ({ params }: ParamsWithSearch) => {
	const { id } = await params;

	return (
		<div className="wrapper page">
			<Header
				title="Glen Smith"
				subHeader="glensmith@mail.com"
				userImg="/assets/images/david.png"
			/>
			<h1 className="text-2xl font-karla font-bold">USER ID: {id}</h1>
		</div>
	);
};

export default Page;
