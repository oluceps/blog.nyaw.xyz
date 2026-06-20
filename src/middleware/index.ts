import { createMiddleware } from "@solidjs/start/middleware";
import { handleLegacyRoutes } from "./legacy-router-redir";
import { handleHeaderResetPlaintextContent } from "./header-reset";

export default createMiddleware({
	onRequest: [handleLegacyRoutes, handleHeaderResetPlaintextContent],
});
