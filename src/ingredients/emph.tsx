import {
	type JSXElement,
	type ParentComponent,
	type ParentProps,
} from "solid-js";

import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type EmphProps = {
	type: "warn" | "info" | "tips" | "note";
	children: JSXElement;
};

const icons = {
	warn: "i-ci-triangle-warning",
	info: "i-ci-info",
	tips: "i-ci-heart-outline",
	note: "i-ci-bell",
};

export const Emph: ParentComponent<EmphProps> = (props) => {
	const styleOpts = {
		warn: {
			text: "WARNING",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-red-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-red-300 outline-dashed rounded-md bg-[#fee2e5] py-4 px-6">
					{props.children}
				</div>
			),
		},
		info: {
			text: "Information",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-sprout-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-sprout-300 outline-dashed rounded-md bg-sprout-100 py-4 px-6 my-2">
					{props.children}
				</div>
			),
		},
		tips: {
			text: "Tips",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-ouchi-500`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-chill-300 outline-dashed rounded-md bg-chill-100 py-4 px-6 my-2">
					{props.children}
				</div>
			),
		},
		note: {
			text: "Notice",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-ouchi-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-ouchi-300 outline-dashed rounded-md bg-ouchi-100 py-4 px-6 my-2">
					{props.children}
				</div>
			),
		},
	};

	return (
		<Dynamic component={styleOpts[props.type].border}>
			<div class="flex flex-col items-start prose">
				<div class="flex items-center">
					<Dynamic component={styleOpts[props.type].icon} />
					<div class="text-lg text-slate-600 font-bold capitalize no-underline pl-3">
						{styleOpts[props.type].text}
					</div>
				</div>
				<div class="whitespace-nowrap text-wrap mt-2">{props.children}</div>
			</div>
		</Dynamic>
	);
};
// <Dynamic component={styleOpts[props.type].border}>

//   <div class="relative overflow-hidden rounded-xl px-5 py-4">
//     <div class="flex items-center">
//       <Dynamic component={styleOpts[props.type].icon} />
//       <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
//         {styleOpts[props.type].text}
//       </div>
//     </div>
//     <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
//       {props.children}
//     </p>
//   </div>
// </Dynamic>
