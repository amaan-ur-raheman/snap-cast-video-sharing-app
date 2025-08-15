"use client";

import Image from "next/image";
import Link from "next/link";
import DropdownList from "./DropdownList";
import RecordScreen from "./RecordScreen";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { updateURLParams } from "@/lib/utils";
import ImageWIthFallback from "./ImageWIthFallback";
import { filterOptions } from "@/constants";

const Header = ({ title, subHeader, userImg }: SharedHeaderProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [searchQuery, setSearchQuery] = useState(
		searchParams.get("query") || ""
	);

	const [selectedFilter, setSelectedFilter] = useState(
		searchParams.get("filter") || "Most Recent"
	);

	useEffect(() => {
		setSearchQuery(searchParams.get("query") || "");
		setSelectedFilter(searchParams.get("filter") || "Most Recent");
	}, [searchParams]);

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			if (searchQuery !== searchParams.get("query")) {
				const url = updateURLParams(
					searchParams,
					{
						query: searchQuery || null,
					},
					pathname
				);

				router.push(url);
			}
		}, 500);

		return () => clearTimeout(debounceTimer);
	}, [searchParams, searchQuery, pathname, router]);

	/**
	 * The `handleFilterChange` function updates the selected filter, constructs a new URL with the
	 * updated filter parameter, and navigates to the new URL using the router.
	 * @param {string} filter - The `filter` parameter is a string that represents the filter value
	 * selected by the user. It is used to update the selected filter state and generate a new URL with
	 * the updated filter parameter for routing purposes.
	 */
	const handleFilterChange = (filter: string) => {
		setSelectedFilter(filter);
		const url = updateURLParams(
			searchParams,
			{
				filter: filter || null,
			},
			pathname
		);

		router.push(url);
	};

	/**
	 * The function `renderFilterTrigger` returns JSX elements for a filter trigger component in a
	 * TypeScript React application.
	 * @returns A JSX element representing a filter trigger component is being returned. It consists of a
	 * `<div>` element with the class name "filter-trigger" containing two child elements: a `<figure>`
	 * element with an `<Image>` component displaying a hamburger icon and the selected filter text, and
	 * another `<Image>` component displaying an arrow-down icon.
	 */
	const renderFilterTrigger = () => {
		return (
			<div className="filter-trigger">
				<figure>
					<Image
						src="/assets/icons/hamburger.svg"
						alt="filter"
						width={14}
						height={14}
					/>
					<span>{selectedFilter}</span>
				</figure>
				<Image
					src="/assets/icons/arrow-down.svg"
					alt="arrow-down"
					width={14}
					height={14}
				/>
			</div>
		);
	};

	return (
		<header className="header">
			<section className="header-container">
				<div className="details">
					{userImg && (
						<ImageWIthFallback
							src={userImg}
							alt="user"
							width={66}
							height={66}
							className="rounded-full"
						/>
					)}

					<article>
						<p>{subHeader}</p>
						<h1>{title}</h1>
					</article>
				</div>
				<aside>
					<Link href="/upload">
						<Image
							src="/assets/icons/upload.svg"
							alt="upload"
							width={16}
							height={16}
						/>
						<span>Upload a Video</span>
					</Link>
					<RecordScreen />
				</aside>
			</section>

			<section className="search-filter">
				<div className="search">
					<input
						type="text"
						placeholder="Search for videos, tags, folders..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Image
						src="/assets/icons/search.svg"
						alt="search"
						width={16}
						height={16}
					/>
				</div>

				<DropdownList
					options={filterOptions}
					selectedOption={selectedFilter}
					onOptionSelect={handleFilterChange}
					triggerElement={renderFilterTrigger()}
				/>
			</section>
		</header>
	);
};

export default Header;
