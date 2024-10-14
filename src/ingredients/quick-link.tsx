import { type JSXElement, type ParentComponent, Show } from "solid-js";

import { Dynamic } from "solid-js/web";

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
	return (
		<div class="group relative rounded-xl shadow-md border">
			<div class="absolute -inset-px rounded-xl border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-80" />

			<div class="relative overflow-hidden h-full w-full grow">
				<a href={props.href} target="_blank">
					<span class="absolute -inset-px rounded-xl" />
				</a>
				<div class="m-4">
					<div class="flex w-full grow justify-center items-center overflow-visible">
						<div class="flex justify-between items-center">
							<Dynamic component={() => props.icon} />
							<Show when={!props.onlyIcon}>
								<div class="group">
									<p
										class="absolute whitespace-nowrap pointer-events-none select-none group-hover:relative shrink grow justify-end pl-4 items-center no-underline font-semibold bg-gradient-to-br from-sprout-400 to-sprout-700 text-transparent bg-clip-text text-lg md:text-normal w-full invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-200"
									>
										{props.title}
									</p>
								</div>
							</Show>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
