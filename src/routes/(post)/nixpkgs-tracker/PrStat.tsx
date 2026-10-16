import { Ok, Err, type Throwable } from "@typ3/throwable";
import ky, { type KyInstance } from "ky";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { twMerge } from "tailwind-merge";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import type HttpStatusCode from "./http-status-code";

export const commonBranch = [
	"staging-next",
	"master",
	"nixos-unstable-small",
	"nixpkgs-unstable",
	"nixos-unstable",
];

type PrMeta = {
	title: string;
	state: string;
	status: number;
	user: { login: string };
	merge_commit_sha: string;
};
// get from `pulls/${pr}`
type PrMetaResult = Throwable<PrMeta, { type: HttpStatusCode; msg: string }>;

type MergeStats = Record<string, boolean>;

export type RetResult = Throwable<
	PrMeta & {
		// branch merge stat
		merge: MergeStats;
	},
	{ type: HttpStatusCode; msg: string }
>;

export class API {
	private inner: KyInstance;

	constructor(repo: string, headers: Record<string, string>) {
		this.inner = ky.create({
			// GET /repos/:owner/:repo
			prefixUrl: `https://api.github.com/repos/${repo}/`,
			headers,
		});
	}

	async getMeta(pr: number): Promise<PrMetaResult> {
		try {
			const rsp = await this.inner.get(`pulls/${pr}`).json<any>();

			if (rsp.status === 401)
				return Err({
					type: rsp.status,
					msg: "Rate limited, provide auth token?",
				});
			const {
				title,
				state,
				user: { login },
				merge_commit_sha,
				merged,
			} = rsp;
			const filtdRsp = {
				title,
				state: merged ? "merged" : state,
				status: rsp.status,
				user: login,
				merge_commit_sha,
			};
			return Ok(filtdRsp);
		} catch (e) {
			return Err({ type: 404, msg: "NotFound! " + String(e) });
		}
	}

	async isContain(branch: string, commit: string): Promise<boolean> {
		try {
			const { status } = await this.inner
				.get(`compare/${branch}...${commit}`)
				.json<{ status: string }>();

			return status === "identical" || status === "behind";
		} catch (e) {
			console.log(e);
		}
		return false;
	}

	async chk(
		bs: string[],
		merge_commit_sha: string,
		extraOp?: (branch: string) => void,
	): Promise<Throwable<MergeStats>> {
		const ret0 = await Promise.all(
			bs.map(
				async (b): Promise<[string, boolean]> => [
					b,
					await (async () => {
						const ret = await this.isContain(b, merge_commit_sha);
						if (ret && extraOp) extraOp(b);
						return ret;
					})(),
				],
			),
		);
		const ret1 = ret0.reduce<Record<string, boolean>>((acc, [key, boo]) => {
			acc[key as string] = boo;
			return acc;
		}, {});
		return Ok(ret1);
	}
}

export const verifiedPr = (pr: string): Throwable<number, "Invalid"> => {
	const isValidPrNum = (raw: string) => !isNaN(Number(raw)) && Number(raw) > 0;
	if (pr.length == 0) return Err('Invalid')

	try {
		const url = new URL(pr);
		if (url.protocol === "https:") {
			const assumePrN = url.pathname.split("/").slice(-1)[0];
			if (isValidPrNum(assumePrN!)) return Ok(Number(assumePrN));
		}
	} catch (e) { console.log(e) }
	if (pr.startsWith("#")) {
		const assume = pr.slice(1);
		if (isValidPrNum(assume)) return Ok(Number(assume));
	}
	if (isValidPrNum(pr)) {
		return Ok(Number(pr));
	}
	return Err("Invalid");
};

const Tracker = () => {
	const event = useKeyDownEvent();
	const [tokenText, setTokenText] = createSignal("");
	const [loading, setLoading] = createSignal(false);
	const [qnum, setQnum] = createSignal<number>();
	const [showPanel, setShowPanel] = createSignal<boolean>();
	const [btnAvail, setBtnAvail] = createSignal<boolean>();
	const [cache, setCache] = createSignal<
		PrMeta & {
			merge: MergeStats;
			num: number;
		}
	>();

	const api = new API(
		"nixos/nixpkgs",
		tokenText() != "" ? { Authorization: `token ${tokenText()}` } : {},
	);

	const branchStatus = new ReactiveMap<string, boolean>(
		commonBranch.map((n) => [n, false]),
	);

	const resetBranchStatus = () => {
		branchStatus.forEach((_, v) => {
			branchStatus.set(v, false);
		});
	};
	const setWhichTrue = (branch: string) => {
		branchStatus.set(branch, true);
	};
	const startQuery = async () => {
		const querying = qnum()!;
		resetBranchStatus();
		setLoading(true);
		setShowPanel(false);
		const meta = await api.getMeta(qnum()!);
		setShowPanel(true);
		if (meta.isError || !meta.value) {
			setLoading(false);
			return;
		}
		const ret0 = (
			await api.chk(commonBranch, meta.value.merge_commit_sha, setWhichTrue)
		).unwrap();
		setCache({ ...meta.unwrap(), merge: ret0, num: querying });
		console.log(cache());

		setLoading(false);
	};
	createEffect(() => {
		setBtnAvail(qnum() ? true : false);
	});
	createEffect(() => {
		const e = event();
		if (e && e.key == "Enter") {
			startQuery();
			e.preventDefault();
		}
	});

	return (
		<>
			<div class="grid md:grid-cols-2 gap-3 place-items-start">
				<div class="flex flex-col w-full justify-center items-start space-y-4 md:space-y-2">
					<input
						type="text"
						class="mx-auto p-2 border"
						placeholder="PR Link (or number)"
						onBeforeInput={(e) => verifiedPr(e.target.value).isOk}
						onInput={(e) => {
							if (verifiedPr(e.target.value).pipe(setQnum).isError) setQnum(undefined)
						}
						}
					/>
					<input
						type="password"
						class="mx-auto p-2 border"
						placeholder="API Token (Optional)"
						onInput={(e) => setTokenText(e.data!)}
					/>
					<button
						class="btn glass mx-auto"
						disabled={!btnAvail()}
						onClick={startQuery}
					>
						Query
					</button>

					<Show
						when={!loading()}
						fallback={
							<div class="i-svg-spinners:wind-toy w-full h-8 text-sprout-400" />
						}
					>
						<div
							class={twMerge(
								"h-full p-2 text-zink-800 rounded-md shadow-md opacity-85 w-full font-mono whitespace-break-spaces text-center",
								(() => {
									switch (cache()?.state) {
										case "merged":
											return "bg-violet-200"
										case "closed":
											return "bg-red-200"
										case "open":
											return "bg-sprout-100"
										default:
											return "bg-yellow-200"
									}
								})(),
								showPanel() ? "opacity-100" : "opacity-0",
							)}
							onClick={() =>
								cache()?.state
									? window.open(
										"https://github.com/nixos/nixpkgs/pull/" +
										cache()?.num,
									)
									: ""
							}
						>
							{cache()?.state
								? cache()?.title +
								"\n" +
								`from ${cache()?.user}` +
								"\n" +
								cache()?.state?.toUpperCase()
								: !cache()?.state
									? "Pull Req Not Found"
									: null}
						</div>
					</Show>
				</div>

				<div class="flex flex-col justify-center items-center mx-auto">
					<For each={Array.from(branchStatus)}>
						{(k, _) => {
							return (
								<>
									<div class="flex items-start h-8">
										<div class={k[1] ? `text-sprout-400` : `text-slate-300`}>
											{k}
										</div>
										<Show when={k[1]}>〇</Show>
									</div>
								</>
							);
						}}
					</For>
				</div>
			</div>
		</>
	);
};

export default Tracker;
