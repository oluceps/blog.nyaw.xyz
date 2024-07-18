import { Icon } from "solid-heroicons";
import { A } from "@solidjs/router";
import { Component, JSXElement, Match, ParentComponent, Show, Switch } from "solid-js";

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

  const w = () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-red-400`} />
  const i = () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-sprout-400`} />
  const t = () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-chill-400`} />
  const n = () => <Icon path={icons[props.type]} class={`h-7 w-7 fill-ouchi-400`} />

  const iconOpts = {
    warn: w,
    info: i,
    tips: t,
    note: n
  }

  const ex = () => {
    switch (props.type) {
      case "warn": return "WARNING"
      case "info": return "Information"
      case "tips": return "Tips"
      case "note": return "Notice"
    }
  }

  return (
    <div class={`group relative rounded-xl border-4 border-sprout-300/80`}>
      <div class="absolute -inset-px rounded-xl border-2 opacity-0" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Dynamic component={iconOpts[props.type]} />
          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
            {ex()}
          </div>
        </div>
        <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
          {props.children}
        </p>
      </div>
    </div>
  );
}
