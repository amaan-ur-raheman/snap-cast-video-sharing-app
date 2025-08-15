/* This code defines a functional component named `FormField` in TypeScript with React. The component
takes in several props as an object destructuring assignment: */
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

/**
 * The `DropdownList` component is a functional component in TypeScript React that creates a dropdown
 * list with options. Here's a breakdown of what the component does:
 * @param {DropdownListProps} props - The `props` parameter in the `DropdownList` component is an object
 * that contains the following properties:
 * @property {string[]} options - The `options` property in the `DropdownList` component is an array of
 * strings that represents the options to be displayed in the dropdown list.
 * @property {string} selectedOption - The `selectedOption` property in the `DropdownList` component is a
 * string that represents the currently selected option in the dropdown list.
 * @property {(option: string) => void} onOptionSelect - The `onOptionSelect` property in the
 * `DropdownList` component is a function that is called when an option is selected from the dropdown
 * list. It takes a single parameter `option` of type `string`, which represents the selected option.
 * @property {ReactNode} triggerElement - The `triggerElement` property in the `DropdownList` component
 * is a React node that represents the element that will be used as the trigger to open the dropdown
 * list. This can be any valid React element, such as a button, icon, or custom component.
 * @returns The `DropdownList` component is returning a JSX element. It renders a dropdown list with
 * options, a trigger element to open the dropdown, and handles the selection of an option. The
 * dropdown list is conditionally rendered based on the `isOpen` state variable. When the trigger
 * element is clicked, the `isOpen` state is toggled, and the selected option is passed to the
 * `onOptionSelect` function. The selected option is also highlighted with a background color if it
 * matches the `selectedOption` prop.
 */
const DropdownList = ({
	options,
	selectedOption,
	onOptionSelect,
	triggerElement,
}: DropdownListProps) => {
	const [isOpen, setIsOpen] = useState(false);

	/**
	 * The function `handleOptionClick` takes a string parameter `option`, calls `onOptionSelect` with
	 * that parameter, and then sets `isOpen` to false.
	 * @param {string} option - The `option` parameter in the `handleOptionClick` function is a string
	 * that represents the option that was clicked by the user.
	 */
	const handleOptionClick = (option: string) => {
		onOptionSelect(option);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
				{triggerElement}
			</div>

			{isOpen && (
				<ul className="dropdown">
					{options.map((option) => (
						<li
							key={option}
							className={cn("list-item", {
								"bg-pink-100 text-white":
									selectedOption === option,
							})}
							onClick={() => handleOptionClick(option)}
						>
							{option}
							{selectedOption === option && (
								<Image
									src="/assets/icons/check.svg"
									alt="check"
									width={16}
									height={16}
								/>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default DropdownList;
