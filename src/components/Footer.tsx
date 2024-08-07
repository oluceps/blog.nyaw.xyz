import type { Component } from "solid-js";
import cfg from "../constant";
import data from "../routes/data.json"
import time from "../../time.json"

const Footer: Component = () => {
	const years = data.reduce<number[]>((acc, item) => {
		// @ts-ignore
		return acc.concat((new Date(item.date)).getFullYear())
	}, [])
	const valid = [Math.min(...years), Math.max(...years)].join('-')


	return (
		<div class="relative bottom-0 w-full justify-end text-[10px] group flex-nowrap">
			<div class="group-hover:block hidden"><div class="flex justify-end items-center mr-3 space-x-1 flex-nowrap">
				<p>BUILT ON {(new Date(time)).toLocaleString()}</p>
			</div>
			</div>
			<div class="group-hover:hidden flex justify-end items-center mr-5 space-x-1 flex-nowrap">©{valid} {cfg.author} | {cfg.license}</div>
		</div>
	);
};
export default Footer;
