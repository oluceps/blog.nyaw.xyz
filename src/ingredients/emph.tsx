import { Icon } from "solid-heroicons";
import { A } from "@solidjs/router";
import { Component, type JSXElement, Match, type ParentComponent, type ParentProps, Show, Switch } from "solid-js";

import {
  exclamationTriangle, // warn
  informationCircle,   // info
  heart,               // tip
  bellAlert            // notice
} from "solid-heroicons/solid";
import { Dynamic } from "solid-js/web";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type EmphProps = {
  type: "warn" | "info" | "tips" | "note";
  children: JSXElement;
};

const icons = {
  warn: exclamationTriangle,
  info: informationCircle,
  tips: heart,
  note: bellAlert
};

export const Emph: ParentComponent<EmphProps> = (props) => {


  const styleOpts = {
    warn: {
      text: "WARNING",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-red-400`} />,
      border: (props: ParentProps) =>
        <div class="w-full outline-1 outline-red-300 outline-dashed rounded-md bg-[#fee2e5] py-4 px-6">
          {props.children}
        </div>
    },
    info: {
      text: "Information",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-sprout-400`} />,
      border: (props: ParentProps) =>
        <div class="w-full outline-1 outline-sprout-300 outline-dashed rounded-md bg-sprout-100 py-4 px-6 my-2">
          {props.children}
        </div>
    },
    tips: {
      text: "Tips",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-chill-400`} />,
      border: (props: ParentProps) =>
        <div class="w-full outline-1 outline-chill-300 outline-dashed rounded-md bg-chill-100 py-4 px-6 my-2">
          {props.children}
        </div>
    },
    note: {
      text: "Notice",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-ouchi-400`} />,
      border: (props: ParentProps) =>
        <div class="w-full outline-1 outline-ouchi-300 outline-dashed rounded-md bg-ouchi-100 py-4 px-6 my-2">
          {props.children}
        </div>
    }
  }



  return (
    <Dynamic component={styleOpts[props.type].border}>

      <div class="flex flex-col items-start prose">
        <div class="flex items-center">
          <Dynamic component={styleOpts[props.type].icon} />
          <div class="text-lg text-slate-600 font-bold capitalize no-underline pl-3">
            {styleOpts[props.type].text}
          </div>
        </div>
        <div class="whitespace-nowrap text-wrap mt-2">
          {props.children}
        </div>
      </div>
    </Dynamic>

  );
}
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
