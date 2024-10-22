import type { JSXElement, ParentComponent } from "solid-js";

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
};

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => (
	<div class="group relative not-prose rounded-xl shadow-md border">
		<div class="absolute -inset-px rounded-xl border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-80" />

		<div class="relative overflow-hidden h-full w-full grow">
			<a href={props.href} target="_blank" rel="noreferrer">
				<span class="absolute -inset-px rounded-xl" />
			</a>

			<div class="flex items-center justify-center m-4">
				<div class="">
					<Dynamic component={() => props.icon} />
				</div>

				<p
					class={twMerge(
						"overflow-hidden whitespace-nowrap w-0",
						"bg-gradient-to-br from-sprout-400 to-sprout-700 bg-clip-text",
						"pointer-events-none select-none",
						"items-center no-underline font-semibold text-lg md:text-normal text-transparent",
						"group-hover:w-24 flex justify-center transition-all delay-300",
					)}
				>
					{props.title}
				</p>
			</div>
		</div>
	</div>
);
