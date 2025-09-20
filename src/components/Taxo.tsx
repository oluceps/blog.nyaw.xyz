import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Index,
	Match,
	onCleanup,
	Show,
	Suspense,
	Switch,
} from "solid-js";
import { A, cache, createAsync } from "@solidjs/router";
import cfg from "../constant";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { useTaxoJumpState, useTaxoTypeState } from "./PageState";
import { type MateriaType, preprocessed as raw } from "./Arti";
import Spinner from "./Spinner";

export enum Bi {
	tag = 0,
	cat = 1,
}

export default function Taxo() {
	const { setTaxoType, taxoType } = useTaxoTypeState();
	const [cateChecked, setCateChecked] = createSignal(true);
	const tagChecked = createMemo(() => !cateChecked());

	const { setTaxoJump, taxoJump } = useTaxoJumpState();
	const [selectedTag, setSelectedTagOrig] = createSignal<string>(taxoType.extra || "");
	const setSelectedTag = (t: string) => {
		setSelectedTagOrig(t)
		setTaxoType({ type: taxoType.type, extra: selectedTag() })
	}
	const [hoverTag, setHoverTag] = createSignal<string>();
	createEffect(() => console.log(tagChecked()))

	createEffect(() => {
		setCateChecked(taxoType.type == Bi.cat)
	})

	const [element, setElement] = createSignal<HTMLDivElement>();
	createEffect(() => {
		// console.log(element(),taxoJump.id)
		if (element() && taxoJump.id) {
			const elm = document.getElementById(taxoJump.id);
			// TODO: whatever fuk
			// only timeout works
			setTimeout(() => {
				elm!.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 100);
			setHighlightCate(taxoJump.id);
			setTaxoJump({ id: undefined });
		}
	});

	const [highlightCate, setHighlightCate] = createSignal<string>();

	createEffect(() => {
		const category = highlightCate();
		if (!category) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setHighlightCate("");
		}, 1500);

		onCleanup(() => {
			clearTimeout(timeoutId);
		});
	});

	const rawData = createAsync(
		async () => {
			const preprocessed = await raw;

			const tags = new Set(
				preprocessed.reduce<string[]>((acc, item) => {
					return item.tags ? acc.concat(item.tags) : acc;
				}, []),
			);

			const cates = new Set(
				preprocessed.reduce<string[]>((acc, item) => {
					return item.categories ? acc.concat(item.categories) : acc;
				}, []),
			);

			// [A -> bbb, B -> bbb] => [ [A, B] -> bbb ]
			const outputMap = new Map<string[], string>();
			const tempMap = new Map<string, string[]>();

			tempMap.forEach((keys, value) => {
				outputMap.set(keys, value);
			});

			// tag | cate map artis
			const cateArtisMap: Map<string, MateriaType> = new Map();

			cates.forEach((i) => {
				cateArtisMap.set(
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

			const tagArtisMap: Map<string, MateriaType> = new Map();


			tags.forEach((i) => {
				tagArtisMap.set(
					i,
					preprocessed.filter((a) => {
						if (a.tags.length != 0) {
							const t = a.tags[0];
							return Array.from(a.tags).includes(i as typeof t);
						}
						return false;
					}),
				);
			});

			return {
				cate: cateArtisMap,
				tag: tagArtisMap,
			};
		},
		{ deferStream: true },
	);

	return (
		<Suspense
			fallback={
				<Spinner />
			}
		>
			<Show when={rawData()}>
				{(ctx) => (
					<div
						class="mx-auto sm:w-2/3 2xl:w-7/12 flex flex-col w-11/12 mt-20 grow"
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
						</MetaProvider>
						<div class="flex space-x-2 items-center">
							<div
								class={`px-2 py-px hover:cursor-pointer tansition-all duration-300 ${cateChecked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
								onmouseover={() => setTaxoType({ type: Bi.cat })}
							>
								目录
							</div>
							<div
								class={`px-2 py-px hover:cursor-pointer tansition-all duration-300 ${tagChecked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}
								onmouseover={() => setTaxoType({ type: Bi.tag })}
							>
								标签
							</div>
						</div>
						<div class="h-4" />
						<Switch>
							<Match when={cateChecked()}>
								<div class="w-full flex flex-col">
									<div class="flex flex-wrap text-sm justify-center">
										<Index each={Array.from(cateChecked() ? ctx().cate.keys() : ctx().tag.keys())}>
											{(catOrTag) => {
												return (
													<button
														class="bg-transparent px-2 py-1 2xl:text-base font-sans text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
														onClick={() => {
															document
																.getElementById(catOrTag())!
																.scrollIntoView({ behavior: "smooth", block: "center" });
															setHighlightCate(catOrTag())
														}}
													>
														{catOrTag()}
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
											const target = cateChecked() ? ctx().cate : ctx().tag;
											const cam = Array.from(target);

											return cam.filter((i) => target.has(i[0]));
										})()}
									>
										{(outerAttr) => {
											return (
												<>
													<p
														class={"mt-6 pl-1 py-px font-sans transition-all"}
														id={outerAttr[0]}
														classList={{
															"bg-sprout-300 rounded-sm text-white": highlightCate() == outerAttr[0]
														}}
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
							</Match>

							<Match when={tagChecked()}>
								<div class="w-full grid grid-cols-1 md:grid-cols-[1fr_30px_1fr]">
									<div class="flex flex-wrap text-sm justify-center max-w-full">
										<Index each={Array.from(cateChecked() ? ctx().cate.keys() : ctx().tag.keys())}>
											{(catOrTag) => {
												return (
													<button
														class="bg-transparent px-2 py-1 2xl:text-base font-sans text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
														onClick={() => {
															if (cateChecked()) document
																.getElementById(catOrTag())!
																.scrollIntoView({ behavior: "smooth", block: "center" });
															if (tagChecked()) setSelectedTag(catOrTag())
														}}
														onmouseenter={() => {
															if (tagChecked()) setHoverTag(catOrTag())
														}}
														onmouseleave={() => {
															if (tagChecked()) setHoverTag("")
														}}
													>
														{catOrTag()}
														<Show when={tagChecked() &&
															selectedTag() == catOrTag()}
															fallback={<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />}>
															<span class="block max-w-full h-px bg-sprout-500" />
														</Show>

													</button>
												);
											}}
										</Index>
									</div>

									<span class="mx-auto max-h-full animate-fade-in w-px bg-sprout-500/70 hidden md:block" />

									<div class="max-w-full overflow-hidden antialiased flex flex-col min-h-[50vh] py-4 md:py-10">
										<div class="grow-[1] hidden md:block" />
										<Show when={(hoverTag() || selectedTag())} fallback={
											<div class="font-sans text-lg mx-auto flex items-center justify-center text-sprout-600">
												<div class="hidden md:block font-mono">
													&lt;-&nbsp;
												</div>
												<div class="md:hidden font-mono">
													↑&nbsp;
												</div>
												选一个
											</div>
										}>
											<For
												each={(() => {
													const target = cateChecked() ? ctx().cate : ctx().tag;
													return target.get((hoverTag() || selectedTag()) ?? "");
												})()}
											>
												{(outerAttr) => {
													return (
														<>
															<article class="flex my-px overflow-x-hidden overflow-y-visible text-slate-700 items-center space-x-5 text-sm 2xl:text-lg">
																<div class="no-underline mb-px font-light leading-loose font-mono text-slate-600 dark:text-chill-100 min-w-12">
																	{outerAttr.date
																		.toLocaleDateString("en-CA", {
																			year: "2-digit",
																			month: "2-digit",
																			day: "2-digit",
																		})
																		.toString()
																		.replace(/-/g, "/")}
																</div>
																<A
																	href={`/${outerAttr.path}`}
																	class="no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-slug"
																>
																	{outerAttr.title}
																	<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
																</A>
															</article>
														</>
													);
												}}
											</For>
										</Show>
										<div class="grow-[2]" />
									</div>
								</div>
							</Match>
						</Switch>
					</div>
				)}
			</Show>
		</Suspense>
	);
}
