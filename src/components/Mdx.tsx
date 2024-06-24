import { Match, Switch, children, splitProps, type ParentProps } from "solid-js";
import { A } from "@solidjs/router";
import { QuickLinks, QuickLinksProps } from "./quick-link";
import cfg from "../constant"
import { Icon } from "solid-heroicons";
import { IconLink } from "@tabler/icons-solidjs";
import { link } from "solid-heroicons/solid";

const cstomLink = (props: ParentProps & { href: string }) => {
	const [, rest] = splitProps(props, ["children"]);
	const resolved = children(() => props.children);

	if (props.href.startsWith("#")) {
		return (
			<A
				class={`anchor no-underline hover:underline`}
				{...rest}
				target="_self"
			>
				{resolved()}
			</A>
		);
	}


	return (
		<A
			target="_blank"
			{...rest}
			class="inline-flex items-baseline break-all"
		>
			{resolved()}
			<Icon path={link} class="h-5 w-5 px-1 pt-2 float-right" />
		</A>
	);

};

const imgContent = (props: ParentProps & {
	class: string,
	src: string,
	alt: string,
	title: string,
	ref: (el: HTMLVideoElement) => void | undefined
}) => (
	<Switch
		fallback={
			<img
				class={`w-full rounded-sm ${props.class}`}
				src={props.src}
				alt={props.alt}
				loading="lazy"
			/>
		}
	>
		<Match when={!props.src.startsWith("http")}>
			<img
				class={`w-full rounded-sm ${props.class}`}
				src={cfg.obj_store + "/" + props.src}
				alt={props.alt}
				loading="lazy"
			/>
		</Match>

		<Match when={props.src.endsWith(".webm")}>
			<video
				ref={props.ref}
				src={props.src}
				class={`w-full rounded-md ${props.class}`}
				controls={props.title === "controls"}
				muted={props.title !== "controls"}
				autoplay={props.title !== "controls"}
				loop={props.title !== "controls"}
				preload="metadata"
				playsinline
			>
				<source src={props.src} type="video/webm" />
			</video>
		</Match>

	</Switch>
)

const components = {
	p: (props: ParentProps) => (
		<p {...props}>
			{props.children}
		</p>
	),
	nav: (props: ParentProps) => <nav {...props}>{props.children}</nav>,
	TesterComponent: () => (
		<p>
			Remove This Now!!! If you see this it means that markdown custom
			components does work
		</p>
	),
	th: (props: ParentProps) => <th>{props.children}</th>,
	thead: (props: ParentProps) => <thead>{props.children}</thead>,
	td: (props: ParentProps) => <td>{props.children}</td>,
	tr: (props: ParentProps) => <tr>{props.children}</tr>,
	hr: (props: ParentProps) => {
		return <hr {...props} class="border-sprout-600" />;
	},
	response: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},
	void: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},
	unknown: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},

	QuickLinks: (props: QuickLinksProps) => (
		<QuickLinks title={props.title} icon={props.icon} href={props.href}>
			{props.children}
		</QuickLinks>
	),

	h1: (props: ParentProps) => (

		<div>
			<h1
				{...props}
				class="prose-h1"
			>
				<div class="float-left rounded-sm bg-sprout-300 w-5 h-5 mr-2 mt-1.5" />
				{props.children}
			</h1>
		</div>
	),
	h2: (props: ParentProps) => {
		return (
			<>
				<h2
					{...props}
					class="font-mono prose-h2"
				>
					<div class="float-left rounded-sm bg-sprout-300 w-4 h-4 mr-2 mt-2" />
					{props.children}
				</h2>
			</>
		);
	},
	h3: (props: ParentProps) => {
		return (
			<h3
				{...props}
				class="font-mono prose-h3"
			>
				<div class="float-left rounded-sm bg-sprout-300 w-3.5 h-3.5 mr-1.5 mt-2" />
				{props.children}
			</h3>
		);
	},
	h4: (props: ParentProps) => {
		return (
			<h4
				{...props}
				class="font-mono prose-h4"
			>
				<div class="float-left rounded-sm bg-sprout-300 w-3 h-3 mr-1.5 mt-1" />
				{props.children}
			</h4>
		);
	},
	h5: (props: ParentProps) => {
		return (
			<h5
				{...props}
				class="font-mono prose-h5"
			>
				<div class="float-left bg-sprout-300 w-2.5 h-2.5 mr-1.5 mt-1" />
				{props.children}
			</h5>
		);
	},
	h6: (props: ParentProps) => (
		<h6
			{...props}
			class="font-mono prose-h6"
		>
			<div class="float-left bg-sprout-200 w-2.5 h-2.5 mr-1.5 mt-1" />
			{props.children}
		</h6>
	),
	blockquote: (props: ParentProps) => (
		<blockquote
			class="flex items-center not-prose text-base not-italic font-normal text-zinc-500">

			<div class="text-3xl text-sprout-400 mr-2">"</div>{props.children}

		</blockquote>
	),

	a: cstomLink,
	strong: (props: ParentProps) => <strong class="font-bold" {...props} />,

	img: imgContent,
	// Topic,
	// Testimonials,
	code: (props: ParentProps) => {
		return (
			<code
				class="inline-block not-prose mx-px dark:opacity-70 break-all !font-mono font-semibold bg-sprout-100 text-spout-800 dark:bg-sprout-200 dark:text-zinc-800 px-2 py-0.5 rounded-md text-[0.8em] leading-snug"
				{...props}
			>
				{props.children}
			</code>
		);
	},
	table: (props: ParentProps) => <table>{props.children}</table>,
	li: (props: ParentProps) => (
		<li
			{...props}
			class="mb-2 marker:text-sprout-400"
		>
			{props.children}
		</li>
	),
	ul: (props: ParentProps) => (
		<ul {...props} class="pl-6 mb-2 list-disc decoration-sprout-300">
			{props.children}
		</ul>
	),
	ol: (props: ParentProps) => (
		<ol {...props} class="list-decimal pl-8 mb-2">
			{props.children}
		</ol>
	),
};

export default components;
