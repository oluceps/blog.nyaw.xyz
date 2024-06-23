import { createMiddleware } from "@solidjs/start/middleware";
import { handleLegacyRoutes } from "./legacy-router-redir";

export default createMiddleware({
	onRequest: [handleLegacyRoutes],
});
