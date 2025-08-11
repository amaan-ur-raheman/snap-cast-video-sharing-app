"use client";

import FileInput from "@/components/FileInput";
import FormField from "@/components/FormField";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { ChangeEvent, FormEvent, useState } from "react";

const Page = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		visibility: "public",
	});

	const video = useFileInput(MAX_VIDEO_SIZE);
	const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

	const [error, setError] = useState("");

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);

		try {
			if (!video.file || !thumbnail.file) {
				setError("Please upload a video and thumbnail");
				return;
			}

			if (!formData.title || !formData.description) {
				setError("Please fill in all fields");
				return;
			}

			// Upload file to bunny
			// Upload file to DB
			// Attach thumbnail
			// Create a new DB entry for the video details (urls, data)
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="wrapper-md upload-page">
			<h1>Upload a Video</h1>

			{error && <div className="error-field">{error}</div>}

			<form
				action=""
				className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5"
				onSubmit={handleSubmit}
			>
				<FormField
					id="title"
					label="Title"
					placeholder="Enter a clear and concise video title"
					value={formData.title}
					onChange={handleInputChange}
				/>

				<FormField
					id="description"
					label="Description"
					placeholder="Briefly describe what this video is about"
					as="textarea"
					value={formData.description}
					onChange={handleInputChange}
				/>

				<FileInput
					id="video"
					label="Video"
					accept="video/*"
					file={video.file}
					previewUrl={video.previewUrl}
					inputRef={video.inputRef}
					onChange={video.handleFileChange}
					onReset={video.resetFile}
					type="video"
				/>

				<FileInput
					id="thumbnail"
					label="Thumbnail"
					accept="image/*"
					file={thumbnail.file}
					previewUrl={thumbnail.previewUrl}
					inputRef={thumbnail.inputRef}
					onChange={thumbnail.handleFileChange}
					onReset={thumbnail.resetFile}
					type="image"
				/>

				<FormField
					id="visibility"
					label="Visibility"
					as="select"
					options={[
						{ value: "public", label: "Public" },
						{ value: "private", label: "Private" },
					]}
					value={formData.visibility}
					onChange={handleInputChange}
				/>

				<button
					type="submit"
					disabled={isSubmitting}
					className="submit-button"
				>
					{isSubmitting ? "Uploading..." : "Upload a Video"}
				</button>
			</form>
		</div>
	);
};

export default Page;
