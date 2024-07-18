import { Icon } from "solid-heroicons";
import { A } from "@solidjs/router";
import { Component, JSXElement, Match, ParentComponent, Show, Switch } from "solid-js";

import {
  exclamationTriangle, // warn
  informationCircle,   // info
  heart,               // tip
  bellAlert            // notice
} from "solid-heroicons/solid";

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
  const exp = () => {
    switch (props.type) {
      case "warn": return ["red", "WARNING"]
      case "info": return ["sprout", "Information"]
      case "tips": return ["chill", "Tips"]
      case "note": return ["ouchi", "Notice"]
    }
  }

  const col = () => exp()[0];

  return (
    <div class={`group relative rounded-xl border-4 border-sprout-300/80`}>
      <div class="absolute -inset-px rounded-xl border-2 opacity-0" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Icon path={icons[props.type]} class={`h-7 w-7 fill-${col()}-400`} />
          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
            {exp()[1]}
          </div>
        </div>
        <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
          {props.children}
        </p>
      </div>
    </div>
  );
}
