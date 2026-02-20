import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import type { Component } from "solid-js";
import cfg from "../constant";
import { Arti } from "./Arti";

const Root: Component = () => {
	return (
		<div class="flex flex-col space-y-6 2xl:space-y-8 px-3 sm:px-0 w-full sm:w-2/3 2xl:w-7/12 mx-auto my-6 md:mt-14 grow">
			<MetaProvider>
				<Title>序 - {cfg.title}</Title>
				<Meta name="description" content={cfg.description} />
				<Meta name="author" content={cfg.author} />
				<Link rel="canonical" href={cfg.base_url} />
				<Link rel="preconnect" href="https://fonts.googleapis.com" />
				<Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
				<Link rel="preconnect" href="https://ik.imagekit.io" />
			</MetaProvider>
			<Arti />
		</div>
	);
};

export default Root;
