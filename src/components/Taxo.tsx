import { createSignal, Index, Show, Suspense } from "solid-js";
import { A, cache, createAsync } from "@solidjs/router";
import cfg from "../constant";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { docsData } from "solid:collection";
import PageLoading from "./Loading";

export default function Taxo() {
	const [checked, setChecked] = createSignal(false);

	const rawData = createAsync(() => cache(async () => {
		"use server";
		let preData = docsData.map((i) => {
			return { ...i, date: new Date(i.date) };
		})
			.filter((i: any) => {
				const itemHideLvl = i.hideLevel || 5;
				return cfg.hideLevel < itemHideLvl && !i.draft;
			})

		function findUniqueElements<T>(arr: T[]): T[] {
			const elementCount: Record<string, number> = {};
			arr.forEach((item) => {
				const key = JSON.stringify(item);
				elementCount[key] = (elementCount[key] || 0) + 1;
			});
			return arr.filter((item) => elementCount[JSON.stringify(item)] === 1);
		}

		let allTags =
			preData.reduce<string[]>((acc, item) => {
				return item.tags ? acc.concat(item.tags) : acc;
			}, [])

		const uniqueTags = findUniqueElements(allTags);

		const uniqueTagsArtiMap = new Map()

		function isIn<T>(values: readonly T[], x: any): x is T {
			return values.includes(x);
		}

		function intersect<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
			return arr1.filter(item => arr2.includes(item));
		}

		for (const t of preData) {
			if (t.tags.some((i) => isIn(uniqueTags, i))) {
				const its = intersect(t.tags, uniqueTags);
				uniqueTagsArtiMap.get(its) ?
					uniqueTagsArtiMap.set(its, [t, ...uniqueTagsArtiMap.get(its)])
					: uniqueTagsArtiMap.set(its, [t])

			}
		}

		for (const i of new Set(allTags)) {
			uniqueTagsArtiMap.set([i], preData.filter((n) => isIn(n.tags, i)))
		}

		// ===========

		let allCateg = Array.from(new Set(preData.reduce<string[]>((acc, item) => {
			return item.categories ? acc.concat(item.categories) : acc;
		}, [])))

		const uniqueCategArtiMap = new Map()

		for (const i of allCateg) {
			uniqueCategArtiMap.set([i], preData.filter((n) => isIn(n.categories, i)))
		}

		return { cate: uniqueCategArtiMap, tag: uniqueTagsArtiMap }

	}, "global-taxoData")(), { deferStream: false });

	return (
		<Suspense fallback={<div class="loading loading-infinity loading-lg text-sprout-300 grow"/>}>
			<Show when={rawData()}>
				{(ctx) =>
					<div class="mx-auto sm:w-2/3 2xl:w-7/12 flex flex-col grow w-11/12 space-y-8 mt-20">
						<MetaProvider>
							<Title>分类 - {cfg.title}</Title>
							<Link rel="canonical" href={cfg.base_url + "/taxonomy"} />
							<Meta property="og:description" content={"taxonomy page for " + cfg.base_url} />
							<Meta name="description" content={"taxonomy page for " + cfg.base_url} />
							<Meta name="author" content={cfg.author} />
						</MetaProvider>
						<div class="flex space-x-2 items-center">
							<div
								class={`px-2 py-px tansition-all duration-300 ${!checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
							>
								目录
							</div>
							<input
								type="checkbox"
								class="toggle border-sprout-400 bg-sprout-500 [--tglbg:#e4ecdb] hover:bg-sprout-600"
								onInput={() => setChecked(!checked())}
							/>
							<div
								class={`px-2 py-px tansition-all duration-300 ${checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
							>
								标签
							</div>
						</div>

						<div class="w-full flex flex-col">
							<p class="text-neutral-700 font-bold">All</p>
							<div class="flex flex-wrap text-sm justify-center">
								<Index
									each={Array.from(checked() ? ctx().tag : ctx().cate)}
								>
									{(cat) => {
										return (
											<button
												class="px-2 py-1 2xl:text-base text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
												onClick={() => {
													document
														.getElementById(cat()[0])!
														.scrollIntoView({ behavior: "smooth" });
												}}
											>
												{cat()[0].join('/')}
												<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
											</button>
										);
									}}
								</Index>
							</div>
						</div>

						<div class="divider" />

						<div class="antialiased flex flex-col sm:mx-3 md:mx-10 2xl:mx-16">
							<Index
								each={Array.from(checked() ? ctx().tag : ctx().cate)}>
								{(outerAttr) => {
									return (
										<>
											<p class={checked() ? "mt-6" : "mt-4"} id={outerAttr()[0]}>
												{outerAttr()[0].join(' / ')}
											</p>
											<Index
												each={outerAttr()[1]}>
												{(attr) => {
													return (
														<article class="flex ml-4 sm:ml-6 lg:ml-10 my-px overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
															<div class="no-underline mb-px font-light leading-loose font-mono text-slate-600 dark:text-chill-100 min-w-12">
																{attr()
																	.date.toLocaleDateString("en-CA", {
																		year: "numeric",
																		month: "2-digit",
																		day: "2-digit",
																	})
																	.toString()
																	.replace(/-/g, "/")}
															</div>
															<A
																href={`/${attr().path}`}
																class="no-underline text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-slug"
															>
																{attr().title}
																<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
															</A>
														</article>
													);
												}}
											</Index>
										</>
									);
								}}
							</Index>
						</div>
					</div>
				}
			</Show>
		</Suspense>
	);
}
