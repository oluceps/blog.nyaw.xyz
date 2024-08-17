import { A } from "@solidjs/router";
import { type JSXElement, type ParentComponent, Show } from "solid-js";

import { BiRegularPaperPlane } from "solid-icons/bi";
import { Dynamic } from "solid-js/web";
import { AiOutlineKey, AiOutlineNumber } from "solid-icons/ai";
import { SiMaildotru, SiMisskey } from "solid-icons/si";
import { FaBrandsDiscord } from "solid-icons/fa";

export const isExternalURL = (url: string) => url.startsWith("https:") || url.startsWith("mailto:");

export type QuickLinksProps = {
  title: string;
  href: string;
  children?: JSXElement;
};

const icons = {
  Matrix: () => <AiOutlineNumber size={24} class="fill-sprout-400" />,
  Mailbox: () => <SiMaildotru size={20} class="fill-sprout-400" />,
  Telegram: () => <BiRegularPaperPlane size={24} class="fill-sprout-400" />,
  Discord: () => <FaBrandsDiscord size={24} class="fill-sprout-400" />,
  Misskey: () => <SiMisskey size={24} class="fill-sprout-400" />,
  Pubkey: () => <AiOutlineKey size={24} class="fill-sprout-400" />
}

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
  return (
    <div class="group relative rounded-xl border border-sprout-300">
      <div class="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 transition-all [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sprout.100)),var(--quick-links-hover-bg,theme(colors.sprout.100)))_padding-box,linear-gradient(to_top,theme(colors.sprout.500),theme(colors.sprout.300))_border-box] group-hover:opacity-70 dark:[--quick-links-hover-bg:theme(colors.slate.900)]" />
      <div class="relative overflow-hidden rounded-xl px-5 py-4">
        <div class="flex items-center">
          <Dynamic component={icons[props.title as keyof typeof icons]} />
          <div class="text-xl text-slate-900 dark:text-white capitalize no-underline pl-2 md:pl-3">
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

        <Show when={props.children}>
          <p class="text-[0.91rem] pl-1 text-balance text-slate-800 dark:text-slate-300 not-prose mt-2.5">
            {props.children}
          </p>
        </Show>
      </div>
    </div>
  );
}
