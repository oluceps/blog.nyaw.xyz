import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, onMount, Suspense } from "solid-js";
import "./style.css";
import { Layout } from "./components/Layout";
import IErr from "./components/IErr";
import "virtual:uno.css";
import "@unocss/reset/tailwind-compat.css";

export default function App() {
	onMount(() => {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState == "visible") {
				navigator.wakeLock.request("screen");
			}
		});
	});
	return (
		<Router
			root={(props) => (
				<main>
					<ErrorBoundary
						fallback={(e) =>
							<IErr>{e.message}</IErr>
						}
					>
						<Layout>
							<Suspense>{props.children}</Suspense>
						</Layout>
					</ErrorBoundary>
				</main>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
