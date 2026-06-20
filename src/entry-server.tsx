// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="zh-CN">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
					<link rel="alternate" type="application/rss+xml" title="Tabula Rasa" href="/rss.xml" />
					<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
					<link rel="preconnect" href="https://ik.imagekit.io" />
					{assets}
				</head>
				<body>
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
