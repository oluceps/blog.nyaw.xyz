import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createEffect, ErrorBoundary, onMount, Suspense } from "solid-js";
import { MDXProvider } from "solid-mdx";
import Mdx from "./components/Mdx";
import "./style.css";
import { Layout } from "./components/Layout";
import IErr from "./components/IErr";
import NotFound from "./components/NotFound";
import "virtual:uno.css";
import "@unocss/reset/tailwind-compat.css";
import { TaxoTypeStateProvider } from "./components/PageState";

export default function App() {

	createEffect(() => {
		if ("paintWorklet" in CSS) {
			(CSS as any).paintWorklet.addModule("/houdini-paint.js");
			// (CSS as any).paintWorklet.addModule("https://www.unpkg.com/css-houdini-squircle/squircle.min.js");
		}
	});

	onMount(() => {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState == "visible") {
				navigator.wakeLock.request("screen");
			}
		});
	});
	return (
		<TaxoTypeStateProvider>
			<Router
				root={(props) => (
					<main>
						<ErrorBoundary
							fallback={(e) =>
								e.message == 404 ? <NotFound /> : <IErr>{e.message}</IErr>
							}
						>
							<Layout>
								<MDXProvider components={Mdx}>
									<Suspense>{props.children}</Suspense>
								</MDXProvider>
							</Layout>
						</ErrorBoundary>
					</main>
				)}
			>
				<FileRoutes />
			</Router>
		</TaxoTypeStateProvider>
	);
}
