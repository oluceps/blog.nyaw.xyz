import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import Disclosure from '@corvu/disclosure'
import { Show, type ParentComponent, children, Suspense, For, Switch, createSignal, createEffect, createMemo } from "solid-js";
import cfg from "../constant";
import { A, useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import { docsData, docsMap } from "solid:collection";
import Spinner from "./Spinner";
import { useTaxoTypeState } from "./PageState";
import { Bi } from "./Taxo";
import { twMerge } from "tailwind-merge";

function formatDate(date: Date | undefined) {
	if (date === undefined) {
		return "";
	}
	const year = date.getFullYear();

	const month = (date.getMonth() + 1).toString().padStart(2, "0");

	const day = date.getDate().toString().padStart(2, "0");

	return `${year}-${month}-${day}`;
}
const Page: ParentComponent<{ isError?: false; article?: any }> = (props) => {
	const resolved = children(() => props.children);
	const location = useLocation();
	const [clientWidthGt900, setClientWidthGt900] = createSignal<boolean>();

	const [exptoc, setExptoc] = createSignal(false);

	const handleWindowResize = () => {
		setClientWidthGt900(window.innerWidth > 900);
	}

	createEffect(() => {
		handleWindowResize();
		window.addEventListener('resize', handleWindowResize);
		return () => window.removeEventListener('resize', handleWindowResize);
	});

	const article = createMemo(() => {
		if (props.article) return props.article;
		const path = location.pathname.slice(1); // remove leading slash
		return docsMap[path];
	});

	const currentUrl = `${cfg.base_url}${location.pathname}`;
	const { setTaxoType } = useTaxoTypeState();

	const [toContainer, setToContainer] = createSignal<HTMLElement | undefined>();

	function handleSectionChange(evt: CustomEvent<string>) {
		const id = "toc-" + evt.detail;

		// console.log("cng to ", id)
		const containerEl = toContainer();
		if (id && containerEl) {
			const target = document.getElementById(id);
			if (target) {
				const scrollTarget = target.offsetTop;

				containerEl.scrollTo({
					top: scrollTarget,
					behavior: 'instant'
				});
			}
		}
	}


	return (
		<Suspense
			fallback={
				<Spinner />
			}
		>
			<Show when={article()} fallback={resolved()}>
				{(articleData) => {
					const date = new Date(articleData().date);
					return (
						<>
								<MetaProvider>
									<Title>{`${articleData().title} - ${cfg.title}`}</Title>
									<Link rel="canonical" href={currentUrl} />
									<Meta property="og:url" content={currentUrl} />
									<Meta
										name="description"
										content={articleData().description || cfg.description}
									/>
									<Meta property="og:title" content={cfg.title} />
									<Meta property="og:description" content={cfg.description} />
									<Meta name="keywords" content={articleData().tags?.join(",")} />
									<Meta
										property="article:published_time"
										content={formatDate(date)}
									/>
								</MetaProvider>
								<div class="antialiased prose font-sans md:max-w-2/3 2xl:prose-lg dark:prose-invert mx-auto w-full mt-10 break-words">
									<div class="font-sans font-medium text-[22px] my-4 whitespace-nowrap">
										<div class="text-wrap">
											{articleData().title}
										</div>
										<Show when={articleData().draft}>
											{" [draft]"}
										</Show>
										<span class="sr-only">title</span>
									</div>
									<div class="text-zinc-500 font-mono mb-2 font-light text-sm 2xl:text-lg">
										{formatDate(date)}
										<span class="sr-only">date</span>
									</div>

									<div class="flex w-auto mb-10 justify-end items-end font-sans">
										<div class="text-pretty text-slate-500 text-start text-sm 2xl:text-lg font-mono leading-loose">
											{articleData().description}
										</div>
										<span class="sr-only">description</span>
									</div>
									<Show when={articleData().draft}>
										<div class="flex w-auto justify-start items-end font-sans">
											<div class="text-pretty text-slate-500 text-start text-sm 2xl:text-lg font-mono leading-loose">
												恭喜你发现我的🌿稿一篇呀 🎉~
											</div>
											<span class="sr-only">is draft</span>
										</div>
									</Show>
								</div>

								<Show when={articleData().toc && clientWidthGt900()} fallback={
									<article class="antialiased prose font-sans md:max-w-2/3 2xl:prose-lg mx-auto w-full break-words">
										<Show when={articleData().toc}>
											<TableOfContents
												children={resolved()} />
										</Show>

										<div class="prose font-sans lg:prose-lg 2xl:prose-xl mb-16 mx-auto max-w-[80ch]">
											{resolved()}
										</div>
									</article>
								}>
									<article class="relative justify-between flex grow mx-16 mx-2 xl:mx-1/6">
										<div
											ref={setToContainer}
											onMouseEnter={() => setExptoc(true)}
											class={twMerge("fixed backdrop-blur-4 left-4 px-2 py-1 hover:w-auto hover:min-w-1/8 rounded-lg bottom-10 overflow-y-auto bg-sprout-100/30 z-10 scrollbar-none")}>
											<Disclosure collapseBehavior="hide" expanded={exptoc()}>
												{(_props) => (
													<>
														<Show when={!exptoc()}>
															<div class="w-[10vw] h-[10vh]">
																<TableOfContents
																	onCurrentSectionChanged={handleSectionChange}
																	children={resolved()} />
															</div>
														</Show>
														<Disclosure.Content
															class="overflow-visible data-[expanded]:animate-expand min-w-[10vw] min-h-[10vh]"
															onmouseleave={() => setExptoc(false)}>
															<TableOfContents
																onCurrentSectionChanged={handleSectionChange}
																children={resolved()} />
														</Disclosure.Content>
													</>
												)}
											</Disclosure>
										</div>
										<div class="antialiased prose lg:prose-lg 2xl:prose-xl 2xl:max-w-[80ch] font-sans mx-auto break-words">
											{resolved()}
										</div>
									</article>
								</Show >

								<div class="antialiased prose font-sans md:max-w-2/3 2xl:prose-lg dark:prose-invert mb-16 w-full mt-8 break-words mx-auto">
									<div class="flex w-auto mb-10 justify-end items-end font-sans mt-18">
										<div class="flex gap-1 text-pretty text-start text-sm 2xl:text-lg font-sans overflow-x-scroll scrollbar-none">
											<For each={articleData().tags}>
												{(i) => <div class="flex items-center">
													<A
														class="text-sm 2xl:text-base no-underline text-slate-600 font-sans dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group leading-snug"
														href="/taxonomy"
														onClick={() => {
															setTaxoType({ type: Bi.tag, extra: i });
														}}
													>
														{i}
														<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
													</A>
													<div class="w-1 h-4 mx-1 rounded-sm bg-sprout-300" />
												</div>
												}
											</For>
											<span class="sr-only">keywords</span>
										</div>
									</div>
								</div>
								<div class="h-[30vh]" />
						</>
					);
				}}
			</Show>
			</Suspense >
	);
};
export default Page;
