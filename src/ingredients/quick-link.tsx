import { createMemo, createSignal, type JSXElement, onCleanup, type ParentComponent, Show } from "solid-js";

import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

export const isExternalURL = (url: string) =>
	url.startsWith("https:") || url.startsWith("mailto:");

export type QuickLinksProps = {
	title: string;
	href: string;
	icon: JSXElement;
	description?: string;
	children?: JSXElement;
	onlyIcon?: boolean;
};


export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
	const [isShow, setIsRelative] = createSignal(false);
	const [innerW, setInnerW] = createSignal(0);
	let timeoutId: any;
	let intervalId: any;
	const handleMouseEnter = () => {
		timeoutId = setTimeout(() => {
			setIsRelative(true);
		}, 450);
		intervalId = setInterval(() => {
			setInnerW(prev => prev < 100 ? prev + 1 : 100)
			console.log(innerW())
		}, 50)
	};

	const handleMouseLeave = () => {
		clearTimeout(timeoutId);
		setIsRelative(false);
		clearTimeout(intervalId);
		setInnerW(0);
	};

	// const innerWText = createMemo(() => `w-[${innerW()}%]`);

	onCleanup(() => clearTimeout(timeoutId));

	// <a href={props.href} target="_blank">
	// 	<span class="absolute -inset-px rounded-xl" />
	// </a>
	return (
		<div class="group relative not-prose rounded-xl shadow-md border" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<div class="absolute -inset-px rounded-xl border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-80" />

			<div class="relative overflow-hidden h-full w-full grow">
				<div class="flex items-center justify-center m-4">
					<div class="">
						<Dynamic component={() => props.icon} />
					</div>
					<Show when={!props.onlyIcon}>
						<p
							class={twMerge(
								"overflow-hidden whitespace-nowrap ",
								"bg-gradient-to-br from-sprout-400 to-sprout-700 bg-clip-text",
								"pointer-events-none select-none",
								"items-center no-underline font-semibold text-lg md:text-normal text-transparent pl-2"
							)}
							style={{ width: `${innerW()}%` }}
						>
							{props.title}
						</p>
					</Show>

				</div>
			</div>
		</div>
	);
};
