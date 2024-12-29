import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Show, type ParentComponent, children, Suspense } from "solid-js";
import cfg from "../constant";
import { cache, createAsync, useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import { docsData } from "solid:collection";
import Spinner from "./Spinner";

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
							<article class="antialiased prose font-sans md:max-w-2/3 2xl:prose-lg dark:prose-invert justify-self-center mx-auto mb-16 w-full mt-10 break-words">
								<MetaProvider>
									<Title>{`${article?.title} - ${cfg.title}`}</Title>
									<Link rel="canonical" href={currentUrl} />
									<Meta property="og:url" content={currentUrl} />
									<Meta
										name="description"
										content={article?.description || cfg.description}
									/>
									<Meta
										property="og:image"
										content={cfg.base_url + "/api/og" + `?title=${article.title}`}
									/>
									<Meta property="og:title" content={cfg.title} />
									<Meta property="og:description" content={cfg.description} />
									<Meta name="keywords" content={article?.tags?.join(",")} />
									<Meta
										property="article:published_time"
										content={formatDate(date)}
									/>
								</MetaProvider>

								<h1 class="font-sans font-medium prose-h1">{article?.title}</h1>
								<div class="text-zinc-500 font-serif mb-2 font-light text-sm 2xl:text-lg">
									{formatDate(date)}
								</div>

								<div class="flex w-auto mb-10 justify-end items-end font-sans">
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
