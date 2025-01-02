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
import { MateriaType, preprocessed as raw } from "./Arti";
import Spinner from "./Spinner";
import TagReasm from "./TagReasm";

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
				const taxoArtisMap: Map<string, MateriaType> = new Map();

				cates.forEach((i) => {
					taxoArtisMap.set(
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

				let reasmedTagArtisMap = await TagReasm(preprocessed, tags);
				let _tags = reasmedTagArtisMap.keys();



				return {
					cate: cates,
					// reassembled tags
					tag: _tags,
					taxo: new Map([...taxoArtisMap, ...reasmedTagArtisMap]),
				};
			}, "taxoData")(),
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
									{(catOrTag) => {
										return (
											<button
												class="bg-transparent px-2 py-1 2xl:text-base font-sans text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
												onClick={() => {
													document
														.getElementById(catOrTag())!
														.scrollIntoView({ behavior: "smooth" });
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
									const cam = Array.from(ctx().taxo);

									return checked()
										// hide categories or not
										? cam.filter((i) => !ctx().cate.has(i[0]))
										: cam.filter((i) => ctx().cate.has(i[0]));
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
