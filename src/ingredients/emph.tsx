import { Icon } from "solid-heroicons";
import { A } from "@solidjs/router";
import { JSXElement, Match, ParentComponent, Show, Switch } from "solid-js";

import {
  exclamationTriangle, // warn
  informationCircle,   // info
  heart,               // tip
  bellAlert            // notice
} from "solid-heroicons/solid";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type EmphProps = {
  type: "warn" | "info" | "tips" | "noti";
  info: string,
  children: JSXElement;
};

const icons = {
  warn: exclamationTriangle,
  info: informationCircle,
  tips: heart,
  noti: bellAlert
};

export const Emph: ParentComponent<EmphProps> = (props) => {
  const col = () => {
    switch (props.type) {
      case "warn": return "pink"
      case "info": return "sprout"
      case "tips": return "chill"
      case "noti": return "ouchi"
    }
  }
  return (
    <div class={`group relative rounded-xl border-2 border-sprout-300`}>
      <div class="absolute -inset-px rounded-xl border-2 border-transparent opacity-0" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Switch>
            <Match when={props.type == "warn"}>
              <Icon path={icons[props.type]} class={`h-7 w-7 fill-red-400`} />
            </Match>
            <Match when={props.type == "info"}>
              <Icon path={icons[props.type]} class={`h-7 w-7 fill-sprout-400`} />
            </Match>
            <Match when={props.type == "tips"}>
              <Icon path={icons[props.type]} class={`h-7 w-7 fill-chill-400`} />
            </Match>
            <Match when={props.type == "noti"}>
              <Icon path={icons[props.type]} class={`h-7 w-7 fill-ouchi-400`} />
            </Match>
          </Switch>

          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
            <Switch fallback="Notice">
              <Match when={props.type == "warn"}>
                WARNING
              </Match>
              <Match when={props.type == "info"}>
                Info
              </Match>
              <Match when={props.type == "tips"}>
                TIPS
              </Match>
            </Switch>
          </div>
        </div>

        <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
          {props.children}
        </p>
      </div>
    </div>
  );
}
