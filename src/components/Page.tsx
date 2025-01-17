import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Show, type ParentComponent, children, Suspense, For } from "solid-js";
import cfg from "../constant";
import { A, cache, createAsync, useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import { docsData } from "solid:collection";
import Spinner from "./Spinner";
import { useTaxoTypeState } from "./PageState";
import { Bi } from "./Taxo";

function formatDate(date: Date | undefined) {
	if (date === undefined) {
		return "";
	}
	const year = date.getFullYear();

	const month = (date.getMonth() + 1).toString().padStart(2, "0");

	const day = date.getDate().toString().padStart(2, "0");

	return `${year}-${month}-${day}`;
}
const Page: ParentComponent<{ isError?: false }> = (props) => {
	const resolved = children(() => props.children);
	const location = useLocation();

	const ctx = createAsync(
		() =>
			cache(async () => {
				"use server";
				return docsData;
			}, "global-rawData")(),
		{ deferStream: true },
	);

	const currentUrl = `${cfg.base_url}${location.pathname}`;
	const { setTaxoType } = useTaxoTypeState();
	return (
		<Suspense
			fallback={
				<Spinner />
			}
		>
			<Show when={ctx()}>
				{(articles) => {
					const article = articles().find(
						(i) => i.path == location.pathname.replaceAll("/", ""),
					);

					if (article) {
						const date = new Date(article.date);
						return (
							<>
								<MetaProvider>
									<Title>{`${article?.title} - ${cfg.title}`}</Title>
									<Link rel="canonical" href={currentUrl} />
									<Meta property="og:url" content={currentUrl} />
									<Meta
										name="description"
										content={article?.description || cfg.description}
									/>
									<Meta property="og:title" content={cfg.title} />
									<Meta property="og:description" content={cfg.description} />
									<Meta name="keywords" content={article?.tags?.join(",")} />
									<Meta
										property="article:published_time"
										content={formatDate(date)}
									/>
								</MetaProvider>
								<article class="antialiased prose font-sans md:max-w-2/3 2xl:prose-lg dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
									<h1 class="font-sans font-medium prose-h1">
										{article?.title}
										<span class="sr-only">title</span>
									</h1>
									<div class="text-zinc-500 font-mono mb-2 font-light text-sm 2xl:text-lg">
										{formatDate(date)}
										<span class="sr-only">date</span>
									</div>

									<div class="flex w-auto mb-10 justify-end items-end font-sans">
										<div class="text-pretty text-slate-500 text-start text-sm 2xl:text-lg font-mono leading-loose">
											{article?.description}
										</div>
										<span class="sr-only">description</span>
									</div>
									<Show when={article?.toc}>
										<TableOfContents children={resolved()} />
									</Show>
									{resolved()}
									<div class="flex w-auto mb-10 justify-end items-end font-sans mt-18">
										<div class="flex gap-1 text-pretty text-start text-sm 2xl:text-lg font-sans">
											<For each={article?.tags}>
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
													<div class="w-1.5 h-4 mx-1 rounded-sm bg-sprout-300" />
												</div>
												}
											</For>
											<span class="sr-only">keywords</span>
										</div>
									</div>
									<div class="h-[30vh]" />
								</article>
							</>
						);
					}
					// No frontmatter here
					return resolved();
				}}
			</Show>
		</Suspense>
	);
};
export default Page;
