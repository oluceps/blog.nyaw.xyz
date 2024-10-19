import Online from "./online-indicator";
import Reveal from "./rand-reveal";
import cfg from "../constant";
import { QuickLinks, type QuickLinksProps } from "./quick-link";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { createSignal, For } from "solid-js";

export default function Me() {
	const shuffle = (a: any[]) =>
		a.map((value) => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value)

	const [descIdx, setDescIdx] = createSignal(0);
	const randDesc = shuffle([
		"Epicureanism",
		"Still Alive",
		"不用睡觉",
		"业余画师",
		"跨时区乱蹦",
		"赛博考古学家",
		"猫猫爱好者",
		"被猫猫爱好者",
	]);

	const delayIncreaseIdx = () =>
		setTimeout(() => {
			setDescIdx(prev => (prev + 1) % randDesc.length)
		}, 50);

	const [qlProps, _setqlProps] = createSignal<QuickLinksProps[]>(
		(() => {
			const a = [
				{
					title: "Matrix",
					href: "https://matrix.to/#/@sec:nyaw.xyz",
					icon: (
						<div class="pointer-events-none i-material-symbols:grid-3x3-rounded w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Mailbox",
					href: "mailto:i@nyaw.xyz",
					icon: (
						<div class="pointer-events-none i-material-symbols:alternate-email w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Telegram",
					href: "https://t.me/Secpm_bot",
					icon: (
						<div class="pointer-events-none i-ci:paper-plane w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Signature",
					href: cfg.base_url + "/api/minisign",
					icon: (
						<div class="pointer-events-none i-material-symbols:center-focus-strong-outline w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Pubkey",
					href: "https://github.com/oluceps.keys",
					icon: (
						<div class="pointer-events-none i-material-symbols:key-outline w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "DN42",
					href: "https://explorer.dn42.dev/?#/person/SECIRIAN-DN42",
					icon: <div class="pointer-events-none i-ci:planet w-8 h-8 text-sprout-500" />,
				},
				{
					title: "Donate",
					href: cfg.base_url + "/api/donate",
					icon: (
						<div class="pointer-events-none i-material-symbols:cookie-outline w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Discord",
					href: "https://discord.gg/RbFvkEPg",
					icon: (
						<div class="pointer-events-none i-ci:discord w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Status",
					href: "https://status.nyaw.xyz",
					icon: (
						<div class="pointer-events-none i-material-symbols:settings-rounded w-8 h-8 text-sprout-500" />
					),
				},
			];
			return shuffle(a);
		})().slice(0, 6),
	);

	return (
		<>
			<MetaProvider>
				<Link rel="canonical" href={cfg.base_url + "/me"} />
				<Meta
					name="twitter:image"
					content={cfg.base_url + "/" + "twitter-card.png"}
				/>
				<Meta name="twitter:card" content="summary_large_image" />
				<Meta
					property="og:image"
					content={cfg.base_url + "/" + "twitter-card.png"}
				/>
				<Meta name="description" content={"About Secirian"} />
				<Meta name="author" content={cfg.author} />
				<Meta property="og:url" content={cfg.base_url} />
				<Meta property="og:site_name" content={cfg.title} />
				<Meta property="og:title" content={cfg.title} />
				<Meta property="og:description" content={cfg.description} />
				<Title>{`关于 - ${cfg.title}`}</Title>
			</MetaProvider>
			<div class="h-full grow flex flex-col justify-center w-11/12 md:w-3/5 xl:w-2/5">
				<div class="md:flex py-16 md:py-0 bg-sprout-50 rounded-xl my-4 items-center justify-left xl:justify-center xl:gap-8 shadow-lg">
					<div class="flex md:flex-col items-center justify-center">
						<div class="relative my-8 md:mx-20 md:my-16 xl:my-24 xl:mr-28">
							<img
								class="w-36 h-36 sm:w-28 sm:h-28 md:w-48 md:h-48 md:rounded-xl rounded-full not-prose"
								src="https://s3.nyaw.xyz/misskey//d8d5edcb-ab40-49fb-807e-e0954575ae4d.webp"
								alt="avatar brown hair girl from https://www.pixiv.net/users/20817694"
								loading="lazy"
								onClick={() =>
									window.open(
										"https://www.pixiv.net/artworks/105555846",
										"_blank",
									)
								}
							/>
							<Online />
						</div>
					</div>
					<div class="text-center md:text-left not-prose flex flex-col leading-snug mx-6 pb-8 md:pb-0 justify-between gap-4 md:gap-6">
						<div class="text-stone-500 text-3xl md:text-2xl font-bold">
							<Reveal>Secirian</Reveal>
						</div>
						<div class="mx-auto text-[15px] sm:text-[13px] md:ml-px flex flex-col gap-2 sm:gap-1">
							<div class="text-zinc-500">ZHO / ENG / CDO / JPN</div>
							<div class="text-zinc-500">BEng 4rd year</div>
							<div class="text-zinc-500">UTC + 8?</div>
							<div class="text-zinc-500">she / her</div>
							<div
								id="shuffle-tag"
								class="text-zinc-500 pb-1 select-none blur-md font-mono hover:blur-none transition-all"
								onMouseLeave={delayIncreaseIdx}
							>
								{randDesc[descIdx()]}
							</div>
							<div class="text-zinc-400 not-prose">
								廿一世紀 末日未接近時出生
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-3 transition-all justify-between duration-500 overflow-x-scroll sm:overflow-visible pb-3 sm:py-0">
					<For each={qlProps()}>
						{(i) => (
							<div class="flex-none hover:flex-1 transition-all duration-500 delay-200">
								<QuickLinks {...i} />
							</div>
						)}
					</For>
				</div>
			</div>
		</>
	);
}
