import {
	JSXElement,
	Match,
	Switch,
	children,
	splitProps,
	type ParentProps,
} from "solid-js";
import { A } from "@solidjs/router";
import { QuickLinks, type QuickLinksProps } from "../ingredients/quick-link";
import { Emph, type EmphProps } from "../ingredients/emph";
import Col from "~/ingredients/collapse";
import cfg from "../constant";
import Reveal from "~/ingredients/rand-reveal";
import { JSX } from "solid-js/jsx-runtime";

const cstomLink = (props: ParentProps & { href: string }) => {
	const [, rest] = splitProps(props, ["children"]);
	const resolved = children(() => props.children);

	if (props.href.startsWith("#")) {
		return (
			<A class={`anchor no-underline`} {...rest} noScroll={true}>
				{resolved()}
			</A>
		);
	}

	return (
		<A
			class="underline-offset-4 decoration-dashed inline items-center space-x-px group break-all pr-0.5 font-normal"
			target="_blank"
			rel="noopener noreferrer nofollow"
			{...rest}
		>
			<span>{resolved()}</span>
		</A>
	);
};

const imgContent = (
	props: ParentProps & {
		class: string;
		src: string;
		alt: string;
		title: string;
		ref: (el: HTMLVideoElement) => void | undefined;
	},
) => (
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
);

const components = {
	p: (props: ParentProps) => <p {...props}>{props.children}</p>,
	nav: (props: ParentProps) => <nav {...props}>{props.children}</nav>,
	TesterComponent: () => (
		<p>
			Remove This Now!!! If you see this it means that markdown custom
			components does work
		</p>
	),
	hr: (props: ParentProps) => {
		return <hr {...props} class="border-sprout-600" />;
	},
	pre: (props: ParentProps) => {
		return <pre {...props} class="shadow-md">{props.children}</pre>;
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
		<QuickLinks
			{...props}
		>
			{props.children}
		</QuickLinks>
	),

	Emph: (props: EmphProps) => <Emph type={props.type}>{props.children}</Emph>,

	Collapse: (props: ParentProps & { title: string; comment: string }) => (
		<Col title={props.title} comment={props.comment}>
			{props.children}
		</Col>
	),

	Reveal: (props: ParentProps) => <Reveal>{props.children}</Reveal>,

	h1: (props: ParentProps) => (
		<div>
			<h1 {...props} class="prose-h1">
				<div class="float-left rounded-sm bg-sprout-300 w-5 h-5 mr-2 mt-1.5" />
				{props.children}
			</h1>
		</div>
	),
	h2: (props: ParentProps) => {
		return (
			<>
				<h2 {...props} class="font-mono prose-h2">
					<div class="float-left rounded-sm bg-sprout-300 w-4 h-4 mr-2 mt-2" />
					{props.children}
				</h2>
			</>
		);
	},
	h3: (props: ParentProps) => {
		return (
			<h3 {...props} class="font-mono prose-h3">
				<div class="float-left rounded-sm bg-sprout-300 w-3.5 h-3.5 mr-1.5 mt-2" />
				{props.children}
			</h3>
		);
	},
	h4: (props: ParentProps) => {
		return (
			<h4 {...props} class="font-mono prose-h4">
				<div class="float-left rounded-sm bg-sprout-300 w-3 h-3 mr-1.5 mt-1" />
				{props.children}
			</h4>
		);
	},
	h5: (props: ParentProps) => {
		return (
			<h5 {...props} class="font-mono prose-h5">
				<div class="float-left bg-sprout-300 w-2.5 h-2.5 mr-1.5 mt-1" />
				{props.children}
			</h5>
		);
	},
	h6: (props: ParentProps) => (
		<h6 {...props} class="font-mono prose-h6">
			<div class="float-left bg-sprout-200 w-2.5 h-2.5 mr-1.5 mt-1" />
			{props.children}
		</h6>
	),
	blockquote: (props: ParentProps) => (
		<blockquote class="flex items-center not-prose text-base not-italic font-normal text-zinc-500 my-3">
			<div class="text-xl md:text-3xl text-sprout-400 mr-2">"</div>
			{props.children}
			<div class="text-xl md:text-3xl text-sprout-400 mr-2">"</div>
		</blockquote>
	),

	a: cstomLink,
	strong: (props: ParentProps) => <strong class="font-bold" {...props} />,

	img: imgContent,
	// code: (props: ParentProps) => {
	// 	return (
	// 		<code
	// 			class="bg-sprout-300"
	// 			{...props}
	// 		>
	// 			{props.children}
	// 		</code>
	// 	);
	// },
	table: (props: ParentProps) => <table>{props.children}</table>,
	li: (props: ParentProps) => (
		<li {...props} class="mb-2 marker:text-sprout-400">
			{props.children}
		</li>
	),
	ul: (props: ParentProps) => (
		<ul
			{...props}
			class="pl-6 mb-2 list-disc decoration-sprout-300 marker:text-sprout-400"
		>
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
