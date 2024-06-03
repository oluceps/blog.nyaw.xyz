import { Icon } from "solid-heroicons";
import { A } from "@solidjs/router";
import { JSXElement, ParentComponent, Show } from "solid-js";

import {
  academicCap,
  codeBracketSquare,
  paperAirplane,
  pencilSquare,
  userGroup,
} from "solid-heroicons/solid";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type QuickLinksProps = {
  icon: "learn" | "contribute" | "template" | "community";
  title: string;
  href: string;
  children: JSXElement;
};

const icons = {
  learn: academicCap,
  contribute: pencilSquare,
  community: userGroup,
  template: codeBracketSquare,
  airplane: paperAirplane
};

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
  return (
    <div class="group relative rounded-xl border border-sprout-600 dark:border-sprout-700 dark:bg-transparent">
      <div class="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-70 dark:[--quick-links-hover-bg:theme(colors.slate.900)]" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Icon path={icons[props.icon]} class="h-7 w-7 fill-sprout-400" />
          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-3">
            <Show
              when={isExternalURL(props.href)}
              fallback={
                <A
                  href={props.href}
                  class="no-underline font-semibold bg-gradient-to-br from-sprout-400 to-sprout-700 inline-block text-transparent bg-clip-text"
                >
                  <span class="absolute -inset-px rounded-xl" />
                  {props.title}
                </A>
              }
            >
              <a
                href={props.href}
                class="no-underline font-semibold bg-gradient-to-br from-sprout-400 to-sprout-700 inline-block text-transparent bg-clip-text"
              >
                <span class="absolute -inset-px rounded-xl" />
                {props.title}
              </a>
            </Show>
          </div>
        </div>

        <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 -mb-2">
          {props.children}
        </p>
      </div>
    </div>
  );
}
