import ky, { KyInstance } from "ky";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { twMerge } from "tailwind-merge";
import { useKeyDownEvent } from "@solid-primitives/keyboard";


export type PrInfo = {
	title: string
	state: string
	status: number
	user: { login: string }
	merge_commit_sha: string
}

const validPrNum = (raw: string) => {
	return !isNaN(Number(raw)) && Number(raw) > 0
}
export const buildPr = (pr: string) => {
	try {
		const url = new URL(pr);
		if (url.protocol === 'https:') {
			const assumePrN = url.pathname.split('/').slice(-1)[0];
			if (validPrNum(assumePrN!)) return Number(assumePrN)
		}
	} catch (e) {
	}
	if (pr.startsWith('#')) {
		const assume = pr.slice(1);
		if (validPrNum(assume))
			return Number(pr);
	}
	if (validPrNum(pr)) {
		return Number(pr);
	}
};

class UnauthError extends Error {
	statusCode: number;
	constructor(message: string) {
		super(message);
		this.name = "UnauthorizedError";
		this.statusCode = 401;
	}
}
export const getTitle = async (pr: number, api: KyInstance): Promise<Partial<PrInfo>> => {
	try {
		const response = await api.get(`pulls/${pr}`).json<any>();
		if (response.status === 401) throw new UnauthError("rate limited, you could fill auth token")

		const filteredResponse: Partial<PrInfo> = {
			title: response.title,
			state: response.merged ? "merged" : response.state,
			status: response.status,
			user: { login: response.user.login },
			merge_commit_sha: response.merge_commit_sha,
		};

		return filteredResponse;
	} catch (e) {
		console.log(e);
		return {};
	}
};

export const isContain = async (
	branch: string,
	commit: string,
	api: KyInstance
): Promise<boolean> => {
	try {
		const { status } = await api
			.get(`compare/${branch}...${commit}`)
			.json<any>();
		return status === "identical" || status === "behind";
	} catch (error) {
		// @ts-ignore
		if (error.response?.status === 404) {
			return false;
		}
		throw error;
	}
};

const Tracker = () => {

	// ==========================

	type PrState = Partial<"open" | "closed" | "merged">

	const event = useKeyDownEvent();
	const [tokenText, setTokenText] = createSignal("");
	const [btnStatus, setBtnStatus] = createSignal(false);
	const [loading, setLoading] = createSignal(false);
	const [qnum, setQnum] = createSignal<number>();
	const [queryStatus, setQueryStatus] = createSignal<Partial<{
		title: string, state: PrState, user: string, how: "good" | "bad" | "unknown"
	}>>();

	const api = ky.create({
		prefixUrl: "https://api.github.com/repos/nixos/nixpkgs/",
		headers: tokenText() ? { Authorization: `token ${tokenText()}` } : {},
	});

	const branchStatus = new ReactiveMap<string, boolean>([
		["staging-next", false],
		["master", false],
		["nixos-unstable-small", false],
		["nixpkgs-unstable", false],
		["nixos-unstable", false],
	]);

	const resetBranchStatus = () => {
		branchStatus.forEach((_, v) => {
			branchStatus.set(v, false);
		});
	};
	const startQuery = async () => {
		resetBranchStatus()
		await chkAllBranch(qnum()!);
		setBtnStatus(true);
	}
	createEffect(() => {
		setBtnStatus(qnum() ? true : false);
	});
	createEffect(() => {
		const e = event();
		if (e && e.key == "Enter") {
			startQuery();
			e.preventDefault();
		}
	});
	const chkLocal = async (bs: string[], pr: Partial<PrInfo>) => {
		setQueryStatus({
			title: pr.title!,
			state: pr.state as PrState,
			user: pr.user?.login!,
			how: pr.state ? "good" : "bad"
		},)
		setLoading(true)
		await Promise.all(bs.map(async b => {
			await isContain(b, pr.merge_commit_sha!, api) ?
				(() => {
					branchStatus.set(b, true)
				})() : null;
		}))
		setLoading(false)
	};

	const chkAllBranch = async (n: number) => {
		setBtnStatus(false);
		try {
			const r = await getTitle(n, api);

			if (r.status == 404) {
				setQueryStatus({ title: "Not Found", how: "bad" })
				throw new Error("get pr title error, NotFound");
			}
			if (r.status == 401) {
				setQueryStatus({ title: "Unauthorized", how: "bad" })
				throw new Error("get pr title error, unauthorized");
			}
			if (!r.merge_commit_sha) {
				setQueryStatus({ title: "Bad body", how: "bad" })
				throw new Error("get merge commit sha error")
			};

			const prInfo = r as Partial<PrInfo>;

			return await chkLocal(Array.from(branchStatus.keys()), prInfo); // checked
		} catch (error) {
			console.error(error);
			throw error;
		}
	};
	return (
		<>
			<div class="grid md:grid-cols-2 gap-3 place-items-start">
				<div class="flex flex-col w-full justify-center items-start space-y-4 md:space-y-2">
					<input
						type="text"
						class="mx-auto p-2 border"
						placeholder="PR Link (or number)"
						onBeforeInput={(e) => !buildPr(e.target.value)}
						onInput={(e) => setQnum(buildPr(e.target.value))}
					/>
					<input
						type="password"
						class="mx-auto p-2 border"
						placeholder="API Token (Optional)"
						onInput={(e) => setTokenText(e.data!)}
					/>
					<button
						class="btn glass mx-auto"
						disabled={!btnStatus()}
						onClick={startQuery}
					>
						Query
					</button>

					<Show when={!loading()} fallback={<div class="i-svg-spinners:wind-toy w-full h-8 text-sprout-400" />}>
						<div
							class={twMerge(
								"h-full p-2 text-zink-800 rounded-md shadow-md opacity-85 w-full font-mono",
								queryStatus()?.state == "merged"
									? "bg-violet-200"
									: queryStatus()?.state == "closed"
										? "bg-red-200"
										: "bg-yellow-200",
								queryStatus()?.how ? "opacity-100" : "opacity-0"
							)}
							onClick={() =>
								queryStatus()?.state
									? window.open(
										"https://github.com/nixos/nixpkgs/pull/" + qnum(),
									)
									: ""
							}
						>
							{queryStatus()?.state || queryStatus()?.how != "bad" ? `${queryStatus()?.title}\nfrom ${queryStatus()?.user}\n | ${(queryStatus()?.state)?.toUpperCase()}` :
								!queryStatus()?.state ? "Pull Req Not Found" : null}
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
				</div >
			</div>
		</>
	);
};

export default Tracker;
