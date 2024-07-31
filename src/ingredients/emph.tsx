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
      border: (props: ParentProps) => <div class={`group relative rounded-xl border-2 border-red-300/80`}> {props.children}</div>
    },
    info: {
      text: "Information",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-sprout-400`} />,
      border: (props: ParentProps) => <div class={`group relative rounded-xl border-2 border-sprout-300/80`}> {props.children}</div>
    },
    tips: {
      text: "Tips",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-chill-400`} />,
      border: (props: ParentProps) => <div class={`group relative rounded-xl border-2 border-chill-500/40`}> {props.children}</div>
    },
    note: {
      text: "Notice",
      icon: () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-ouchi-400`} />,
      border: (props: ParentProps) => <div class={`group relative rounded-xl border-2 border-[#9B90C2]/50`}> {props.children}</div>
    }
  }



  return (
    <Dynamic component={styleOpts[props.type].border}>
      <div class="absolute -inset-px rounded-xl border-2 opacity-0" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Dynamic component={styleOpts[props.type].icon} />
          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
            {styleOpts[props.type].text}
          </div>
        </div>
        <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
          {props.children}
        </p>
      </div>
    </Dynamic>
  );
}
