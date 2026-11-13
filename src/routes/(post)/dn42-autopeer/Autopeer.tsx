import ky from "ky";
import { customAlphabet } from "nanoid";
import { createSignal, Show, For, createEffect, onCleanup } from "solid-js";
import { twMerge } from "tailwind-merge";
import { codeToHtml } from "shiki";
import "./autopeer.css";

const NODES = [
	{
		domain: "jp-tyo-1.dn42.nyaw.xyz",
		name: "abhoth",
		city: "Tokyo",
		flag: "🇯🇵",
		iata: "NRT",
		isp: "DMIT",
		stack: "Dual",
	},
	{
		domain: "jp-tyo-2.dn42.nyaw.xyz",
		name: "nodens",
		city: "Tokyo",
		flag: "🇯🇵",
		iata: "NRT",
		isp: "OCI",
		stack: "Dual",
	},
	{
		domain: "sgp-1.dn42.nyaw.xyz",
		name: "yidhra",
		city: "Singapore",
		flag: "🇸🇬",
		iata: "SIN",
		isp: "PanStar",
		stack: "Dual",
	},
];

const REGIONS = [...new Set(NODES.map((node) => node.city))];

const API_ORIGIN = "https://dn42.nyaw.xyz";
const PEERS_API = `${API_ORIGIN}/api/peers`;
const CHALLENGES_API = `${API_ORIGIN}/api/challenges`;
const LOCAL_ASN = 4242420291;
const generatePeerName = customAlphabet(
	"abcdefghijklmnopqrstuvwxyz0123456789",
	8,
);

export default function Autopeer() {
	// Operation mode: post (Create) | patch (Update) | delete (Delete) | check (Check Status)
	const [mode, setMode] = createSignal<"post" | "patch" | "delete" | "check">(
		"post",
	);

	// Stepper state: 1 (Node) -> 2 (Parameters) -> 3 (Signing Key) -> 4 (Sign & Authenticate) -> 5 (Result)
	const [currentStep, setCurrentStep] = createSignal(1);

	// Node selection state
	const [region, setRegion] = createSignal("");
	const [selectedNode, setSelectedNode] = createSignal("");
	const targetNode = () => NODES.find((node) => node.domain === selectedNode());

	// Parameters state
	const [asn, setAsn] = createSignal("");
	const [peerName, setPeerName] = createSignal("");
	const [pubkey, setPubkey] = createSignal("");
	const [endpoint, setEndpoint] = createSignal("");
	const [clearEndpoint, setClearEndpoint] = createSignal(false);
	const [advanced, setAdvanced] = createSignal(false);
	const [mtu, setMtu] = createSignal("");
	const [clearMtu, setClearMtu] = createSignal(false);
	const [manualLla, setManualLla] = createSignal(false);
	const [localLlIp, setLocalLlIp] = createSignal("");
	const [remoteLlIp, setRemoteLlIp] = createSignal("");

	// Signing & Challenge state
	const [signMode, setSignMode] = createSignal<"ssh" | "gpg">("ssh");
	const [auth, setAuth] = createSignal("");
	const [selectedKeyIdx, setSelectedKeyIdx] = createSignal(0);
	const [signature, setSignature] = createSignal("");
	const [nonce, setNonce] = createSignal("");
	const [expiresAt, setExpiresAt] = createSignal<number | null>(null);
	const [challengeNotice, setChallengeNotice] = createSignal("");
	const [now, setNow] = createSignal(0);

	// Remote data & Loading state
	const [loading, setLoading] = createSignal(false);
	const [challengeLoading, setChallengeLoading] = createSignal(false);
	const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
	const [result, setResult] = createSignal<any>(null);
	const [peerList, setPeerList] = createSignal<any[] | null>(null);
	const [copiedAddress, setCopiedAddress] = createSignal("");
	const [copiedCmd, setCopiedCmd] = createSignal(false);
	const [copiedConfig, setCopiedConfig] = createSignal(false);

	// Key fetching state
	const [fetchingKeys, setFetchingKeys] = createSignal(false);
	const [keyFetchError, setKeyFetchError] = createSignal<string | null>(null);
	const [fetchedKeys, setFetchedKeys] = createSignal<
		{ mntner: string; value: string; type: "ssh" | "gpg"; comment?: string }[]
	>([]);

	// Syntax highlighted code
	const [highlightedCmd, setHighlightedCmd] = createSignal("");
	const [highlightedWgConfig, setHighlightedWgConfig] = createSignal("");
	const [highlightedBgpConfig, setHighlightedBgpConfig] = createSignal("");
	const [activeConfigTab, setActiveConfigTab] = createSignal<"wg" | "bgp">(
		"wg",
	);

	// Timer for challenge expiration
	const remainingSeconds = () => Math.max(0, (expiresAt() ?? 0) - now());
	const challengeExpired = () => !!nonce() && remainingSeconds() === 0;
	const remainingTime = () =>
		`${Math.floor(remainingSeconds() / 60)}:${String(remainingSeconds() % 60).padStart(2, "0")}`;

	createEffect(() => {
		if (!expiresAt()) return;
		setNow(Math.floor(Date.now() / 1000));
		const timer = window.setInterval(
			() => setNow(Math.floor(Date.now() / 1000)),
			1000,
		);
		onCleanup(() => window.clearInterval(timer));
	});

	// ASN helpers
	const parseAsn = (value: string = asn()) => {
		const val = value.trim().replace(/^AS/i, "");
		if (!/^\d+$/.test(val)) return null;
		const parsed = Number(val);
		return Number.isSafeInteger(parsed) && parsed <= 0xffffffff ? parsed : null;
	};
	const getParsedAsn = () => parseAsn() ?? "<your_asn>";
	const asnLinkLocal = (value: number) =>
		`fe80::${Math.floor(value / 0x10000).toString(16)}:${(value % 0x10000).toString(16)}`;
	const remoteLinkLocal = () => {
		const parsed = parseAsn();
		return parsed === null ? null : asnLinkLocal(parsed);
	};
	const normalizeLinkLocal = (input: string) => {
		const value = input.trim().replace(/^\[|\]$/g, "");
		try {
			const host = new URL(`http://[${value}]/`).hostname.slice(1, -1);
			return host.startsWith("fe80:") ? host : null;
		} catch {
			return null;
		}
	};
	const yourLinkLocal = () =>
		manualLla() ? normalizeLinkLocal(remoteLlIp()) : remoteLinkLocal();
	const nyawLinkLocal = () =>
		manualLla() ? normalizeLinkLocal(localLlIp()) : asnLinkLocal(LOCAL_ASN);
	const linkLocalMessage = () => {
		if (!manualLla()) return "auto";
		return `manual:${nyawLinkLocal() ?? "<nyaw_ll_ip>"}:${yourLinkLocal() ?? "<your_ll_ip>"}`;
	};

	const normalizeEndpoint = (input: string) => {
		const value = input.trim();
		if (!value) return "";
		try {
			const url = new URL(`http://${value}`);
			if (
				!url.port ||
				url.pathname !== "/" ||
				url.search ||
				url.hash ||
				url.username ||
				url.password
			)
				return null;
			const host = url.hostname;
			const isIpv6 = host.startsWith("[") && host.endsWith("]");
			const isIpv4 =
				host.split(".").length === 4 &&
				host.split(".").every((part) => /^\d+$/.test(part));
			const isHostname =
				/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host) &&
				!host.includes("..");
			if (!isIpv4 && !isIpv6 && !isHostname) return null;
			return `${isIpv6 ? host : host.toLowerCase()}:${url.port}`;
		} catch {
			return null;
		}
	};
	const endpointMessage = () => {
		const normalized = normalizeEndpoint(endpoint());
		if (mode() === "post") return normalized || "none";
		if (clearEndpoint()) return "clear";
		return normalized ? `set:${normalized}` : "unchanged";
	};
	const getParsedMtu = () => {
		const value = mtu().trim();
		if (!value) return null;
		const parsed = Number(value);
		return Number.isSafeInteger(parsed) && parsed >= 1280 && parsed <= 9000
			? parsed
			: null;
	};
	const mtuMessage = () => {
		const m = getParsedMtu();
		if (mode() === "post") return m ? m.toString() : "default";
		if (clearMtu()) return "default";
		return m ? `set:${m}` : "unchanged";
	};

	const isValidPeerName = () =>
		/^[a-z0-9][a-z0-9-]{0,31}$/.test(peerName().trim());

	// Invalidate challenge upon parameter modifications
	const invalidateChallenge = () => {
		if (nonce()) {
			setChallengeNotice(
				"Parameters changed. Get a new command and sign it again.",
			);
		}
		setResult(null);
		setErrorMsg(null);
		setNonce("");
		setExpiresAt(null);
		setSignature("");
	};

	// Key fetching from DN42 registry
	const fetchAuthKeys = async (parsedAsn: number) => {
		setFetchingKeys(true);
		setFetchedKeys([]);
		setKeyFetchError(null);
		try {
			const asnRes = await ky
				.get(`https://explorer.burble.com/api/registry/aut-num/AS${parsedAsn}`)
				.json<any>();
			const attributes = asnRes[`aut-num/AS${parsedAsn}`]?.Attributes;
			if (!attributes) {
				if (parseAsn() === parsedAsn)
					setKeyFetchError(`No registry entry was found for AS${parsedAsn}.`);
				return;
			}

			const mntners: string[] = [];
			for (const attr of attributes) {
				if (attr[0] === "mnt-by") {
					const match = attr[1].match(/\(mntner\/(.+?)\)$/);
					if (match) mntners.push(match[1]);
				}
			}

			const keys: {
				mntner: string;
				value: string;
				type: "ssh" | "gpg";
				comment?: string;
			}[] = [];
			let maintainerFetchFailed = false;
			for (const mntner of mntners) {
				try {
					const mntRes = await ky
						.get(`https://explorer.burble.com/api/registry/mntner/${mntner}`)
						.json<any>();
					const mntAttrs = mntRes[`mntner/${mntner}`]?.Attributes;
					if (!mntAttrs) continue;
					for (const attr of mntAttrs) {
						if (attr[0] === "auth") {
							const val: string = attr[1];
							const isGpg =
								val.includes("BEGIN PGP") || val.includes("pgp-fingerprint");
							const comment = val.includes("ssh-")
								? val.split(" ")[2] || `${mntner} Key`
								: isGpg
									? "GPG Key"
									: `${mntner} Key`;
							keys.push({
								mntner,
								value: val,
								type: isGpg ? "gpg" : "ssh",
								comment,
							});
						}
					}
				} catch {
					maintainerFetchFailed = true;
				}
			}
			if (parseAsn() !== parsedAsn) return;
			setFetchedKeys(keys);
			if (keys.length === 0) {
				setKeyFetchError(
					maintainerFetchFailed
						? "Could not fetch maintainer keys. Try again or enter your key manually."
						: `No signing keys were found for AS${parsedAsn}.`,
				);
			} else {
				setSelectedKeyIdx(0);
				setAuth(keys[0].value);
				setSignMode(keys[0].type);
			}
		} catch (e) {
			if (parseAsn() === parsedAsn)
				setKeyFetchError(
					`Could not fetch registry keys for AS${parsedAsn}. Check the ASN and try again.`,
				);
			console.error("Failed to fetch auth keys:", e);
		} finally {
			if (parseAsn() === parsedAsn) setFetchingKeys(false);
		}
	};

	let asnTimeout: number | undefined;
	createEffect(() => {
		const currentAsn = asn();
		setFetchedKeys([]);
		setKeyFetchError(null);
		setAuth("");
		setFetchingKeys(parseAsn(currentAsn) !== null);
		clearTimeout(asnTimeout);
		asnTimeout = window.setTimeout(() => {
			const parsed = parseAsn(currentAsn);
			if (parsed !== null) {
				fetchAuthKeys(parsed);
			} else {
				setFetchedKeys([]);
			}
		}, 500);
		onCleanup(() => clearTimeout(asnTimeout));
	});

	// Operation selection
	const selectOperation = (nextOp: "post" | "patch" | "delete" | "check") => {
		if (nextOp === mode()) return;
		setMode(nextOp);
		setCurrentStep(1);
		setSelectedNode("");
		setRegion("");
		setChallengeNotice("");
		setClearEndpoint(false);
		setClearMtu(false);
		invalidateChallenge();
		setPeerList(null);
		setResult(null);
		setErrorMsg(null);
	};

	// Step navigation
	const chooseRegion = (city: string) => {
		if (region() !== city) {
			setRegion(city);
			setSelectedNode("");
			setPeerList(null);
			invalidateChallenge();
		}
	};

	const chooseNode = (domain: string) => {
		setSelectedNode(domain);
		setPeerList(null);
		invalidateChallenge();
		// Auto advance to parameters step
		window.setTimeout(() => {
			setCurrentStep(2);
		}, 150);
	};

	// Challenge command generation
	const challengeValidationError = () => {
		if (!targetNode()) return "Select a target node.";
		if (parseAsn() === null) return "Enter a valid ASN first.";
		if (!isValidPeerName() && !(mode() === "post" && !peerName().trim()))
			return "Enter a valid peer name.";
		if (mode() !== "delete" && !/^[A-Za-z0-9+/]{43}=$/.test(pubkey().trim()))
			return "Enter a valid 44-character Base64 WireGuard public key.";
		if (
			mode() !== "delete" &&
			!clearMtu() &&
			mtu().trim() &&
			getParsedMtu() === null
		)
			return "Enter an MTU from 1280 to 9000.";
		if (
			mode() !== "delete" &&
			!clearEndpoint() &&
			endpoint().trim() &&
			normalizeEndpoint(endpoint()) === null
		)
			return "The endpoint must contain an IP address or hostname and port.";
		if (
			mode() !== "delete" &&
			manualLla() &&
			(!nyawLinkLocal() || !yourLinkLocal())
		)
			return "Enter two valid IPv6 link-local addresses.";
		return null;
	};

	const canConfirmParams = () => {
		const parsed = parseAsn();
		if (!targetNode() || parsed === null) return false;
		if (mode() === "check") return true;
		if (mode() === "delete") return isValidPeerName();
		if (mode() === "patch")
			return isValidPeerName() && challengeValidationError() === null;
		return challengeValidationError() === null;
	};

	const confirmParameters = () => {
		const error = challengeValidationError();
		if (error && mode() !== "check") {
			setErrorMsg(error);
			return;
		}
		if (mode() === "post" && !peerName().trim()) {
			setPeerName(generatePeerName());
		}
		setErrorMsg(null);

		if (mode() === "check") {
			getPeers();
			setCurrentStep(5);
			return;
		}

		setCurrentStep(3);
	};

	const challengeMessage = () => {
		const a = getParsedAsn();
		const name = peerName().trim() || "<peer_name>";
		const pk = pubkey().trim() || "<your_wireguard_pubkey>";
		const challengeNonce = nonce() || "<nonce>";
		const expiration = expiresAt() ?? "<expires_at>";
		if (mode() === "delete") {
			return `DN42-AUTOPEER-V3\noperation:delete\nasn:${a}\npeer_name:${name}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
		}
		return `DN42-AUTOPEER-V3\noperation:${mode() === "post" ? "create" : "update"}\nasn:${a}\npeer_name:${name}\npubkey:${pk}\nendpoint:${endpointMessage()}\nlink_local:${linkLocalMessage()}\nmtu:${mtuMessage()}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
	};

	const challengeCmd = () => {
		const validationError = challengeValidationError();
		if (validationError && mode() !== "delete") return `# ${validationError}`;
		if (!nonce() || !expiresAt())
			return "# Request a signing challenge from the server first.";

		const message = challengeMessage().replaceAll("'", "'\\''");
		const writeMessage = `printf '%s' '${message}' > dn42-autopeer-request.txt`;
		if (signMode() === "ssh") {
			return `${writeMessage}\nssh-keygen -Y sign -f <key> -n dn42 dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.sig`;
		}
		return `${writeMessage}\ngpg --armor --detach-sign dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.asc`;
	};

	createEffect(() => {
		const cmd = challengeCmd();
		setHighlightedCmd("");
		let current = true;
		onCleanup(() => {
			current = false;
		});
		codeToHtml(cmd, { lang: "bash", theme: "vitesse-light" })
			.then((html) => {
				if (current) setHighlightedCmd(html);
			})
			.catch(() => {
				setHighlightedCmd("");
			});
	});

	const wgConfigString = () => {
		const res = result();
		if (!res || !res.wg_config) return "";
		return `[Interface]
# Your Assigned IP
Address = ${res.wg_config.your_assigned_ip.includes("/") ? res.wg_config.your_assigned_ip : `${res.wg_config.your_assigned_ip}/128`}
Table = off
MTU = ${getParsedMtu() || 1420}

[Peer]
PublicKey = ${res.wg_config.my_pubkey}
Endpoint = ${res.wg_config.my_endpoint}
AllowedIPs = ${res.wg_config.allowed_ips}`;
	};

	createEffect(() => {
		const conf = wgConfigString();
		if (!conf) {
			setHighlightedWgConfig("");
			return;
		}
		codeToHtml(conf, { lang: "ini", theme: "vitesse-light" })
			.then((html) => setHighlightedWgConfig(html))
			.catch(() => setHighlightedWgConfig(""));
	});

	const bgpConfigString = () => {
		const res = result();
		if (!res || !res.bgp_config) return "";
		return `My ASN: AS${res.bgp_config.my_asn}
My IP: ${res.bgp_config.my_neighbor_ip}
Multiprotocol: ${res.bgp_config.multiprotocol ? "Yes" : "No"}`;
	};

	createEffect(() => {
		const conf = bgpConfigString();
		if (!conf) {
			setHighlightedBgpConfig("");
			return;
		}
		codeToHtml(conf, { lang: "yaml", theme: "vitesse-light" })
			.then((html) => setHighlightedBgpConfig(html))
			.catch(() => setHighlightedBgpConfig(""));
	});

	const buildPayload = () => {
		const payload: any = {
			asn: parseAsn(),
			peer_name: peerName().trim(),
			challenge: {
				auth: auth(),
				signature: signature(),
				nonce: nonce(),
				expires_at: expiresAt(),
			},
		};
		if (mode() !== "delete" && pubkey().trim()) {
			payload.pubkey = pubkey().trim();
		}
		if (mode() !== "delete") {
			payload.manual_lla = manualLla();
			if (manualLla()) {
				payload.local_ll_ip = nyawLinkLocal();
				payload.remote_ll_ip = yourLinkLocal();
			}
		}
		const normalized = normalizeEndpoint(endpoint());
		if (mode() === "patch" && clearEndpoint()) payload.endpoint = null;
		else if (mode() !== "delete" && normalized) payload.endpoint = normalized;

		if (mode() === "post" && getParsedMtu()) {
			payload.mtu = getParsedMtu();
		} else if (mode() === "patch") {
			if (clearMtu()) payload.mtu = null;
			else if (getParsedMtu()) payload.mtu = getParsedMtu();
		}
		return payload;
	};

	const readError = async (error: any) => {
		try {
			const body = await error.response.json();
			return body.detail
				? `${body.error}: ${body.detail}`
				: body.error || body.message || error.message;
		} catch {
			return error.message;
		}
	};

	const getChallenge = async () => {
		const parsedAsn = parseAsn();
		if (!targetNode() || parsedAsn === null) return;
		setChallengeLoading(true);
		setErrorMsg(null);
		setResult(null);
		try {
			const challenge = await ky
				.post(CHALLENGES_API, {
					json: { asn: parsedAsn },
					headers: { "X-Backend-Target": selectedNode() },
				})
				.json<{ nonce: string; expires_at: number }>();
			setChallengeNotice("");
			setNonce(challenge.nonce);
			setExpiresAt(challenge.expires_at);
			setSignature("");
			setCurrentStep(4);
		} catch (error: any) {
			setErrorMsg(await readError(error));
		} finally {
			setChallengeLoading(false);
		}
	};

	const getPeers = async () => {
		const parsedAsn = parseAsn();
		if (!targetNode() || parsedAsn === null) return;
		setLoading(true);
		setErrorMsg(null);
		setPeerList(null);
		try {
			const res = await ky
				.get(`${PEERS_API}/${parsedAsn}`, {
					headers: { "X-Backend-Target": selectedNode() },
				})
				.json<any[]>();
			setPeerList(res);
		} catch (e: any) {
			setErrorMsg(await readError(e));
		} finally {
			setLoading(false);
		}
	};

	const request = async () => {
		if (
			!asn() ||
			!isValidPeerName() ||
			!auth() ||
			!signature() ||
			!nonce() ||
			!expiresAt()
		) {
			setErrorMsg("All parameters, key, and signature are required.");
			return;
		}
		if (challengeExpired()) {
			setErrorMsg("The challenge expired. Request a new challenge.");
			return;
		}

		setLoading(true);
		setErrorMsg(null);
		setResult(null);

		try {
			let res;
			const reqOptions = {
				json: buildPayload(),
				headers: { "X-Backend-Target": selectedNode() },
			};
			if (mode() === "post") {
				res = await ky.post(PEERS_API, reqOptions).json();
			} else if (mode() === "patch") {
				res = await ky.patch(PEERS_API, reqOptions).json();
			} else if (mode() === "delete") {
				res = await ky.delete(PEERS_API, reqOptions).json();
			}
			setResult(res);
			setCurrentStep(5);
		} catch (e: any) {
			setErrorMsg(await readError(e));
			setChallengeNotice(
				"The request failed. Get a new command and sign it again before retrying.",
			);
		} finally {
			setNonce("");
			setExpiresAt(null);
			setSignature("");
			setLoading(false);
		}
	};

	const copyToClipboard = async (
		text: string,
		type: "cmd" | "config" | "addr",
	) => {
		try {
			await navigator.clipboard.writeText(text);
			if (type === "cmd") {
				setCopiedCmd(true);
				window.setTimeout(() => setCopiedCmd(false), 1500);
			} else if (type === "config") {
				setCopiedConfig(true);
				window.setTimeout(() => setCopiedConfig(false), 1500);
			} else if (type === "addr") {
				setCopiedAddress(text);
				window.setTimeout(() => setCopiedAddress(""), 1500);
			}
		} catch {
			setErrorMsg("Could not copy to clipboard.");
		}
	};

	const canSubmitFinal = () => {
		if (!nonce() || challengeExpired()) return false;
		if (!signature().trim() || !auth().trim()) return false;
		return true;
	};

	return (
		<div class="autopeer not-prose w-full mx-auto py-2">
			{/* Header */}
			<div class="mb-5 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-bold tracking-tight text-gray-900">
						DN42 Autopeer
					</h2>
					<p class="mt-0.5 text-xs text-gray-500">
						Automated WireGuard & BGP peering · AS4242420291
					</p>
				</div>
				<a
					href="https://explorer.dn42.dev/#/aut-num/AS4242420291"
					target="_blank"
					rel="noreferrer"
					class="text-xs text-gray-400 hover:text-sprout-600 transition-colors flex items-center gap-1"
				>
					Registry
					<div class="i-material-symbols:open-in-new w-3.5 h-3.5" />
				</a>
			</div>

			{/* Adaptive Operation Segmented Control */}
			<div class="autopeer-op-bar mb-6" role="group" aria-label="Operation">
				<button
					type="button"
					class={twMerge("autopeer-op-pill", mode() === "post" && "active")}
					onClick={() => selectOperation("post")}
					title="Create Peer"
				>
					<div class="i-material-symbols:add-rounded w-4 h-4 flex-shrink-0" />
					<span class="autopeer-op-label">Create Peer</span>
				</button>
				<button
					type="button"
					class={twMerge("autopeer-op-pill", mode() === "patch" && "active")}
					onClick={() => selectOperation("patch")}
					title="Update Peer"
				>
					<div class="i-material-symbols:edit-outline-rounded w-4 h-4 flex-shrink-0" />
					<span class="autopeer-op-label">Update</span>
				</button>
				<button
					type="button"
					class={twMerge("autopeer-op-pill", mode() === "delete" && "active")}
					onClick={() => selectOperation("delete")}
					title="Delete Peer"
				>
					<div class="i-material-symbols:delete-outline-rounded w-4 h-4 flex-shrink-0" />
					<span class="autopeer-op-label">Delete</span>
				</button>
				<button
					type="button"
					class={twMerge("autopeer-op-pill", mode() === "check" && "active")}
					onClick={() => selectOperation("check")}
					title="Check Status"
				>
					<div class="i-material-symbols:search-rounded w-4 h-4 flex-shrink-0" />
					<span class="autopeer-op-label">Check Status</span>
				</button>
			</div>

			{/* Stepper Workflow */}
			<div class="space-y-0">
				{/* ===================== STEP 1: Select Node ===================== */}
				<div class="flex gap-3.5">
					<div class="flex flex-col items-center">
						<div
							class={twMerge(
								"autopeer-circle",
								currentStep() === 1 && "active",
								currentStep() > 1 && "done",
							)}
						>
							<Show when={currentStep() > 1} fallback={"1"}>
								<div class="i-material-symbols:check-small-rounded w-5 h-5 text-white" />
							</Show>
						</div>
						<div
							class={twMerge(
								"autopeer-connector flex-1 my-1.5",
								currentStep() > 1 && "done",
							)}
						/>
					</div>
					<div class="flex-1 pb-7 min-w-0">
						<div class="flex items-center justify-between py-1">
							<button
								type="button"
								onClick={() => setCurrentStep(1)}
								class="flex items-center gap-2 text-left bg-transparent border-0 p-0 cursor-pointer"
							>
								<span
									class={twMerge(
										"text-sm font-semibold",
										currentStep() >= 1 ? "text-gray-900" : "text-gray-400",
									)}
								>
									Select Node
								</span>
								<Show when={currentStep() > 1 && targetNode()}>
									<span class="text-xs text-gray-400 font-normal">
										{region()} · {targetNode()?.name}
									</span>
								</Show>
							</button>
							<Show when={currentStep() > 1}>
								<button
									type="button"
									onClick={() => setCurrentStep(1)}
									class="text-xs font-medium text-sprout-600 hover:text-sprout-700 bg-transparent border-0 cursor-pointer"
								>
									Edit
								</button>
							</Show>
						</div>

						<Show when={currentStep() === 1}>
							<div class="mt-3">
								{/* Hint explaining what happens upon node selection */}
								<div class="mb-3 p-2.5 rounded-lg bg-sprout-50/60 border border-sprout-200/50 flex items-center justify-between text-xs text-sprout-800">
									<div class="flex items-center gap-1.5">
										<div class="i-material-symbols:info-outline-rounded w-4 h-4 text-sprout-600 flex-shrink-0" />
										<span>
											WireGuard endpoint, port, and BGP config are provisioned
											in the final step.
										</span>
									</div>
								</div>

								{/* Region horizontal bar */}
								<div class="mb-3">
									<div class="mb-1.5">
										<span class="text-xs text-gray-500 font-medium">
											Select Region
										</span>
									</div>
									<div class="autopeer-region-scroll">
										<For each={REGIONS}>
											{(city) => {
												const count = NODES.filter(
													(n) => n.city === city,
												).length;
												const flag =
													NODES.find((n) => n.city === city)?.flag || "🌐";
												return (
													<button
														type="button"
														class={twMerge(
															"autopeer-region-btn",
															region() === city && "selected",
														)}
														onClick={() => chooseRegion(city)}
													>
														<span>{flag}</span>
														<span>{city}</span>
														<span class="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
															{count}
														</span>
													</button>
												);
											}}
										</For>
									</div>
								</div>

								{/* Node selection cards */}
								<Show when={region()}>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
										<For each={NODES.filter((n) => n.city === region())}>
											{(node) => (
												<button
													type="button"
													class={twMerge(
														"autopeer-node-card",
														selectedNode() === node.domain && "selected",
													)}
													onClick={() => chooseNode(node.domain)}
												>
													<div class="flex items-center justify-between">
														<span class="text-xs font-bold text-gray-800">
															{node.name}
														</span>
														<span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
															{node.stack}
														</span>
													</div>
													<div class="text-[11px] text-gray-500 mt-1">
														{node.isp} · {node.iata}
													</div>
													<div class="text-[10px] font-mono text-gray-400 mt-1 truncate">
														{node.domain}
													</div>
												</button>
											)}
										</For>
									</div>
								</Show>
							</div>
						</Show>
					</div>
				</div>

				{/* ===================== STEP 2: Parameters ===================== */}
				<div class="flex gap-3.5">
					<div class="flex flex-col items-center">
						<div
							class={twMerge(
								"autopeer-circle",
								currentStep() === 2 && "active",
								currentStep() > 2 && "done",
							)}
						>
							<Show when={currentStep() > 2} fallback={"2"}>
								<div class="i-material-symbols:check-small-rounded w-5 h-5 text-white" />
							</Show>
						</div>
						<div
							class={twMerge(
								"autopeer-connector flex-1 my-1.5",
								currentStep() > 2 && "done",
								mode() === "check" && "hidden",
							)}
						/>
					</div>
					<div class="flex-1 pb-7 min-w-0">
						<div class="flex items-center justify-between py-1">
							<button
								type="button"
								disabled={currentStep() < 2}
								onClick={() => setCurrentStep(2)}
								class="flex items-center gap-2 text-left bg-transparent border-0 p-0 disabled:cursor-not-allowed"
							>
								<span
									class={twMerge(
										"text-sm font-semibold",
										currentStep() >= 2 ? "text-gray-900" : "text-gray-400",
									)}
								>
									{mode() === "check"
										? "ASN Lookup"
										: mode() === "delete"
											? "Peer Identification"
											: "Connection Parameters"}
								</span>
								<Show when={currentStep() > 2 && parseAsn() !== null}>
									<span class="text-xs text-gray-400 font-normal">
										AS{parseAsn()}
										{mode() !== "check" && peerName() ? ` · ${peerName()}` : ""}
									</span>
								</Show>
							</button>
							<Show when={currentStep() > 2}>
								<button
									type="button"
									onClick={() => setCurrentStep(2)}
									class="text-xs font-medium text-sprout-600 hover:text-sprout-700 bg-transparent border-0 cursor-pointer"
								>
									Edit
								</button>
							</Show>
						</div>

						<Show when={currentStep() === 2}>
							<div class="mt-3 space-y-3.5">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<label class="block">
										<span class="block text-xs font-medium text-gray-700 mb-1">
											Your ASN <span class="text-rose-500">*</span>
										</span>
										<input
											type="text"
											inputmode="numeric"
											placeholder="424242xxxx"
											class="autopeer-input"
											value={asn()}
											onInput={(e) => {
												setAsn(e.currentTarget.value);
												setPeerList(null);
												invalidateChallenge();
											}}
										/>
									</label>

									<Show when={mode() !== "check"}>
										<label class="block">
											<span class="block text-xs font-medium text-gray-700 mb-1">
												Peer Name{" "}
												<span class="text-gray-400 font-normal">
													{mode() === "post"
														? "· auto-generated if blank"
														: "· required"}
												</span>
											</span>
											<input
												type="text"
												placeholder="e.g. tokyo-peer"
												class="autopeer-input"
												value={peerName()}
												onInput={(e) => {
													setPeerName(e.currentTarget.value);
													invalidateChallenge();
												}}
											/>
										</label>
									</Show>
								</div>

								<Show when={mode() === "post" || mode() === "patch"}>
									<label class="block">
										<span class="block text-xs font-medium text-gray-700 mb-1">
											WireGuard Public Key <span class="text-rose-500">*</span>
										</span>
										<input
											type="text"
											placeholder="Base64 encoded public key (44 chars)"
											class="autopeer-input font-mono text-xs"
											value={pubkey()}
											onInput={(e) => {
												setPubkey(e.currentTarget.value);
												invalidateChallenge();
											}}
										/>
									</label>

									<label class="block">
										<div class="flex justify-between items-center mb-1">
											<span class="text-xs font-medium text-gray-700">
												Endpoint{" "}
												<span class="text-gray-400 font-normal">
													· optional, for roaming
												</span>
											</span>
											<Show when={mode() === "patch"}>
												<label class="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
													<input
														type="checkbox"
														checked={clearEndpoint()}
														onChange={(e) => {
															setClearEndpoint(e.currentTarget.checked);
															if (e.currentTarget.checked) setEndpoint("");
															invalidateChallenge();
														}}
													/>
													Clear existing
												</label>
											</Show>
										</div>
										<input
											type="text"
											placeholder="peer.example.net:51820"
											class="autopeer-input font-mono text-xs"
											disabled={clearEndpoint()}
											value={endpoint()}
											onInput={(e) => {
												setEndpoint(e.currentTarget.value);
												invalidateChallenge();
											}}
										/>
									</label>

									{/* Advanced Settings */}
									<div class="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
										<button
											type="button"
											onClick={() => setAdvanced(!advanced())}
											class="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-gray-600 hover:bg-gray-100/60 transition-colors bg-transparent border-0 cursor-pointer"
										>
											<span class="flex items-center gap-1.5">
												<div class="i-material-symbols:tune-rounded w-3.5 h-3.5 text-gray-400" />
												Advanced Settings
												<span class="text-gray-400 font-normal">
													· Link-Local Addr & MTU
												</span>
											</span>
											<div
												class={twMerge(
													"i-material-symbols:keyboard-arrow-down-rounded w-4 h-4 text-gray-400 transition-transform",
													advanced() && "rotate-180",
												)}
											/>
										</button>
										<Show when={advanced()}>
											<div class="p-3.5 pt-0 space-y-3 border-t border-gray-200/60">
												<div class="pt-3">
													<label class="block text-xs font-medium text-gray-700 mb-1">
														MTU{" "}
														<span class="text-gray-400 font-normal">
															· default 1420
														</span>
													</label>
													<input
														type="number"
														min="1280"
														max="9000"
														placeholder="1420"
														class="autopeer-input"
														value={mtu()}
														disabled={clearMtu()}
														onInput={(e) => {
															setMtu(e.currentTarget.value);
															invalidateChallenge();
														}}
													/>
													<Show when={mode() === "patch"}>
														<label class="flex items-center gap-1.5 mt-2 text-xs text-gray-600 cursor-pointer">
															<input
																type="checkbox"
																checked={clearMtu()}
																onChange={(e) => {
																	setClearMtu(e.currentTarget.checked);
																	invalidateChallenge();
																}}
															/>
															Reset MTU to default
														</label>
													</Show>
												</div>

												<div>
													<label class="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
														<input
															type="checkbox"
															checked={manualLla()}
															onChange={(e) => {
																setManualLla(e.currentTarget.checked);
																invalidateChallenge();
															}}
														/>
														Manually set IPv6 link-local addresses
													</label>
													<Show when={manualLla()}>
														<div class="grid grid-cols-2 gap-3 mt-2">
															<label class="block">
																<span class="block text-[11px] text-gray-500 mb-0.5">
																	Neighbor BGP IP (nyaw)
																</span>
																<input
																	type="text"
																	placeholder="fe80::291"
																	class="autopeer-input font-mono text-xs"
																	value={localLlIp()}
																	onInput={(e) => {
																		setLocalLlIp(e.currentTarget.value);
																		invalidateChallenge();
																	}}
																/>
															</label>
															<label class="block">
																<span class="block text-[11px] text-gray-500 mb-0.5">
																	Your BGP IP
																</span>
																<input
																	type="text"
																	placeholder="fe80::xxxx"
																	class="autopeer-input font-mono text-xs"
																	value={remoteLlIp()}
																	onInput={(e) => {
																		setRemoteLlIp(e.currentTarget.value);
																		invalidateChallenge();
																	}}
																/>
															</label>
														</div>
													</Show>
												</div>
											</div>
										</Show>
									</div>
								</Show>

								{/* Continue Button */}
								<div class="pt-1">
									<button
										type="button"
										onClick={confirmParameters}
										disabled={!canConfirmParams() || loading()}
										class={twMerge(
											"autopeer-btn-primary w-full",
											mode() === "delete" && "autopeer-btn-danger",
										)}
									>
										{loading()
											? "Checking..."
											: mode() === "check"
												? "Check Peers"
												: mode() === "delete"
													? "Continue to Deletion"
													: "Continue"}
									</button>
								</div>
							</div>
						</Show>
					</div>
				</div>

				{/* ===================== STEP 3: Select Signing Key ===================== */}
				<Show when={mode() !== "check"}>
					<div class="flex gap-3.5">
						<div class="flex flex-col items-center">
							<div
								class={twMerge(
									"autopeer-circle",
									currentStep() === 3 && "active",
									currentStep() > 3 && "done",
								)}
							>
								<Show when={currentStep() > 3} fallback={"3"}>
									<div class="i-material-symbols:check-small-rounded w-5 h-5 text-white" />
								</Show>
							</div>
							<div
								class={twMerge(
									"autopeer-connector flex-1 my-1.5",
									currentStep() > 3 && "done",
								)}
							/>
						</div>
						<div class="flex-1 pb-7 min-w-0">
							<div class="flex items-center justify-between py-1">
								<button
									type="button"
									disabled={currentStep() < 3}
									onClick={() => setCurrentStep(3)}
									class="flex items-center gap-2 text-left bg-transparent border-0 p-0 disabled:cursor-not-allowed"
								>
									<span
										class={twMerge(
											"text-sm font-semibold",
											currentStep() >= 3 ? "text-gray-900" : "text-gray-400",
										)}
									>
										Signing Key
									</span>
									<Show when={currentStep() > 3 && auth()}>
										<span class="text-xs text-gray-400 font-normal">
											{signMode().toUpperCase()} ·{" "}
											{fetchedKeys()[selectedKeyIdx()]?.comment ||
												(auth().length > 24
													? `${auth().slice(0, 16)}…`
													: auth())}
										</span>
									</Show>
								</button>
								<Show when={currentStep() > 3}>
									<button
										type="button"
										onClick={() => setCurrentStep(3)}
										class="text-xs font-medium text-sprout-600 hover:text-sprout-700 bg-transparent border-0 cursor-pointer"
									>
										Edit
									</button>
								</Show>
							</div>

							<Show when={currentStep() === 3}>
								<div class="mt-3 space-y-3.5">
									{/* Key Selection Card */}
									<div class="border border-gray-200 rounded-lg p-3.5 bg-white">
										<div class="flex items-center justify-between mb-2">
											<span class="text-xs font-semibold text-gray-700">
												Registry Signing Key
											</span>
											<div class="flex bg-gray-100 rounded-md p-0.5 text-xs border border-gray-200/50">
												<button
													type="button"
													class={twMerge(
														"autopeer-sign-type-btn",
														signMode() === "ssh" && "active",
													)}
													onClick={() => {
														setSignMode("ssh");
														const match = fetchedKeys().findIndex(
															(k) => k.type === "ssh",
														);
														if (match !== -1) {
															setSelectedKeyIdx(match);
															setAuth(fetchedKeys()[match].value);
														}
													}}
												>
													SSH
												</button>
												<button
													type="button"
													class={twMerge(
														"autopeer-sign-type-btn",
														signMode() === "gpg" && "active",
													)}
													onClick={() => {
														setSignMode("gpg");
														const match = fetchedKeys().findIndex(
															(k) => k.type === "gpg",
														);
														if (match !== -1) {
															setSelectedKeyIdx(match);
															setAuth(fetchedKeys()[match].value);
														}
													}}
												>
													GPG
												</button>
											</div>
										</div>

										<Show when={fetchingKeys()}>
											<p class="text-xs text-gray-500 py-2">
												Fetching keys from registry...
											</p>
										</Show>

										<Show when={keyFetchError()}>
											<div class="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 mb-2">
												{keyFetchError()}
											</div>
										</Show>

										<Show
											when={fetchedKeys().length > 0}
											fallback={
												<Show when={!fetchingKeys()}>
													<textarea
														rows={3}
														placeholder={
															signMode() === "ssh"
																? "ssh-ed25519 AAAAC3..."
																: "-----BEGIN PGP PUBLIC KEY BLOCK-----\n..."
														}
														class="autopeer-input h-auto py-2 font-mono text-xs"
														value={auth()}
														onInput={(e) => {
															setAuth(e.currentTarget.value);
															setSignature("");
														}}
													/>
												</Show>
											}
										>
											<div class="space-y-1.5 mt-2">
												<For each={fetchedKeys()}>
													{(key, idx) => {
														const isSelected = () => idx() === selectedKeyIdx();
														const isMatching = () => key.type === signMode();
														return (
															<button
																type="button"
																class={twMerge(
																	"autopeer-key-option",
																	isSelected() && "selected",
																	!isMatching() && "opacity-50",
																)}
																onClick={() => {
																	setSelectedKeyIdx(idx());
																	setAuth(key.value);
																	setSignMode(key.type);
																	setSignature("");
																}}
															>
																<div
																	class={twMerge(
																		"w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
																		isSelected()
																			? "border-sprout-500 bg-sprout-500 text-white"
																			: "border-gray-300 bg-white",
																	)}
																>
																	<Show when={isSelected()}>
																		<div class="i-material-symbols:check-small-rounded w-3.5 h-3.5" />
																	</Show>
																</div>
																<div class="min-w-0 flex-1">
																	<div class="flex items-center gap-2">
																		<span class="text-xs font-semibold text-gray-800">
																			{key.comment || key.mntner}
																		</span>
																		<span
																			class={twMerge(
																				"text-[10px] uppercase font-bold px-1.5 py-0.2 rounded",
																				key.type === "ssh"
																					? "bg-blue-50 text-blue-700"
																					: "bg-purple-50 text-purple-700",
																			)}
																		>
																			{key.type}
																		</span>
																		<span class="text-[11px] text-gray-400 font-normal">
																			({key.mntner})
																		</span>
																	</div>
																	<div class="text-[11px] font-mono text-gray-500 truncate mt-0.5">
																		{key.value}
																	</div>
																</div>
															</button>
														);
													}}
												</For>
											</div>
										</Show>

										<p class="text-[11px] text-gray-400 mt-2">
											Fetched from your DN42 maintainer object.
										</p>
									</div>

									{/* Action button to obtain challenge & advance */}
									<button
										type="button"
										class="autopeer-btn-primary w-full"
										disabled={challengeLoading() || !auth().trim()}
										onClick={getChallenge}
									>
										{challengeLoading()
											? "Requesting challenge..."
											: nonce() && !challengeExpired()
												? "Update Challenge & Continue"
												: "Get Signing Challenge & Continue"}
									</button>
								</div>
							</Show>
						</div>
					</div>

					{/* ===================== STEP 4: Authentication & Signature ===================== */}
					<div class="flex gap-3.5">
						<div class="flex flex-col items-center">
							<div
								class={twMerge(
									"autopeer-circle",
									currentStep() === 4 && "active",
									currentStep() > 4 && "done",
								)}
							>
								<Show when={currentStep() > 4} fallback={"4"}>
									<div class="i-material-symbols:check-small-rounded w-5 h-5 text-white" />
								</Show>
							</div>
							<div
								class={twMerge(
									"autopeer-connector flex-1 my-1.5",
									currentStep() > 4 && "done",
								)}
							/>
						</div>
						<div class="flex-1 pb-7 min-w-0">
							<div class="flex items-center justify-between py-1">
								<button
									type="button"
									disabled={currentStep() < 4}
									onClick={() => setCurrentStep(4)}
									class="flex items-center gap-2 text-left bg-transparent border-0 p-0 disabled:cursor-not-allowed"
								>
									<span
										class={twMerge(
											"text-sm font-semibold",
											currentStep() >= 4 ? "text-gray-900" : "text-gray-400",
										)}
									>
										Authentication
									</span>
								</button>
							</div>

							<Show when={currentStep() === 4}>
								<div class="mt-3 space-y-3.5">
									<Show
										when={nonce() && !challengeExpired()}
										fallback={
											<div class="p-3.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-center justify-between">
												<span>
													{challengeExpired()
														? "The challenge has expired. Request a new challenge."
														: "Please request a signing challenge first."}
												</span>
												<button
													type="button"
													class="autopeer-btn-primary h-7 text-xs px-2.5"
													disabled={challengeLoading()}
													onClick={getChallenge}
												>
													{challengeLoading() ? "Requesting..." : "Get Challenge"}
												</button>
											</div>
										}
									>
										<div class="space-y-3">
											<div class="flex items-center justify-between">
												<div class="flex items-center gap-1.5">
													<span class="inline-block w-2 h-2 rounded-full bg-sprout-500 animate-pulse" />
													<span class="text-xs text-gray-600 font-medium">
														Expires in {remainingTime()}
													</span>
												</div>
												<button
													type="button"
													class="autopeer-btn-secondary flex items-center gap-1"
													onClick={() => copyToClipboard(challengeCmd(), "cmd")}
												>
													<Show
														when={copiedCmd()}
														fallback={
															<>
																<div class="i-material-symbols:content-copy-outline-rounded w-3.5 h-3.5" />
																<span>Copy Command</span>
															</>
														}
													>
														<div class="i-material-symbols:check-small-rounded w-4 h-4 text-sprout-600" />
														<span class="text-sprout-700 font-semibold">
															Copied
														</span>
													</Show>
												</button>
											</div>

											{/* Code block */}
											<Show
												when={highlightedCmd()}
												fallback={
													<pre class="autopeer-code">{challengeCmd()}</pre>
												}
											>
												<div
													class="autopeer-highlight"
													innerHTML={highlightedCmd()}
												/>
											</Show>

											<p class="text-[11px] text-gray-500">
												Run the command above locally with your private key,
												then paste the detached signature below:
											</p>

											<label class="block">
												<textarea
													rows={8}
													placeholder={
														signMode() === "ssh"
															? "-----BEGIN SSH SIGNATURE-----\nU1NIU0lHAAAA...\n-----END SSH SIGNATURE-----"
															: "-----BEGIN PGP SIGNATURE-----\nVersion: GnuPG...\n\n...\n-----END PGP SIGNATURE-----"
													}
													class="autopeer-input h-auto min-h-[140px] py-3 font-mono text-xs leading-relaxed"
													value={signature()}
													onInput={(e) => setSignature(e.currentTarget.value)}
												/>
											</label>

											<button
												type="button"
												class={twMerge(
													"autopeer-btn-primary w-full",
													mode() === "delete" && "autopeer-btn-danger",
												)}
												disabled={!canSubmitFinal() || loading()}
												onClick={request}
											>
												{loading()
													? "Submitting..."
													: mode() === "post"
														? "Create Peer & Authenticate"
														: mode() === "patch"
															? "Update Peer"
															: "Delete Peer Permanently"}
											</button>
										</div>
									</Show>
								</div>
							</Show>
						</div>
					</div>
				</Show>

				{/* ===================== STEP 5: Upcoming / Result ===================== */}
				<Show when={mode() !== "check" && currentStep() < 5}>
					<div class="flex gap-3.5 opacity-60">
						<div class="flex flex-col items-center">
							<div class="autopeer-circle text-gray-300 border-gray-200">5</div>
						</div>
						<div class="flex-1 pb-2 min-w-0 py-1">
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium text-gray-400">
									Configuration Output
								</span>
								<span class="text-[11px] text-gray-400 font-normal">
									· WireGuard & BGP configs generated after authentication
								</span>
							</div>
						</div>
					</div>
				</Show>

				{/* ===================== STEP 5: Result (Active) ===================== */}
				<Show when={currentStep() === 5}>
					<div class="flex gap-3.5">
						<div class="flex flex-col items-center">
							<div class="autopeer-circle done">
								<div class="i-material-symbols:check-small-rounded w-5 h-5 text-white" />
							</div>
						</div>
						<div class="flex-1 pb-7 min-w-0">
							<div class="flex items-center justify-between py-1">
								<span class="text-sm font-semibold text-sprout-700">
									{mode() === "check"
										? `Peers for AS${parseAsn()}`
										: mode() === "delete"
											? "Peer Deleted"
											: "Configuration Ready"}
								</span>
								<button
									type="button"
									onClick={() => selectOperation(mode())}
									class="text-xs font-medium text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
								>
									Start Over
								</button>
							</div>

							<div class="mt-3 space-y-3.5">
								{/* Success or Delete Banner */}
								<Show when={result()}>
									<div class="p-3.5 rounded-lg bg-sprout-50 border border-sprout-200/80 flex items-start gap-3">
										<div class="w-6 h-6 rounded-full bg-sprout-500 flex items-center justify-center flex-shrink-0 mt-0.5">
											<div class="i-material-symbols:check-small-rounded w-4 h-4 text-white" />
										</div>
										<div>
											<p class="text-xs font-bold text-sprout-800">
												{result()?.message ||
													(mode() === "delete"
														? "Peer removed successfully"
														: "Peer created successfully")}
											</p>
											<p class="text-xs text-sprout-700 mt-0.5">
												{result()?.peer_name} on {targetNode()?.name} (
												{targetNode()?.city})
											</p>
										</div>
									</div>

									{/* IP assignment cards */}
									<Show when={result()?.wg_config}>
										<div class="grid grid-cols-2 gap-2.5">
											<div class="p-2.5 rounded-lg border border-gray-200 bg-white">
												<div class="flex items-center justify-between">
													<span class="text-[11px] text-gray-500 font-medium">
														Your BGP IP
													</span>
													<button
														type="button"
														onClick={() =>
															copyToClipboard(
																result().wg_config.your_assigned_ip.split(
																	"/",
																)[0],
																"addr",
															)
														}
														class="text-[10px] text-sprout-600 hover:underline bg-transparent border-0 cursor-pointer"
													>
														{copiedAddress() ===
														result().wg_config.your_assigned_ip.split("/")[0]
															? "Copied"
															: "Copy"}
													</button>
												</div>
												<code class="text-xs font-mono font-semibold text-gray-800 block mt-1">
													{result().wg_config.your_assigned_ip.split("/")[0]}
												</code>
											</div>

											<div class="p-2.5 rounded-lg border border-gray-200 bg-white">
												<div class="flex items-center justify-between">
													<span class="text-[11px] text-gray-500 font-medium">
														Neighbor BGP IP
													</span>
													<button
														type="button"
														onClick={() =>
															copyToClipboard(
																result().bgp_config?.my_neighbor_ip,
																"addr",
															)
														}
														class="text-[10px] text-sprout-600 hover:underline bg-transparent border-0 cursor-pointer"
													>
														{copiedAddress() ===
														result().bgp_config?.my_neighbor_ip
															? "Copied"
															: "Copy"}
													</button>
												</div>
												<code class="text-xs font-mono font-semibold text-gray-800 block mt-1">
													{result().bgp_config?.my_neighbor_ip}
												</code>
											</div>
										</div>

										{/* Config viewer */}
										<div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
											<div class="flex items-center justify-between px-3 py-2 bg-gray-50/80 border-b border-gray-200">
												<div class="flex gap-1">
													<button
														type="button"
														class={twMerge(
															"px-2.5 py-1 text-xs rounded font-medium transition-all bg-transparent border-0 cursor-pointer",
															activeConfigTab() === "wg"
																? "bg-white shadow-sm font-semibold text-sprout-700 border border-gray-200/60"
																: "text-gray-500 hover:text-gray-700",
														)}
														onClick={() => setActiveConfigTab("wg")}
													>
														WireGuard
													</button>
													<button
														type="button"
														class={twMerge(
															"px-2.5 py-1 text-xs rounded font-medium transition-all bg-transparent border-0 cursor-pointer",
															activeConfigTab() === "bgp"
																? "bg-white shadow-sm font-semibold text-sprout-700 border border-gray-200/60"
																: "text-gray-500 hover:text-gray-700",
														)}
														onClick={() => setActiveConfigTab("bgp")}
													>
														BGP
													</button>
												</div>
												<button
													type="button"
													class="autopeer-btn-secondary text-[11px] py-1 h-auto"
													onClick={() =>
														copyToClipboard(
															activeConfigTab() === "wg"
																? wgConfigString()
																: bgpConfigString(),
															"config",
														)
													}
												>
													<Show
														when={copiedConfig()}
														fallback={
															<>
																<div class="i-material-symbols:content-copy-outline-rounded w-3.5 h-3.5 mr-1 inline" />
																<span>Copy</span>
															</>
														}
													>
														<div class="i-material-symbols:check-small-rounded w-3.5 h-3.5 mr-1 inline text-sprout-600" />
														<span class="text-sprout-700 font-semibold">
															Copied
														</span>
													</Show>
												</button>
											</div>
											<div class="p-3 bg-[#fdfcf9] font-mono text-xs leading-relaxed text-gray-700 overflow-x-auto">
												<Show when={activeConfigTab() === "wg"}>
													<Show
														when={highlightedWgConfig()}
														fallback={
															<pre class="whitespace-pre-wrap">
																{wgConfigString()}
															</pre>
														}
													>
														<div innerHTML={highlightedWgConfig()} />
													</Show>
												</Show>
												<Show when={activeConfigTab() === "bgp"}>
													<Show
														when={highlightedBgpConfig()}
														fallback={
															<pre class="whitespace-pre-wrap">
																{bgpConfigString()}
															</pre>
														}
													>
														<div innerHTML={highlightedBgpConfig()} />
													</Show>
												</Show>
											</div>
										</div>

										<p class="text-xs text-gray-400">
											Apply this configuration on your router to establish
											peering.
										</p>
									</Show>
								</Show>

								{/* Check mode peer listing */}
								<Show when={mode() === "check" && peerList() !== null}>
									<Show
										when={peerList()!.length > 0}
										fallback={
											<div class="p-4 rounded-lg border border-gray-200 bg-white text-xs text-gray-500">
												No active peers found for AS{parseAsn()} on{" "}
												{targetNode()?.name}.
											</div>
										}
									>
										<div class="space-y-3">
											<For each={peerList()!}>
												{(peer) => (
													<div class="p-3.5 rounded-lg border border-gray-200 bg-white">
														<div class="flex justify-between items-center mb-2.5">
															<div class="flex items-center gap-2">
																<span class="text-xs font-bold text-gray-800">
																	{peer.peer_name}
																</span>
																<span
																	class={twMerge(
																		"text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase",
																		peer.status === "active"
																			? "bg-sprout-100 text-sprout-800"
																			: peer.status === "error"
																				? "bg-rose-100 text-rose-800"
																				: "bg-gray-100 text-gray-600",
																	)}
																>
																	{peer.status}
																</span>
															</div>
															<span class="text-[11px] text-gray-400">
																{new Date(
																	peer.created_at * 1000,
																).toLocaleDateString()}
															</span>
														</div>
														<div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
															<div>
																<span class="text-gray-400 text-[11px] block">
																	Endpoint
																</span>
																<span class="font-mono text-[11px]">
																	{peer.endpoint || "Roaming"}
																</span>
															</div>
															<div>
																<span class="text-gray-400 text-[11px] block">
																	MTU
																</span>
																<span>{peer.mtu}</span>
															</div>
															<div>
																<span class="text-gray-400 text-[11px] block">
																	Remote IP
																</span>
																<span class="font-mono text-[11px]">
																	{peer.remote_ll_ip}
																</span>
															</div>
															<div>
																<span class="text-gray-400 text-[11px] block">
																	Local IP
																</span>
																<span class="font-mono text-[11px]">
																	{peer.local_ll_ip}
																</span>
															</div>
														</div>
													</div>
												)}
											</For>
										</div>
									</Show>
								</Show>
							</div>
						</div>
					</div>
				</Show>
			</div>

			{/* Global Error Notice */}
			<Show when={errorMsg()}>
				<div
					role="alert"
					class="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2"
				>
					<div class="i-material-symbols:error-outline-rounded w-4 h-4 flex-shrink-0" />
					<span>{errorMsg()}</span>
				</div>
			</Show>

			<Show when={challengeNotice()}>
				<div
					role="status"
					class="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-center gap-2"
				>
					<div class="i-material-symbols:info-outline-rounded w-4 h-4 flex-shrink-0" />
					<span>{challengeNotice()}</span>
				</div>
			</Show>
		</div>
	);
}
