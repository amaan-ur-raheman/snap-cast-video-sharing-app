import { useState, useRef, useEffect } from "react";
import {
	getMediaStreams,
	createAudioMixer,
	setupRecording,
	cleanupRecording,
	createRecordingBlob,
	calculateRecordingDuration,
} from "@/lib/utils";

/**
 * The `useScreenRecording` function in TypeScript manages screen recording functionality, including
 * starting, stopping, and resetting the recording.
 * @returns The `useScreenRecording` custom hook is being returned, which provides functionality for
 * screen recording such as starting, stopping, and resetting the recording, as well as maintaining the
 * state of the recording including the recorded blob, video URL, and duration.
 */
export const useScreenRecording = () => {
	const [state, setState] = useState<BunnyRecordingState>({
		isRecording: false,
		recordedBlob: null,
		recordedVideoUrl: "",
		recordingDuration: 0,
	});

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<ExtendedMediaStream | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const audioContextRef = useRef<AudioContext | null>(null);
	const startTimeRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			stopRecording();
			if (state.recordedVideoUrl)
				URL.revokeObjectURL(state.recordedVideoUrl);

            if (audioContextRef.current?.state !== "closed") {
                audioContextRef.current?.close().catch(console.error);
            }

            audioContextRef.current = null;
		};
	}, [state.recordedVideoUrl]);

	/**
     * The `handleRecordingStop` function stops the recording, creates a blob and URL from the recorded
     * chunks, calculates the recording duration, and updates the state with the recorded blob, video URL,
     * duration, and sets `isRecording` to false.
     */
    const handleRecordingStop = () => {
		const { blob, url } = createRecordingBlob(chunksRef.current);
		const duration = calculateRecordingDuration(startTimeRef.current);

		setState((prev) => ({
			...prev,
			recordedBlob: blob,
			recordedVideoUrl: url,
			recordingDuration: duration,
			isRecording: false,
		}));
	};

	/**
     * The `startRecording` function asynchronously starts recording audio and video streams, combining
     * them into a single stream for recording purposes.
     * @param [withMic=true] - The `withMic` parameter in the `startRecording` function is a boolean
     * parameter that determines whether to include microphone audio in the recording. By default, if no
     * value is provided for `withMic`, it is set to `true`. If `withMic` is `true`, the function will
     * @returns The `startRecording` function returns a boolean value - `true` if the recording process
     * was started successfully, and `false` if there was an error during the process.
     */
    const startRecording = async (withMic = true) => {
		try {
			stopRecording();

			const { displayStream, micStream, hasDisplayAudio } =
				await getMediaStreams(withMic);
			const combinedStream = new MediaStream() as ExtendedMediaStream;

			displayStream
				.getVideoTracks()
				.forEach((track: MediaStreamTrack) =>
					combinedStream.addTrack(track)
				);

			audioContextRef.current = new AudioContext();
			const audioDestination = createAudioMixer(
				audioContextRef.current,
				displayStream,
				micStream,
				hasDisplayAudio
			);

			audioDestination?.stream
				.getAudioTracks()
				.forEach((track: MediaStreamTrack) =>
					combinedStream.addTrack(track)
				);

			combinedStream._originalStreams = [
				displayStream,
				...(micStream ? [micStream] : []),
			];
			streamRef.current = combinedStream;

			mediaRecorderRef.current = setupRecording(combinedStream, {
				onDataAvailable: (e) =>
					e.data.size && chunksRef.current.push(e.data),
				onStop: handleRecordingStop,
			});

			chunksRef.current = [];
			startTimeRef.current = Date.now();
			mediaRecorderRef.current.start(1000);
			setState((prev) => ({ ...prev, isRecording: true }));
			return true;
		} catch (error) {
			console.error("Recording error:", error);
			return false;
		}
	};

	/**
     * The `stopRecording` function cleans up the recording resources and updates the state to indicate
     * that recording has stopped.
     */
    const stopRecording = () => {
		cleanupRecording(
			mediaRecorderRef.current,
			streamRef.current,
			streamRef.current?._originalStreams
		);
		streamRef.current = null;
		setState((prev) => ({ ...prev, isRecording: false }));
	};

	/**
     * The `resetRecording` function stops recording, revokes the recorded video URL, resets state
     * variables, and clears the recording duration.
     */
    const resetRecording = () => {
		stopRecording();
		if (state.recordedVideoUrl) URL.revokeObjectURL(state.recordedVideoUrl);
		setState({
			isRecording: false,
			recordedBlob: null,
			recordedVideoUrl: "",
			recordingDuration: 0,
		});
		startTimeRef.current = null;
	};

	return {
		...state,
		startRecording,
		stopRecording,
		resetRecording,
	};
};
