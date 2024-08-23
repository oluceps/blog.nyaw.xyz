import { A } from "@solidjs/router";
import {
	type Component,
	For,
	Show,
	Suspense,
	createMemo,
	createSignal,
	onMount,
} from "solid-js";
import cfg from "../constant";
import { IconChevronLeft } from "@tabler/icons-solidjs";
import { useNavigate } from "@solidjs/router";

// export interface Data {
// 	title: string;
// 	date: Date;
// 	description?: string;
// 	draft?: boolean;
// 	featured_image?: string;
// 	categories?: Array<string>;
// 	tags?: Array<string>;
// 	toc?: boolean;
// 	hideLevel?: number;
// 	math?: boolean;
// 	noBanner?: boolean;
// }

const [showCate, setShowCate] = createSignal("");

import data from "../routes/data.json";
import { ReactiveMap } from "@solid-primitives/map";

export const ctxFiltered =
	data.map((i) => {
		return { ...i, date: new Date(i.date) };
	})
		.filter((i) => {
			return showCate() ? i.categories?.[0] === showCate() : true;
		})
		.filter((i) => {
			const itemHideLvl = i.hideLevel || 5;
			return cfg.hideLevel < itemHideLvl && !i.draft;
		})
	;


export const Arti: Component = () => {

	const orgByear = createMemo(() => {
		const o = new Map<number, typeof ctxFiltered>();
		let ty = Infinity;
		for (const s of ctxFiltered) {
			const artiYear = s.date.getFullYear();
			if (artiYear < ty) {
				ty = artiYear;
				o.set(artiYear, [s])
			} else {
				o.set(artiYear, Array.prototype.concat(o.get(artiYear), s))
			}
		}
		return o.values()
	})

	const navigate = useNavigate();

	return (
		<>
			<For
				each={Array.from(orgByear())}
			>
				{(attr) => {
					return (
						<For each={Array.from(attr.values())}>
							{(innerAttr, i) => {
								return (
									<Suspense fallback="h-8 my-3 w-full skeleton">
										<Show when={i() == 0}>
											<div class="text-lg 2xl:text-2xl font-bold font-normal text-slate-700 dark:text-chill-100">
												{innerAttr.date.getFullYear()}
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
														.format(innerAttr.date)
														.replace(/\s+/g, "_")}`}
													target="_blank"
													rel="noreferrer"
												>
													{innerAttr.date
														.toLocaleDateString("en-US", {
															month: "2-digit",
															day: "2-digit",
														})
														.toString()}
												</a>
												<A
													href={`/${innerAttr.path}`}
													class="no-underline text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose"
												>
													{innerAttr.title}
													<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
												</A>
											</article>

											<div class="flex justify-end">
												<Show when={innerAttr.categories} fallback={<div class="h-4" />}>
													<button
														class="pl-6 text-xs 2xl:text-base text-slate-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
														onClick={() => navigate("/taxonomy#" + innerAttr.categories?.[0])}
													>
														{innerAttr.categories?.[0]}
														<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
													</button>
												</Show>
											</div>
										</div>
									</Suspense>
								)
							}}
						</For>
					);
				}}
			</For>
		</>
	);
};
