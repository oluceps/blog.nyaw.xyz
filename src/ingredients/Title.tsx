import type { JSX, ParentProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

// Static maps so UnoCSS can extract class names at build time
const sizeByLevel: Record<number, string> = {
	1: "w-5 h-5",
	2: "w-4.5 h-4.5",
	3: "w-4 h-4",
	4: "w-3.5 h-3.5",
	5: "w-3 h-3",
};

const proseByLevel: Record<number, string> = {
	1: "prose-h1",
	2: "prose-h2",
	3: "prose-h3",
	4: "prose-h4",
	5: "prose-h5",
};

const Title = (
	props: ParentProps & { level: number; color: string; text: string },
) => {
	const levelPreBlockSizeStr = sizeByLevel[props.level] ?? "w-4 h-4";
	const baseHStyle = twMerge("flex justify-start items-center", proseByLevel[props.level] ?? "prose-h2");

	const Tag = `h${props.level}` as keyof JSX.IntrinsicElements;

	return (
		<Dynamic component={Tag} class={baseHStyle} id={props.text}>
			<div
				class={twMerge(
					"rounded-sm mr-2 mb-0.5 shadow-md",
					props.color,
					levelPreBlockSizeStr,
				)}
			/>
			<a
				class="heading anchor no-underline active"
				noScroll={true}
				href={`#${props.text}`}
				aria-current="page"
			>
				{props.children ? props.children : props.text}
			</a>
		</Dynamic>
	);
};

export default Title;
