import { Link, MetaProvider } from "@solidjs/meta";
import cfg from "../constant";
import Footer from "./Footer";
import Header from "./Header";
import { Match, ParentProps, Show, Switch, createEffect, createMemo, createSignal } from "solid-js";
import { useLocation } from "@solidjs/router";
import Page from "./Page";
import { Arti } from "./Arti";
import Root from "./Root"
import { PageStateProvider } from "./page-state";

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
				<div class="flex flex-col bg-zinc-50 dark:bg-[#171717] min-h-screen items-center">
					<Header sticky={isRoot()} />
					<Switch fallback={
						<div class="flex flex-col flex-1 grow pb-12 w-11/12 sm:w-full">
							<Page>
								{props.children}
							</Page>
						</div>
					}>
						<Match when={isRoot()} >
							<Root />
						</Match>
					</Switch>
					<Footer />
				</div>
			</PageStateProvider>
		</MetaProvider>
	);
}
