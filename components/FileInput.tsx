import Image from "next/image";

/**
 * FileInput Component
 * 
 * A reusable file input component that handles both image and video uploads.
 * 
 * @component
 * @param {object} props
 * @param {string} props.id - Unique identifier for the input element
 * @param {string} props.label - Label text for the input
 * @param {string} props.accept - Accepted file types (e.g. "image/*", "video/*")
 * @param {File} props.file - Currently selected file object
 * @param {string} props.previewUrl - URL for previewing the selected file
 * @param {React.RefObject<HTMLInputElement>} props.inputRef - Reference to the input element
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Handler for file selection
 * @param {() => void} props.onReset - Handler for removing the selected file
 * @param {"image" | "video"} props.type - Type of file input (image or video)
 * 
 * @returns {JSX.Element} A file input component with preview functionality
 * 
 * @example
 * <FileInput
 *   id="avatar"
 *   label="Upload Avatar"
 *   accept="image/*"
 *   type="image"
 *   inputRef={inputRef}
 *   onChange={handleFileChange}
 *   onReset={handleReset}
 * />
 */
const FileInput = ({
	id,
	label,
	accept,
	file,
	previewUrl,
	inputRef,
	onChange,
	onReset,
	type,
}: FileInputProps) => (
	<section className="file-input">
		<label htmlFor={id}>{label}</label>
		<input
			type="file"
			id={id}
			accept={accept}
			hidden
			ref={inputRef}
			onChange={onChange}
		/>

		{!previewUrl ? (
			<figure onClick={() => inputRef.current?.click()}>
				<Image
					src="/assets/icons/upload.svg"
					alt="Upload Icon"
					width={24}
					height={24}
				/>
				<p>click to upload your {id}</p>
			</figure>
		) : (
			<div>
				{type === "video" ? (
					<video src={previewUrl} controls />
				) : (
					<Image src={previewUrl} alt={`Selected ${id}`} fill />
				)}
				<button type="button" onClick={onReset} title="Remove File">
					<Image
						src="/assets/icons/close.svg"
						alt="Close Icon"
						width={16}
						height={16}
					/>
				</button>
				<p>{file?.name}</p>
			</div>
		)}
	</section>
);

export default FileInput;
