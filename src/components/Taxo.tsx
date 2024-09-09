import { createEffect, createSignal, Index, Show, Suspense } from "solid-js";
import { A, cache, createAsync } from "@solidjs/router";
import cfg from "../constant";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { docsData } from "solid:collection";
import { useTaxoState } from "./PageState";
import { isIn } from "~/lib/fn";

enum Bi {
	tag,
	cat
}

export default function Taxo() {
	const [checked, setChecked] = createSignal(false);
	const { setTaxoInfo, taxoInfo } = useTaxoState();
	const [isHovered, setIsHovered] = createSignal<Bi>();

	createEffect(() => {
		setChecked(isHovered() == Bi.tag);
	})

	const [element, setElement] = createSignal<HTMLDivElement>();
	createEffect(() => {
		if (element() && taxoInfo.id) {
			const elm = document.getElementById(taxoInfo.id);
			// TODO: whatever fuk
			elm!.scrollIntoView({ behavior: "smooth" });
			setTaxoInfo({ id: undefined })
		}
	});


	const rawData = createAsync(
		() =>
			cache(async () => {
				"use server";
				const preData = docsData
					.map((i) => {
						return { ...i, date: new Date(i.date) };
					})
					.filter((i: any) => {
						const itemHideLvl = i.hideLevel || 5;
						return cfg.hideLevel < itemHideLvl && !i.draft;
					});

				const allTags = new Set(
					preData.reduce<string[]>((acc, item) => {
						return item.tags ? acc.concat(item.tags) : acc;
					}, []),
				);

				const allCate = new Set(
					preData.reduce<string[]>((acc, item) => {
						return item.categories ? acc.concat(item.categories) : acc;
					}, []),
				);

				// find all only one article tag
				const onlyTag: Map<string, string> = new Map();

				for (const t of allTags) {
					let count = 0;
					let last;
					for (const it of preData) {
						if (isIn(it.tags, t)) {
							count++;
							last = it.title;
						}
					}
					if (count == 1 && last) {
						onlyTag.set(t, last);
						allTags.delete(t);
					}
				}
				// [A -> bbb, B -> bbb] => [ [A, B] -> bbb ]
				const outputMap = new Map<string[], string>();
				const tempMap = new Map<string, string[]>();

				onlyTag.forEach((value, key) => {
					if (!tempMap.has(value)) {
						tempMap.set(value, []);
					}
					tempMap.get(value)?.push(key);
				});
				tempMap.forEach((keys, value) => {
					outputMap.set(keys, value);
				});

				for (const i of outputMap.keys()) {
					allTags.add(i.join(" / "));
				}

				const reversedMap: Map<string, string[]> = new Map();

				outputMap.forEach((value, key) => {
					reversedMap.set(value, key);
				});

				// console.log(outputMap)
				// console.log(reversedMap)

				const data = preData.reduce<typeof preData>((acc, item) => {
					if (Array.from(outputMap.values()).includes(item.title)) {
						const updatedTags = (
							item.tags!.filter(
								(tag) => !Array.from(onlyTag.keys()).includes(tag),
							) as ReadonlyArray<string>
						).concat(reversedMap.get(item.title)?.join(" / ") || []);
						// @ts-ignore
						acc.push({ ...item, tags: updatedTags });
						return acc;
					}
					acc.push({ ...item });
					return acc;
				}, [])

				let dag: Map<string, typeof data> = new Map()

				for (const i of data) {
					for (const t of i.tags) {
						const preV = dag.get(t) || []
						dag.set(t, preV?.concat(i))
					}
					for (const c of i.categories) {
						const preV = dag.get(c) || []
						if (preV.some((ii) => ii.title == i.title)) break;
						dag.set(c, preV.concat(i))
					}
				}
				return {
					cate: allCate,
					tag: allTags,
					dag,
				};
			}, "global-taxoData")(),
		{ deferStream: true },
	);

	return (
		<Suspense
			fallback={
				<div class="loading loading-infinity loading-lg text-sprout-300 grow" />
			}
		>
			<Show when={rawData()}>
				{(ctx) => (
					<div class="mx-auto sm:w-2/3 2xl:w-7/12 flex flex-col grow w-11/12 space-y-8 mt-20" ref={setElement}>
						<MetaProvider>
							<Title>分类 - {cfg.title}</Title>
							<Link rel="canonical" href={cfg.base_url + "/taxonomy"} />
							<Meta
								property="og:description"
								content={"taxonomy page for " + cfg.base_url}
							/>
							<Meta
								name="description"
								content={"taxonomy page for " + cfg.base_url}
							/>
							<Meta name="author" content={cfg.author} />
							<Link
								rel="stylesheet"
								crossOrigin="anonymous"
								href="https://cdn.jsdelivr.net/npm/@fontsource/geist-mono@5.0.3/latin.min.css"
							/>
						</MetaProvider>
						<div class="flex space-x-2 items-center">
							<div
								class={`px-2 py-px tansition-all duration-300 ${!checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
								onmouseover={() => setIsHovered(Bi.cat)}
							>
								目录
							</div>
							<div
								class={`px-2 py-px tansition-all duration-300 ${checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
								onmouseover={() => setIsHovered(Bi.tag)}
							>
								标签
							</div>
						</div>

						<div class="w-full flex flex-col">
							<p class="text-neutral-700 text-md font-sans">All</p>
							<div class="flex flex-wrap text-sm justify-center">
								<Index each={Array.from(checked() ? ctx().tag : ctx().cate)}>
									{(cat) => {
										return (
											<button
												class="bg-transparent px-2 py-1 2xl:text-base font-sans text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
												onClick={() => {
													document
														.getElementById(cat())!
														.scrollIntoView({ behavior: "smooth" });
												}}
											>
												{cat()}
												<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
											</button>
										);
									}}
								</Index>
							</div>
						</div>

						<div class="divider" />

						<div class="antialiased flex flex-col sm:mx-3 md:mx-10 2xl:mx-16">
							<Index each={Array.from(checked() ? ctx().tag : ctx().cate)}>
								{(outerAttr) => {
									return (
										<>
											<p
												class={`${checked() ? "mt-6" : "mt-4"} font-sans`}
												id={outerAttr()}
											>
												{outerAttr()}
											</p>
											<Index each={ctx().dag.get(outerAttr())}>
												{(i) => {
													const ist = i()
													return <>
														<article class="flex ml-4 sm:ml-6 lg:ml-10 my-px overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
															<div class="no-underline mb-px font-light leading-loose font-mono text-slate-600 dark:text-chill-100 min-w-12">
																{ist.date
																	.toLocaleDateString("en-CA", {
																		year: "numeric",
																		month: "2-digit",
																		day: "2-digit",
																	})
																	.toString()
																	.replace(/-/g, "/")}
															</div>
															<A
																href={`/${ist.path}`}
																class="no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-slug"
															>
																{ist.title}
																<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
															</A>
														</article>
													</>
												}}
											</Index>
										</>
									);
								}}
							</Index>
						</div>
					</div>
				)}
			</Show>
		</Suspense >
	);
}
