import type { Component } from "solid-js";
import cfg from "../constant";

const Footer: Component = () => {
	return (
		<div class="relative bottom-0 w-full justify-end text-[10px] group flex-nowrap">
			<div class="group-hover:block hidden">
				<div class="flex justify-end items-center mr-3 space-x-1 flex-nowrap">
					<p>Powered by SolidStart & UnoCSS</p>
				</div>
			</div>
			<div class="group-hover:hidden flex justify-end items-center mr-3 space-x-1 flex-nowrap">
				©2018-2024 {cfg.author} | {cfg.license}
			</div>
		</div>
	);
};
export default Footer;
