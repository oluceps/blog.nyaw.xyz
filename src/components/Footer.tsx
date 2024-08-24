import type { Component } from "solid-js";
import cfg from "../constant";
import time from "../../time.json";
import { ctxFiltered } from "./Arti";

const Footer: Component = () => {
	const years = ctxFiltered.reduce<number[]>((acc, item) => {
		// @ts-ignore
		return acc.concat(new Date(item.date).getFullYear());
	}, []);
	const valid = [Math.min(...years), Math.max(...years)].join("-");

	return (
		<div class="relative bottom-0 w-full justify-end text-[10px] group flex-nowrap">
			<div class="group-hover:block hidden">
				<div class="flex justify-end items-center mr-3 space-x-1 flex-nowrap">
					<p>BUILT ON {time}</p>
				</div>
			</div>
			<div class="group-hover:hidden flex justify-end items-center mr-3 space-x-1 flex-nowrap">
				©{valid} {cfg.author} | {cfg.license}
			</div>
		</div>
	);
};
export default Footer;
