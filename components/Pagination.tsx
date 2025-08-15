"use client";

import { cn, generatePagination, updateURLParams } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
	currentPage?: number;
	totalPages?: number;
	queryString?: string;
	filterString?: string;
};

/**
 * A responsive pagination component that enables navigation through paginated content.
 *
 * @component
 * @param {Object} props
 * @param {number} [props.currentPage=1] - The currently active page number
 * @param {number} [props.totalPages=10] - Total number of available pages
 * @param {string} [props.queryString=""] - Search query parameter to maintain in pagination URLs
 * @param {string} [props.filterString=""] - Filter parameter to maintain in pagination URLs
 * 
 * @example
 * ```tsx
 * <Pagination 
 *   currentPage={2}
 *   totalPages={10}
 *   queryString="search-term"
 *   filterString="category=books"
 * />
 * ```
 * 
 * @returns A pagination component with previous/next buttons and page numbers
 */
const Pagination = ({
	currentPage = 1,
	totalPages = 10,
	queryString = "",
	filterString = "",
}: PaginationProps) => {
	const pages = generatePagination(currentPage, totalPages);
	const router = useRouter();
	const searchParams = useSearchParams();

	/**
	 * The function `createPageUrl` generates a URL with updated parameters for pagination in a TypeScript
	 * React application.
	 * @param {number} pageNumber - The `pageNumber` parameter is a number that represents the page number
	 * for which you want to create a URL. This function `createPageUrl` takes this page number as input
	 * and generates a URL with updated search parameters including the page number, query, and filter.
	 * @returns The `createPageUrl` function is returning the result of calling the `updateURLParams`
	 * function with the `searchParams`, an object containing `page`, `query`, and `filter` properties,
	 * and `"/"` as arguments. The `updateURLParams` function likely updates the URL parameters with the
	 * provided values and returns the updated URL.
	 */
	const createPageUrl = (pageNumber: number) => {
		return updateURLParams(
			searchParams,
			{
				page: pageNumber.toString(),
				query: queryString?.trim() || null,
				filter: filterString || null,
			},
			"/"
		);
	};

	/**
	 * The navigateToPage function takes a page number as input and navigates to the corresponding page
	 * URL if it is within the valid range.
	 * @param {number} pageNumber - The `pageNumber` parameter is a number that represents the page number
	 * to which the user wants to navigate.
	 * @returns If the `pageNumber` is less than 1 or greater than `totalPages`, nothing is being returned
	 * explicitly. The function will exit early without performing any further actions.
	 */
	const navigateToPage = (pageNumber: number) => {
		if (pageNumber < 1 || pageNumber > totalPages) return;
		router.push(createPageUrl(pageNumber));
	};

	return (
		<section className="pagination">
			<button
				onClick={() => navigateToPage(currentPage - 1)}
				className={cn("nav-button", {
					"pointer-events-none opacity-50": currentPage === 1,
				})}
				disabled={currentPage == 1}
				aria-disabled={currentPage === 1}
			>
				<Image
					src="/assets/icons/arrow-left.svg"
					alt="Previous Page"
					width={16}
					height={16}
				/>
				Previous
			</button>

			<div>
				{pages.map((page, index) =>
					page === "..." ? (
						<span key={`ellipse-${index}`}>...</span>
					) : (
						<button
							key={`page-${index}`}
							onClick={() => navigateToPage(page as number)}
							className={cn({
								"bg-pink-100 text-white": currentPage === page,
							})}
						>
							{page}
						</button>
					)
				)}
			</div>

			<button
				onClick={() => navigateToPage(currentPage + 1)}
				className={cn("nav-button", {
					"pointer-events-none opacity-50":
						currentPage === totalPages,
				})}
				disabled={currentPage == totalPages}
				aria-disabled={currentPage === totalPages}
			>
				Next
				<Image
					src="/assets/icons/arrow-right.svg"
					alt="Next Page"
					width={16}
					height={16}
				/>
			</button>
		</section>
	);
};

export default Pagination;
