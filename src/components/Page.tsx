import { Link, Meta, Title } from "@solidjs/meta";
import { Show, type ParentComponent, children, Suspense } from "solid-js";
import cfg from "../constant";
import { cache, createAsync, useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import { docsData } from "solid:collection";

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
	return (
		<Suspense
			fallback={
				<div class="flex flex-col h-full items-center justify-center grow w-full">
					<div class="i-svg-spinners-blocks-shuffle-3 text-sprout-300 w-6 h-6" />
				</div>
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
							<article class="antialiased prose md:max-w-2/3 2xl:prose-lg dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
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
								<Link
									rel="stylesheet"
									crossOrigin="anonymous"
									href="https://cdn.jsdelivr.net/npm/@fontsource/geist-mono@5.0.3/latin.min.css"
								/>

								<h1>{article?.title}</h1>
								<div class="text-zinc-500 font-serif mb-2 font-light text-sm 2xl:text-lg">
									{formatDate(date)}
								</div>

								<div class="flex w-auto mb-10 justify-end items-end">
									<Show when={1}>
										<i class="text-pretty text-slate-500 text-start text-sm 2xl:text-lg font-mono leading-loose">
											{article?.description}
										</i>
									</Show>
								</div>
								<Show when={article?.toc}>
									<TableOfContents children={resolved()} />
								</Show>
								{resolved()}
								<div class="h-[30vh]" />
							</article>
						);
					}
					// TODO: This must tolerate the delay
					// No frontmatter here
					return resolved();
				}}
			</Show>
		</Suspense>
	);
};
export default Page;
