import type { Component } from "solid-js";
import cfg from "../constant";

const Footer: Component = () => {
	return (
		<div class="relative bottom-0 w-full">
			<div class="flex justify-end mr-4 mb-1 text-xs text-slate-500 items-center group">
				<p class="group-hover:hidden">Published under {cfg.extra.license}</p>
				<p class="group-hover:block hidden">Built with SolidJS</p>
			</div>
		</div>
	);
};
export default Footer;
