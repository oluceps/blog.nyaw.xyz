import {
	createEffect,
	createSignal,
	For,
	Index,
	Show,
	Suspense,
} from "solid-js";
import { A, cache, createAsync } from "@solidjs/router";
import cfg from "../constant";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { useTaxoState } from "./PageState";
import { isIn } from "~/lib/fn";
import { preprocessed as raw } from "./Arti";

enum Bi {
	tag = 0,
	cat = 1,
}

export default function Taxo() {
	const [checked, setChecked] = createSignal(false);
	const { setTaxoInfo, taxoInfo } = useTaxoState();
	const [isHovered, setIsHovered] = createSignal<Bi>();

	createEffect(() => {
		setChecked(isHovered() == Bi.tag);
	});

	const [element, setElement] = createSignal<HTMLDivElement>();
	createEffect(() => {
		if (element() && taxoInfo.id) {
			const elm = document.getElementById(taxoInfo.id);
			// TODO: whatever fuk
			elm!.scrollIntoView({ behavior: "smooth" });
			setTaxoInfo({ id: undefined });
		}
	});

	const rawData = createAsync(
		() =>
			cache(async () => {
				"use server";
				let preprocessed = await raw;
				const allTags = new Set(
					preprocessed.reduce<string[]>((acc, item) => {
						return item.tags ? acc.concat(item.tags) : acc;
					}, []),
				);

				const allCate = new Set(
					preprocessed.reduce<string[]>((acc, item) => {
						return item.categories ? acc.concat(item.categories) : acc;
					}, []),
				);

				// find all only one article tag
				const onlyTag: Map<string, string> = new Map();

				for (const t of allTags) {
					let count = 0;
					let last;
					for (const it of preprocessed) {
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
				const dag: Map<string, typeof preprocessed> = new Map();

				// console.log(data)
				preprocessed.forEach((i) => {
					i.tags.forEach((t) => {
						if (Array.from(onlyTag.keys()).includes(t)) {
							const a = Array.from(outputMap).find((i) => i[0].includes(t))!;
							if (a[1] == i.title) {
								dag.set(a[0].join(" / "), [i]);
								console.log(a[0].join(" / "), i);
							}
						} else {
							if (
								Array.from(dag.values()).some((ii) =>
									ii.some((iii) => iii.title === i.title),
								)
							) {
							} else {
								dag.set(t, dag.get(t)?.concat(i) || [i]);
							}
						}
					});
				});

				allCate.forEach((i) => {
					dag.set(
						i,
						preprocessed.filter((a) => {
							if (a.categories.length != 0) {
								const t = a.categories[0];
								return Array.from(a.categories).includes(i as typeof t);
							}
							return false;
						}),
					);
				});
				return {
					cate: allCate,
					tag: allTags,
					dag,
				};
			}, "taxoData")(),
		{ deferStream: true },
	);

	return (
		<Suspense
			fallback={
				<div class="i-svg-spinners-blocks-shuffle-3 text-sprout-300 grow w-6 h-6" />
			}
		>
			<Show when={rawData()}>
				{(ctx) => (
					<div
						class="mx-auto sm:w-2/3 2xl:w-7/12 flex flex-col grow w-11/12 space-y-8 mt-20"
						ref={setElement}
					>
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
							<For
								each={(() => {
									const dag = Array.from(ctx().dag);

									return checked()
										? dag.filter((i) => !ctx().cate.has(i[0]))
										: dag.filter((i) => ctx().cate.has(i[0]));
								})()}
							>
								{(outerAttr) => {
									return (
										<>
											<p
												class={`${checked() ? "mt-6" : "mt-4"} font-sans`}
												id={outerAttr[0]}
											>
												{outerAttr[0]}
											</p>
											<Index each={outerAttr[1]}>
												{(i) => {
													const ist = i();
													return (
														<>
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
													);
												}}
											</Index>
										</>
									);
								}}
							</For>
						</div>
						<div class="h-[50vh]" />
					</div>
				)}
			</Show>
		</Suspense>
	);
}
