import type { Component } from "solid-js";
import cfg from "../constant";
import { TbBrandSolidjs } from 'solid-icons/tb'

const Footer: Component = () => {
	return (
		<div class="relative bottom-0 w-full justify-end text-[10px] group flex-nowrap">
			<div class="group-hover:block hidden"><div class="font-mono flex justify-end items-center mr-3 space-x-2 flex-nowrap"><p>Built With</p><TbBrandSolidjs /></div></div>
			<div class="group-hover:hidden flex justify-end items-center mr-3 space-x-1 flex-nowrap">©{cfg.valid} {cfg.author} | {cfg.license}</div>
		</div>
	);
};
export default Footer;

// <div class="relative bottom-0 w-full">
// 	<div class="flex justify-end text-[10px] mr-3 mb-px text-xs text-slate-500 items-center group transition-all">
// 		<p class="group-hover:hidden">©{cfg.valid} {cfg.author} | {cfg.license}</p>
// 		<div class="group-hover:block hidden font-mono"><p>Built With</p><TbBrandSolidjs /></div>
// 	</div>
// </div>
