"use client";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import ImageWIthFallback from "./ImageWIthFallback";

/**
 * Navigation bar component that provides the main app header and authentication controls
 * @component
 * @returns {JSX.Element} A header element containing the navigation bar with authentication controls
 */
const Navbar = () => {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<header className="navbar">
			<nav>
				<Link href="/">
					<Image
						src="/assets/icons/logo.svg"
						alt="logo"
						width={32}
						height={32}
					/>
					<h1>SnapCast</h1>
				</Link>

				{user && (
					<figure>
						<button
							title="User"
							onClick={() => router.push(`/profile/${user?.id}`)}
						>
							<ImageWIthFallback
								src={user?.image ?? ""}
								alt="User"
								width={36}
								height={36}
								className="rounded-full aspect-square"
							/>
						</button>
						<button
							title="Logout"
							className="cursor-pointer"
							onClick={async () => {
								return await authClient.signOut({
									fetchOptions: {
										onSuccess: () => {
											redirect("/sign-in");
										},
									},
								});
							}}
						>
							<Image
								src="/assets/icons/logout.svg"
								alt="Logout"
								width={24}
								height={24}
								className="rotate-180"
							/>
						</button>
					</figure>
				)}
			</nav>
		</header>
	);
};

export default Navbar;
