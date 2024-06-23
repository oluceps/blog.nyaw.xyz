import { A, cache, createAsync } from "@solidjs/router";
import { type Component, Index, Show, Suspense } from "solid-js";
import cfg from "../constant";
import { docsData } from "solid:collection";

export const Arti: Component = () => {
	const ctx = createAsync(
		() =>
			cache(async () => {
				"use server";
				const t = docsData
					.map((i) => {
						return { ...i, date: new Date(i.date) };
					})
					.filter((i: any) => {
						const itemHideLvl = i.hideLevel || 5;
						return cfg.hideLevel < itemHideLvl && !i.draft;
					});

				// Convince v8.
				const o = new Map<number, typeof t>();
				let ty = Number.POSITIVE_INFINITY;
				for (const s of t) {
					const artiYear = s.date.getFullYear();
					if (artiYear < ty) {
						ty = artiYear;
						o.set(artiYear, [s]);
					} else {
						o.set(artiYear, Array.prototype.concat(o.get(artiYear), s));
					}
				}

				return o;
			}, "global-docData")(),
		{ deferStream: true },
	);

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
					{(data) => (
						<Index each={Array.from(data().keys())}>
							{(attr) => {
								return (
									<>
										<div class="text-lg 2xl:text-2xl font-bold font-normal text-slate-700 dark:text-chill-100">
											{attr()}
										</div>
										<Index each={data().get(attr())}>
											{(inner) => {
												return (
													<Suspense fallback="h-8 my-3 w-full skeleton">
														<div class="antialiased flex flex-col mx-3 md:mx-8 2xl:mx-12">
															<article class="flex overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
																<div class="no-underline font-light leading-snug font-mono text-slate-600 min-w-12">
																	{inner()
																		.date.toLocaleDateString("en-US", {
																			month: "2-digit",
																			day: "2-digit",
																		})
																		.toString()}
																</div>
																<A
																	href={`/${inner().path}`}
																	class="no-underline text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose"
																>
																	{inner().title}
																	<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
																</A>
															</article>

															<div class="flex justify-end">
																<Show
																	when={inner().categories.length !== 0}
																	fallback={<div class="h-4" />}
																>
																	<A
																		class="pl-6 text-xs 2xl:text-base text-slate-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
																		href={
																			"/taxonomy#" + inner().categories[0] || ""
																		}
																	>
																		{inner().categories[0] as string}
																		<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
																	</A>
																</Show>
															</div>
														</div>
													</Suspense>
												);
											}}
										</Index>
									</>
								);
							}}
						</Index>
					)}
				</Show>
			</Suspense>
		</>
	);
};
