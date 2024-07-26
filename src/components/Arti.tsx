import { A } from "@solidjs/router";
import {
	type Component,
	For,
	Show,
	createResource,
	createSignal,
} from "solid-js";
import cfg from "../constant";
import { IconChevronLeft } from "@tabler/icons-solidjs";

export interface Data {
	title: string;
	date: Date;
	description?: string;
	draft?: boolean;
	featured_image?: string;
	categories?: Array<string>;
	tags?: Array<string>;
	toc?: boolean;
	hideLevel?: number;
	math?: boolean;
	noBanner?: boolean;
}

const [showCate, setShowCate] = createSignal("");

const switchCategories = (data: string) => {
	setShowCate(data);
};

const seeFull = () => {
	setShowCate("");
};

import data from "../routes/data.json"

export const Arti: Component = () => {


	const [ctx] = createSignal(
		new Set(
			data.map((i) => { return { ...i, date: new Date(i.date) } })
		));

	return (
		<>
			<For
				each={[...ctx()]
					.filter((item) => {
						return showCate()
							? item.categories?.[0] === showCate()
							: true;
					})
					.filter((item) => {
						const itemHideLvl = item.hideLevel || 5;
						return cfg.hideLevel < itemHideLvl && !item.draft;
					}) // rearange date basic on current content
					.map((item, index, arr) => {
						if (index === 0) {
							return { ...item, showYear: true };
						}
						return {
							...item,
							showYear: !(
								arr[index - 1].date.getFullYear() ===
								item.date.getFullYear()
							),
						};
					})}
			>
				{(attr) => {
					return (
						<>
							<Show when={attr.showYear}>
								<div class="text-lg 2xl:text-2xl font-bold font-normal text-slate-700 dark:text-chill-100">
									{attr.date.getFullYear()}
								</div>
							</Show>
							<div class="antialiased flex flex-col mx-3 md:mx-8 2xl:mx-12">
								<article class="flex overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
									<a
										class="no-underline mb-px font-extralight leading-loose font-mono text-slate-600 dark:text-chill-100 min-w-12"
										href={`https://en.wikipedia.org/wiki/${new Intl.DateTimeFormat(
											"en-US",
											{
												month: "long",
												day: "numeric",
												timeZone: "UTC",
											},
										)
											.format(attr.date)
											.replace(/\s+/g, "_")}`}
										target="_blank"
										rel="noreferrer"
									>
										{attr.date
											.toLocaleDateString("en-US", {
												month: "2-digit",
												day: "2-digit",
											})
											.toString()}
									</a>
									<A
										href={`/${attr.path}`}
										class="no-underline text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose"
									>
										{attr.title}
										<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
									</A>
								</article>

								<div class="flex justify-end">
									<Show when={attr.categories} fallback={<div class="h-4" />}>
										{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
										<button
											class="pl-6 text-xs 2xl:text-base text-slate-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
											onClick={[
												switchCategories,
												attr.categories?.[0],
											]}
										>
											{attr.categories?.[0]}
											<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
										</button>
									</Show>
								</div>
							</div>
						</>
					);
				}}
			</For>
			<Show when={showCate() !== ""}>
				<div class="w-full mt-4 flex items-center justify-center">
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button class="btn btn-square mx-auto" onClick={seeFull}>
						<IconChevronLeft color="#435833" />
					</button>
				</div>
			</Show>
		</>
	);
}
