"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * The `ImageWithFallback` component in TypeScript React renders an image with a fallback source in
 * case the primary source fails to load.
 * @param {ImageWithFallbackProps}  - The `ImageWithFallback` component takes the following parameters:
 * @returns The `ImageWithFallback` component is being returned. It is a functional component that
 * renders an `Image` component with fallback functionality. The component takes in props such as
 * `fallback`, `alt`, `src`, and spreads any additional props. It uses state to manage the error status
 * and the image source. If an error occurs while loading the image, it switches to the fallback image
 * source.
 */
const ImageWIthFallback = ({
	fallback = "/assets/images/dummy.jpg",
	alt,
	src,
	...props
}: ImageWithFallbackProps) => {
	const [error, setError] = useState<boolean | null>(null);
	const [imgSrc, setImgSrc] = useState<string>(src || fallback);

	useEffect(() => {
		setError(null);
		setImgSrc(src || fallback);
	}, [src, fallback]);

	return (
		<Image
			alt={alt}
			onError={() => setError(true)}
			src={error ? fallback : imgSrc}
			{...props}
		/>
	);
};

export default ImageWIthFallback;
