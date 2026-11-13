import { createMiddleware } from "@solidjs/start/middleware";
import { handleLegacyRoutes } from "./legacy-router-redir";
import { handleHeaderResetPlaintextContent } from "./header-reset";

export default createMiddleware({
	onRequest: [
		handleLegacyRoutes,
		handleHeaderResetPlaintextContent,
		(event) => {
			const { pathname } = new URL(event.request.url);
			if (pathname === "/evidence" || pathname.startsWith("/evidence/")) {
				event.response.headers.set("X-Robots-Tag", "noindex");
			}
		},
	],
});
