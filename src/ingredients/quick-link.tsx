import { A } from "@solidjs/router";
import { createEffect, type JSXElement, type ParentComponent, Show } from "solid-js";

import { Dynamic } from "solid-js/web";

export const isExternalURL = (url: string) =>
	url.startsWith("https:") || url.startsWith("mailto:");

export type QuickLinksProps = {
	title: string;
	href: string;
	description?: string;
	children?: JSXElement;
	onlyIcon?: boolean;
};


const icons = {
	Matrix: () => (
		<svg
			fill="#8dab70"
			stroke-width="0"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1024 1024"
			style="overflow: visible; color: currentcolor;"
			height="24px"
			width="24px"
		>
			<path d="M872 394c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8H708V152c0-4.4-3.6-8-8-8h-64c-4.4 0-8 3.6-8 8v166H400V152c0-4.4-3.6-8-8-8h-64c-4.4 0-8 3.6-8 8v166H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h168v236H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h168v166c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V706h228v166c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V706h164c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8H708V394h164zM628 630H400V394h228v236z"></path>
		</svg>
	),
	Mailbox: () => (
		<svg
			fill="#8dab70"
			stroke-width="0"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			style="overflow: visible; color: currentcolor;"
			height="20px"
			width="20px"
		>
			<path d="M15.61 12c0 1.99-1.62 3.61-3.61 3.61-1.99 0-3.61-1.62-3.61-3.61 0-1.99 1.62-3.61 3.61-3.61 1.99 0 3.61 1.62 3.61 3.61M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12c2.424 0 4.761-.722 6.76-2.087l.034-.024-1.617-1.879-.027.017A9.494 9.494 0 0 1 12 21.54c-5.26 0-9.54-4.28-9.54-9.54 0-5.26 4.28-9.54 9.54-9.54 5.26 0 9.54 4.28 9.54 9.54a9.63 9.63 0 0 1-.225 2.05c-.301 1.239-1.169 1.618-1.82 1.568-.654-.053-1.42-.52-1.426-1.661V12A6.076 6.076 0 0 0 12 5.93 6.076 6.076 0 0 0 5.93 12 6.076 6.076 0 0 0 12 18.07a6.02 6.02 0 0 0 4.3-1.792 3.9 3.9 0 0 0 3.32 1.805c.874 0 1.74-.292 2.437-.821.719-.547 1.256-1.336 1.553-2.285.047-.154.135-.504.135-.507l.002-.013c.175-.76.253-1.52.253-2.457 0-6.617-5.383-12-12-12"></path>
		</svg>
	),
	Telegram: () => (
		<svg
			fill="#8dab70"
			stroke-width="0"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			style="overflow: visible; color: currentcolor;"
			height="24px"
			width="24px"
		>
			<path d="M20.56 3.34a1 1 0 0 0-1-.08l-17 8a1 1 0 0 0-.57.92 1 1 0 0 0 .6.9L8 15.45v6.72L13.84 18l4.76 2.08a.93.93 0 0 0 .4.09 1 1 0 0 0 .52-.15 1 1 0 0 0 .48-.79l1-15a1 1 0 0 0-.44-.89ZM18.1 17.68l-5.27-2.31L16 9.17l-7.65 4.25-2.93-1.29 13.47-6.34Z"></path>
		</svg>
	),
	Pubkey: () => (
		<svg
			fill="#8dab70"
			stroke-width="0"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1024 1024"
			style="overflow: visible; color: currentcolor;"
			height="24px"
			width="24px"
		>
			<path d="M608 112c-167.9 0-304 136.1-304 304 0 70.3 23.9 135 63.9 186.5l-41.1 41.1-62.3-62.3a8.15 8.15 0 0 0-11.4 0l-39.8 39.8a8.15 8.15 0 0 0 0 11.4l62.3 62.3-44.9 44.9-62.3-62.3a8.15 8.15 0 0 0-11.4 0l-39.8 39.8a8.15 8.15 0 0 0 0 11.4l62.3 62.3-65.3 65.3a8.03 8.03 0 0 0 0 11.3l42.3 42.3c3.1 3.1 8.2 3.1 11.3 0l253.6-253.6A304.06 304.06 0 0 0 608 720c167.9 0 304-136.1 304-304S775.9 112 608 112zm161.2 465.2C726.2 620.3 668.9 644 608 644c-60.9 0-118.2-23.7-161.2-66.8-43.1-43-66.8-100.3-66.8-161.2 0-60.9 23.7-118.2 66.8-161.2 43-43.1 100.3-66.8 161.2-66.8 60.9 0 118.2 23.7 161.2 66.8 43.1 43 66.8 100.3 66.8 161.2 0 60.9-23.7 118.2-66.8 161.2z"></path>
		</svg>
	),
};

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
	return (
		<div class="group relative rounded-xl shadow-md border">
			<div class="absolute -inset-px rounded-xl border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-80" />

			<div class="relative overflow-hidden h-full w-full grow">
				<a href={props.href}><span class="absolute -inset-px rounded-xl" /></a>
				<div class="m-4">
					<div class="flex w-full grow justify-start lg:justify-center items-center overflow-hidden">
						<Dynamic component={icons[props.title as keyof typeof icons]} />
						<Show when={!props.onlyIcon}>
							<p class="flex shrink grow pl-2 pr-5 sm:pr-0 justify-center sm:justify-start items-center no-underline font-semibold bg-gradient-to-br from-sprout-400 to-sprout-700 inline-block text-transparent bg-clip-text text-lg md:text-normal w-full">
								{props.title}
							</p>
						</Show>
					</div>
					<Show when={!props.onlyIcon}>
						<Show when={props.description}>
							{s =>
								<div class="text-slate-500 ml-1">
									{s()}
								</div>
							}
						</Show>
						<Show when={props.children}>
							{s => <div class="px-1">
								{s()}
							</div>}
						</Show>
					</Show>
				</div>
			</div>

		</div>
	);
};
