import { Link, Meta, MetaProvider } from "@solidjs/meta";
import cfg from "../constant";
import Footer from "./Footer";
import Header from "./Header";
import { Match, ParentProps, Switch, createEffect, createSignal } from "solid-js";
import { useLocation } from "@solidjs/router";
import Page from "./Page";
import Root from "./Root"
import { PageStateProvider } from "./page-state";
import BackTopBtn from "./BackTopBtn";

export function Layout(props: ParentProps) {
	const location = useLocation();
	const [currentPath, setCurrentPath] = createSignal(location.pathname);
	createEffect(() => {
		setCurrentPath(location.pathname);
	});

	const isRoot = () => currentPath() === "/";

	return (
		<MetaProvider>
			<PageStateProvider>
				<Link rel="canonical" href={cfg.base_url} />
				<Meta name="twitter:image" content={cfg.base_url + "/" + "twitter-card.png"} />
				<Meta name="twitter:card" content="summary_large_image" />
				<div class="flex flex-col bg-zinc-50 dark:bg-[#171717] min-h-screen items-center">
					<Header sticky={isRoot()} />
					<Switch fallback={
						<div class="flex flex-col flex-1 grow pb-12 w-11/12 md:w-full">
							<Page>
								{props.children}
							</Page>
						</div>
					}>
						<Match when={isRoot()} >
							<Root />
						</Match>
					</Switch>
					<BackTopBtn />
					<Footer />
				</div>
			</PageStateProvider>
		</MetaProvider>
	);
}
