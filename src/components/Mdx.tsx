import {
	Match,
	Switch,
	children,
	createSignal,
	onMount,
	splitProps,
	type ParentProps,
} from "solid-js";
import { A } from "@solidjs/router";
import { QuickLinks, type QuickLinksProps } from "../ingredients/QuickLink";
import { Emph, type EmphProps } from "../ingredients/Emph";
import cfg from "../constant";
import Reveal from "~/ingredients/RandReveal";
import { twMerge } from "tailwind-merge";
import Comment from "~/ingredients/Comment";

const cstomLink = (props: ParentProps & { href: string }) => {
	const [, rest] = splitProps(props, ["children"]);
	const resolved = children(() => props.children);

	const [childRef, setChildRef] = createSignal<HTMLDivElement>();
	const [inlineAClass, setInlineAClass] = createSignal("");

	onMount(() => {
		if (childRef && childRef()?.parentElement) {
			if (childRef()!.parentElement?.tagName.startsWith("H")) {
				setInlineAClass(`anchor no-underline`);
			} else {
				setInlineAClass(`anchor decoration-dotted underline-offset-4`);
			}
		}
	});

	if (props.href.startsWith("#")) {

		return (
			<A ref={setChildRef} class={inlineAClass()} {...rest} noScroll={true}>
				{resolved()}
			</A>
		);
	}

	return (
		<A
			class="underline-offset-4 decoration-2 hover:underline-offset-2 transition-all inline items-center space-x-px group break-all pr-0.5 font-normal"
			target="_blank"
			rel="noopener"
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
				class={`w-full ${props.class}`}
				src={props.src}
				alt={props.alt}
				loading="lazy"
			/>
		}
	>
		<Match when={!props.src.startsWith("http")}>
			<img
				class={`w-full ${props.class}`}
				src={cfg.obj_store + "/" + props.src}
				alt={props.alt}
				loading="lazy"
			/>
		</Match>

		<Match when={props.src.endsWith(".webm")}>
			<video
				ref={props.ref}
				src={props.src}
				class={`w-full squircle rounded-md ${props.class}`}
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
	p: (props: ParentProps) => <p {...props} class="leading-relaxed font-sans text-md">{props.children}</p>,
	nav: (props: ParentProps) => <nav {...props}>{props.children}</nav>,
	TesterComponent: () => (
		<p>
			Remove This Now!!! If you see this it means that markdown custom
			components does work
		</p>
	),
	hr: (props: ParentProps) => {
		return <hr {...props} class="bg-sprout-100 rounded-xl h-0.5 w-full" />;
	},
	pre: (props: ParentProps) => {
		const [codeBlockRef, setCodeBlockRef] = createSignal<
			HTMLDivElement | undefined
		>();
		const [copied, setCopied] = createSignal(false);
		const copyToClipboard = () => {
			if (codeBlockRef()) {
				const codeContent = codeBlockRef()!.innerText; // loaded

				if (codeContent) {
					navigator.clipboard.writeText(codeContent).then(() => {
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					});
				}
			}
		};
		return (
			<div class="relative group w-full">
				<pre
					{...props}
					class="w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded"
					ref={setCodeBlockRef}
				>
					{props.children}
				</pre>
				<button
					class="absolute bg-transparent right-2 top-2 h-8 w-8 justify-center items-center flex rounded-md hover:bg-sprout-100 transition-all"
					onClick={copyToClipboard}
				>
					<div
						class={twMerge(
							"transition-all duration-400 group-hover:text-sprout-500",
							copied() ? "group-hover:i-ci:check" : "group-hover:i-ci:copy",
						)}
					/>
				</button>
			</div>
		);
	},
	code: (props: ParentProps) => {
		const [childRef, setChildRef] = createSignal<HTMLDivElement>();
		const [inlineCodeClass, setInlineCodeClass] = createSignal("");

		onMount(() => {
			if (childRef && childRef()?.parentElement) {
				// console.log('Parent tag name:', childRef()!.parentElement?.tagName);
				if (childRef()!.parentElement?.tagName != "PRE") {
					setInlineCodeClass("bg-sprout-100 px-1 text-sprout-950 rounded-sm inline flex-none font-medium leading-tight max-w-full whitespace-normal break-normal");
				}
			}
		});

		return <code ref={setChildRef} class={inlineCodeClass()}>{props.children}</code>;
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
		<QuickLinks {...props}>{props.children}</QuickLinks>
	),

	Emph: (props: EmphProps) => <Emph type={props.type}>{props.children}</Emph>,

	Reveal: (props: ParentProps) => <Reveal>{props.children}</Reveal>,

	C: (props: ParentProps) => <span class="inline-flex px-0.5">
		<Comment>
			{props.children}
		</Comment>
	</span>,

	h1: (props: ParentProps) => (
		<div>
			<h1 {...props} class="prose-h1 flex justify-start items-center font-sans">
				<div class="rounded-sm bg-sprout-300 w-5 h-5 mr-2 shadow-md" />
				{props.children}
			</h1>
		</div>
	),
	h2: (props: ParentProps) => {
		return (
			<>
				<h2 {...props} class="prose-h2 flex justify-start items-center font-sans">
					<div class="rounded-sm bg-sprout-300 w-4.5 h-4.5 mr-2 mb-0.5 shadow-md" />
					{props.children}
				</h2>
			</>
		);
	},
	h3: (props: ParentProps) => {
		return (
			<h3 {...props} class="prose-h3 flex justify-start items-center font-sans">
				<div class="rounded-sm bg-sprout-300 w-4 h-4 mr-1.5 mb-px shadow-md" />
				{props.children}
			</h3>
		);
	},
	h4: (props: ParentProps) => {
		return (
			<h4 {...props} class="prose-h4 flex justify-start items-center font-sans">
				<div class="rounded-sm bg-sprout-300 w-3.5 h-3.5 mr-1.5 mb-px shadow-sm" />
				{props.children}
			</h4>
		);
	},
	h5: (props: ParentProps) => {
		return (
			<h5 {...props} class="prose-h5 flex justify-start items-center my-1 font-sans">
				<div class="px-2 py-2 mr-1 rounded-sm border border-2 border-sprout-200 shadow-md" />
				{props.children}
			</h5>
		);
	},
	h6: (props: ParentProps) => (
		<h6 {...props} class="prose-h6 flex justify-start items-center my-1 font-sans">
			<div class="px-1.5 py-1.5 mr-1 rounded-sm border border-2 border-sprout-200 shadow-md" />
			{props.children}
		</h6>
	),
	blockquote: (props: ParentProps) => (
		<blockquote class="flex flex-col items-center text-base not-italic font-normal text-zinc-500 my-3">
			<div class="flex justify-start h-4 w-full">
				<div class="text-3xl text-sprout-400 leading-none">"</div>
			</div>
			<div class="mx-2.5 not-prose !leading-none">{props.children}</div>
			<div class="relative flex justify-end h-4 w-full">
				<div class="absolute -top-4 right-4 text-3xl text-sprout-400 leading-none">"</div>
			</div>
		</blockquote>
	),

	a: cstomLink,
	strong: (props: ParentProps) => <strong class="font-bold" {...props} />,

	img: imgContent,
	table: (props: ParentProps) => <table>{props.children}</table>,
	li: (props: ParentProps) => (
		<li {...props} class="mb-2 marker:text-sprout-400 whitespace-normal break-words">
			{props.children}
		</li>
	),
	ul: (props: ParentProps) => (
		<ul
			{...props}
			class="pl-6 mb-2 list-disc decoration-sprout-300 marker:text-sprout-400 prose max-w-full mx-4"
		>
			{props.children}
		</ul>
	),
	ol: (props: ParentProps) => (
		<ol {...props}
			class="pl-6 mb-2 list-decimal decoration-sprout-300 marker:text-sprout-400 prose max-w-full mx-4">
			{props.children}
		</ol>
	),
};

export default components;
