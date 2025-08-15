import Image from "next/image";

/**
 * The `EmptyState` component in TypeScript React renders an empty state message with an icon, title,
 * and description.
 * @param {EmptyStateProps}  - The `EmptyState` component takes in three props: `icon`, `title`, and
 * `description`. These props are of type `EmptyStateProps`. The component renders an empty state
 * section with an icon, title, and description. The `icon` prop is used as the image source, the
 * @returns The `EmptyState` component is being returned. It is a functional component that renders an
 * empty state section with an icon, title, and description.
 */
const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
	return (
		<section className="empty-state">
			<figure>
				<Image src={icon} alt={title} width={46} height={46} />
			</figure>
			<article>
				<h1>{title}</h1>
				<p>{description}</p>
			</article>
		</section>
	);
};

export default EmptyState;
