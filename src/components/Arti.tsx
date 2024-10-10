import { A, cache, createAsync } from "@solidjs/router";
import { type Component, Index, Show, Suspense } from "solid-js";
import cfg from "../constant";
import { docsData } from "solid:collection";
import { useTaxoState } from "./PageState";
import { twMerge } from "tailwind-merge";

export const preprocessed =
	Promise.all(docsData.map(async (i) => {
		// Convert date
		const updatedItem = { ...i, date: new Date(i.date) };
		const toComp = cfg.hideLevel;
		const shouldInclude =
			toComp < updatedItem.hideLevel && !updatedItem.draft;
		// @ts-expect-error missing types
		if (import.meta.env.DEV) {
			return updatedItem
		}
		return shouldInclude ? updatedItem : null;
	})).then(res => res
		.filter((i) => i !== null)
		.sort((a, b) => (b.date > a.date ? 1 : -1))
	)

export const Arti: Component = () => {

	const ctx = createAsync(
		() =>
			cache(async () => {
				"use server";
				// Filter out null values and sort
				return await preprocessed;
			}, "docData")(),
		{ deferStream: true },
	);

	const { setTaxoInfo } = useTaxoState();
	return (
		<>
			<Suspense
				fallback={
					<div class="flex flex-col h-full items-center justify-center grow w-full">
						<div class="i-svg-spinners-blocks-shuffle-3 text-sprout-300 w-6 h-6" />
					</div>
				}
			>
				<Show when={ctx()
					// ?.filter((n) => {
					// 	if (!limit()) return true
					// 	if (n.hideLevel > 9) return true
					// 	return false
					// })
				}>
					{(data) => {
						const dataArray = Array.from(data());
						const getSeason = (d: Date) =>
							Math.floor((d.getMonth() / 12) * 4) % 4;
						const harvest: Array<number> = new Array();

						const HARVEST_LIMIT = 8;
						let count = 0;
						let prev = 0;
						for (const i of dataArray) {
							const theY = i.date.getFullYear();
							if (theY == prev) {
								count++;
								if (count >= HARVEST_LIMIT) harvest.push(theY);
							} else {
								count = 0;
							}
							prev = theY;
						}
						return (
							<Index each={dataArray}>
								{(attr, idx) => {
									const prevArti = dataArray[idx - 1];
									const prevYear = prevArti?.date.getFullYear(); // newer
									const prevSeason = prevArti
										? getSeason(prevArti.date)
										: undefined;

									const theY = attr().date.getFullYear();
									return (
										<>
											<Show when={prevYear !== theY}>
												<div class="text-lg 2xl:text-2xl font-sans font-normal text-slate-700 dark:text-chill-100">
													{attr().date.getFullYear().toString()}
												</div>
											</Show>
											<Show
												when={
													harvest.includes(theY) &&
													prevSeason !== getSeason(attr().date)
												}
											>
												<div class="ml-1 md:ml-4 2xl:text-xl font-sans font-normal text-slate-500 dark:text-chill-100">
													{["冬", "春", "夏", "秋"][getSeason(attr().date)]}
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
															class={twMerge(
																"no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose",
																// attr().draft ? "text-slate-400" : "",
															)}
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
																onClick={() =>
																	setTaxoInfo({
																		id: attr().categories[0] as string,
																	})
																}
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
						);
					}}
				</Show>
			</Suspense>
		</>
	);
};
