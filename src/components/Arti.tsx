import { A, cache, createAsync } from "@solidjs/router";
import { type Component, Index, Show, Suspense } from "solid-js";
import cfg from "../constant";
import { docsData } from "solid:collection";
import { useTaxoState } from "./PageState";

export const Arti: Component = () => {
	const ctx = createAsync(
		() =>
			cache(async () => {
				"use server";
				return docsData
					.map((i) => {
						return { ...i, date: new Date(i.date) };
					})
					.filter((i: any) => {
						// @ts-ignore
						if (import.meta.env.DEV) return true;
						const itemHideLvl = i.hideLevel || 5;
						return cfg.hideLevel < itemHideLvl && !i.draft;
					}).sort((a, b) => b.date > a.date ? 1 : -1);
			}, "global-docData")(),
		{ deferStream: true },
	);

	const { setTaxoInfo } = useTaxoState();
	return (
		<>
			<Suspense
				fallback={
					<div class="flex flex-col h-full items-center justify-center grow w-full">
						<div class="loading loading-infinity loading-lg text-sprout-300 " />
					</div>
				}
			>
				<Show when={ctx()}>
					{(data) => {
						let dataArray = Array.from(data());
						const getSeason = (d: Date) => Math.floor((d.getMonth() / 12 * 4)) % 4;
						let harvest: Array<number> = new Array();

						const HARVEST_LIMIT = 8;
						let count = 0;
						let prev = 0;
						for (const i of dataArray) {
							const theY = i.date.getFullYear();
							if (theY == prev) {
								count++
								if (count >= HARVEST_LIMIT) harvest.push(theY)
							} else {
								count = 0
							}
							prev = theY
						}
						return (
							<Index each={dataArray}>
								{(attr, idx) => {
									let prevArti = dataArray[idx - 1];
									let prevYear = prevArti?.date.getFullYear(); // newer
									let prevSeason = prevArti ? getSeason(prevArti.date) : undefined;

									const theY = attr().date.getFullYear();
									return (
										<>
											<Show when={prevYear !== theY}>
												<div class="text-lg 2xl:text-2xl font-sans font-normal text-slate-700 dark:text-chill-100">
													{attr().date.getFullYear().toString()}
												</div>
											</Show>
											<Show when={harvest.includes(theY) && prevSeason !== getSeason(attr().date)}>
												<div class="ml-1 md:ml-4 2xl:text-xl font-sans font-normal text-slate-700 dark:text-chill-100">
													{["春", "夏", "秋", "冬"][getSeason(attr().date)]}
												</div>
											</Show>
											<Suspense fallback="h-8 my-3 w-full skeleton">
												<div class="antialiased flex flex-col mx-3 md:mx-8 2xl:mx-12">
													<article class="flex overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
														<div class="no-underline font-sans font-light leading-snug text-slate-600 min-w-12">
															{attr()
																.date.toLocaleDateString("en-US", {
																	month: "2-digit",
																	day: "2-digit",
																})
																.toString()}
														</div>
														<A
															href={`/${attr().path}`}
															class="no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose"
														>
															{attr().title}
															<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
														</A>
													</article>

													<div class="flex justify-end">
														<Show
															when={attr().categories.length !== 0}
															fallback={<div class="h-4" />}
														>
															<A
																class="pl-6 text-xs 2xl:text-base text-slate-600 font-sans dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
																href="/taxonomy"
																onClick={() => setTaxoInfo({ id: attr().categories[0] as string })}
															>
																{attr().categories[0] as string}
																<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
															</A>
														</Show>
													</div>
												</div>
											</Suspense>
										</>
									);
								}}
							</Index>
						)
					}}
				</Show>
			</Suspense>
		</>
	);
};
