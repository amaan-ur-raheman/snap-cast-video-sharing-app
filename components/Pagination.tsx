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

/* The `Pagination` component in the provided TypeScript React code snippet is responsible for
rendering a pagination UI element. Here's a breakdown of what the `Pagination` component does: 
1. It takes in props such as `currentPage`, `totalPages`, `queryString`, and `filterString`.
2. It uses the `generatePagination` function to generate an array of page numbers to display in the pagination component.
3. It uses the `useRouter` and `useSearchParams` hooks from Next.js to handle navigation and update the URL parameters.
4. It defines a `createPageUrl` function to generate URLs with updated pagination parameters.
5. It defines a `navigateToPage` function to handle page navigation and update the URL.
6. It renders a pagination UI with previous, next, and page number buttons.
7. It applies conditional styling to the buttons based on the current page and total pages.
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
