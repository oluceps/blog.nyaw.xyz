import { Link, Meta, Title } from "@solidjs/meta";
import type { Component } from "solid-js";
import cfg from "../constant";
import { Arti } from "./Arti";

const Root: Component = () => {
	const currentUrl = cfg.base_url;
	return (
		<div class="flex flex-col space-y-6 2xl:space-y-8 px-3 sm:px-0 w-full sm:w-2/3 2xl:w-7/12 mx-auto my-6 md:mt-14 grow">
			<Title>序 - {cfg.title}</Title>
			<Link rel="canonical" href={currentUrl} />
			<Meta property="og:url" content={currentUrl} />
			<Meta property="og:title" content={cfg.title} />
			<Meta property="og:description" content={cfg.description} />
			<Meta property="og:image" content={currentUrl + "/twitter-card.png"} />
			<Meta name="description" content={cfg.description} />
			<Meta name="author" content={cfg.author} />
			<Meta name="twitter:card" content="summary_large_image" />
			<Meta name="twitter:title" content={cfg.title} />
			<Meta name="twitter:description" content={cfg.description} />
			<Meta name="twitter:image" content={currentUrl + "/twitter-card.png"} />
			<Link rel="preconnect" href="https://fonts.googleapis.com" />
			<Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
			<Link rel="preconnect" href="https://ik.imagekit.io" />
			<Arti />
		</div>
	);
};

export default Root;
