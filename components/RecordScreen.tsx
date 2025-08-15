"use client";

import { ICONS } from "@/constants";
import { useScreenRecording } from "@/lib/hooks/useScreenRecording";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/**
 * A React component that provides screen recording functionality with a modal interface.
 * Features include:
 * - Starting/stopping screen recording
 * - Previewing recorded video
 * - Re-recording capability
 * - Upload functionality for recorded videos
 * - Recording duration tracking
 * - Modal-based UI with proper state management
 *
 * Uses the custom useScreenRecording hook to handle core recording operations.
 */
const RecordScreen = () => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const {
		isRecording,
		recordedBlob,
		recordedVideoUrl,
		recordingDuration,
		startRecording,
		stopRecording,
		resetRecording,
	} = useScreenRecording();

	/**
	 * The `closeModal` function resets recording and sets the `isOpen` state to false.
	 */
	const closeModal = () => {
		resetRecording();
		setIsOpen(false);
	};

	/**
	 * The `handleStart` function asynchronously starts recording.
	 */
	const handleStart = async () => {
		await startRecording();
	};

	/**
	 * The function `recordAgain` resets and starts recording, then updates the video source if a recorded
	 * video URL is available.
	 */
	const recordAgain = async () => {
		resetRecording();
		await startRecording();

		if (recordedVideoUrl && videoRef.current) {
			videoRef.current.src = recordedVideoUrl;
		}
	};

	/**
	 * The function `goToUpload` prepares a recorded video for upload by storing its details in
	 * sessionStorage and then navigating to the upload page.
	 * @returns If the `recordedBlob` is falsy (e.g., `null`, `undefined`, `false`, `0`, `""`), the
	 * function `goToUpload` will return early without executing the rest of the code block.
	 */
	const goToUpload = () => {
		if (!recordedBlob) return;

		const url = URL.createObjectURL(recordedBlob);

		sessionStorage.setItem(
			"recordedVideo",
			JSON.stringify({
				url,
				name: "screen-recording-webm",
				type: recordedBlob.type,
				size: recordedBlob.size,
				duration: recordingDuration || 0,
			})
		);

		router.push("/upload");
		closeModal();
	};

	return (
		<div className="record">
			<button className="primary-btn" onClick={() => setIsOpen(true)}>
				<Image src={ICONS.record} alt="record" width={16} height={16} />
				<span className="truncate">Record a Video</span>
			</button>

			{isOpen && (
				<section className="dialog">
					<div className="overlay-record" onClick={closeModal} />
					<div className="dialog-content">
						<figure>
							<h3>Screen Recording</h3>
							<button onClick={closeModal} title="Close Modal">
								<Image
									src={ICONS.close}
									alt="close"
									width={20}
									height={20}
								/>
							</button>
						</figure>

						<section>
							{isRecording ? (
								<article>
									<div />
									<span>Recording in progress...</span>
								</article>
							) : recordedVideoUrl ? (
								<video
									src={recordedVideoUrl}
									ref={videoRef}
									controls
								/>
							) : (
								<p>
									Click record to start capturing your screen
								</p>
							)}
						</section>

						<div className="record-box">
							{!isRecording && !recordedVideoUrl && (
								<button
									onClick={handleStart}
									className="record-start"
								>
									<Image
										src={ICONS.record}
										alt="record"
										width={16}
										height={16}
									/>
									Record
								</button>
							)}
							{isRecording && (
								<button
									onClick={stopRecording}
									className="record-stop"
								>
									<Image
										src={ICONS.record}
										alt="record"
										width={16}
										height={16}
									/>
									Stop Recording
								</button>
							)}
							{recordedVideoUrl && (
								<>
									<button
										onClick={recordAgain}
										className="record-again"
									>
										Record Again
									</button>
									<button
										onClick={goToUpload}
										className="record-upload"
									>
										<Image
											src={ICONS.upload}
											alt="upload"
											width={16}
											height={16}
										/>
										Continue to Upload
									</button>
								</>
							)}
						</div>
					</div>
				</section>
			)}
		</div>
	);
};

export default RecordScreen;
