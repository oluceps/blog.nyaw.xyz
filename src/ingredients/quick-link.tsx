import { A } from "@solidjs/router";
import { type JSXElement, type ParentComponent, Show } from "solid-js";

import { BiLogosTelegram } from "solid-icons/bi";
import { Dynamic } from "solid-js/web";
import { AiOutlineNumber } from "solid-icons/ai";
import { SiMaildotru } from "solid-icons/si";
import { FaBrandsDiscord } from "solid-icons/fa";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type QuickLinksProps = {
  title: string;
  href: string;
  children: JSXElement;
};

const icons = {
  Matrix: () => <AiOutlineNumber size={24} class="fill-sprout-400" />,
  Mail: () => <SiMaildotru size={24} class="fill-sprout-400" />,
  Telegram: () => <BiLogosTelegram size={24} class="fill-sprout-400" />,
  Discord: () => <FaBrandsDiscord size={24} class="fill-sprout-400" />,
}

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
  return (
    <div class="group relative rounded-xl border border-sprout-300">
      <div class="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-70 dark:[--quick-links-hover-bg:theme(colors.slate.900)]" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Dynamic component={icons[props.title as keyof typeof icons]} />
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
