import Online from "./online-indicator";
import Reveal from "./rand-reveal";
import cfg from "../constant";
import { QuickLinks } from "./quick-link";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";

export default function Me() {
  return (<>
    <MetaProvider>
      <Link rel="canonical" href={cfg.base_url} />
      <Meta name="twitter:image" content={cfg.base_url + "/" + "twitter-card.png"} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta property="og:image" content={cfg.base_url + "/" + "twitter-card.png"} />
      <Meta property="og:url" content={cfg.base_url} />
      <Meta property="og:site_name" content={cfg.title} />
      <Meta property="og:title" content={cfg.title} />
      <Meta property="og:description" content={cfg.description} />
      <Title>{`关于 - ${cfg.title}`}</Title>
    </MetaProvider>
    <div class="h-full grow flex flex-col justify-center w-11/12 md:w-3/5">

      <div class="md:flex bg-sprout-50 rounded-xl my-4 items-center justify-left outline-1 outline-dashed outline-sprout-200">
        <div class="flex md:flex-col items-center justify-center">
          <div class="relative m-8 md:m-16">
            <img
              class="w-28 h-28 md:w-48 md:h-48 md:rounded-xl rounded-full not-prose"
              src="https://s3.nyaw.xyz/misskey//d8d5edcb-ab40-49fb-807e-e0954575ae4d.webp"
              alt="avatar brown hair girl from https://www.pixiv.net/users/20817694"
              loading="lazy"
              onClick={() => window.open('https://www.pixiv.net/artworks/105555846', '_blank')} />
            <Online />
          </div>
        </div>
        <div class="text-center md:text-left not-prose flex flex-col leading-snug mx-6 pb-8 md:pb-0">
          <div class="font-medium mb-4 grow">
            <div class="text-stone-500 text-2xl font-bold">
              <Reveal>Secirian</Reveal>
            </div>
            <div class="text-zinc-500 mt-1.5">
              BEng 3rd Y.
            </div>
            <div class="text-zinc-500">
              Internet Wanderer
            </div>
          </div>
          <div class="mw-auto font-medium text-[13px]">
            <div class="text-zinc-500">
              UTC +0
            </div>
            <div class="text-zinc-500">
              she / her
            </div>
            <div class="text-zinc-500">
              ZHO / ENG / CDO / JPN
            </div>
            <div class="text-zinc-400 not-prose">
              廿一世紀 末日未接近時出生
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-3">
        <QuickLinks
          title="Matrix"
          href="https://matrix.to/#/@sec:nyaw.xyz"
        />
        <QuickLinks
          title="Mailbox"
          href="mailto:i@nyaw.xyz"
        />
        <QuickLinks
          title="Telegram"
          href="https://t.me/Secpm_bot"
        />
        <QuickLinks
          title="Pubkey"
          href="https://github.com/oluceps.keys"
        />
      </div>
    </div>
  </>
  )
}


