import ky from "ky";
import { createSignal, Show, createEffect, onMount } from "solid-js";
import { twMerge } from "tailwind-merge";
import { codeToHtml } from "shiki";

const NODES = [
	{ domain: "jp-tyo-1.dn42.nyaw.xyz", label: "DMIT - Tokyo (jp-tyo-1)" },
	{ domain: "jp-tyo-2.dn42.nyaw.xyz", label: "OCI - Tokyo (jp-tyo-2)" },
	{ domain: "sgp-1.dn42.nyaw.xyz", label: "Panstar - Singapore (sgp-1)" },
];

const API_ORIGIN = "https://dn42.nyaw.xyz";
const PEERS_API = `${API_ORIGIN}/api/peers`;
const CHALLENGES_API = `${API_ORIGIN}/api/challenges`;
const LOCAL_ASN = 4242420291;

export default function Autopeer() {
	const [selectedNode, setSelectedNode] = createSignal(NODES[0].domain);
	const [asn, setAsn] = createSignal("");
	const [peerName, setPeerName] = createSignal("");
	const [pubkey, setPubkey] = createSignal("");
	const [endpoint, setEndpoint] = createSignal("");
	const [auth, setAuth] = createSignal("");
	const [signature, setSignature] = createSignal("");
	const [mode, setMode] = createSignal<"post" | "patch" | "delete" | "check">(
		"post",
	);
	const [signMode, setSignMode] = createSignal<"ssh" | "gpg">("ssh");
	const [clearEndpoint, setClearEndpoint] = createSignal(false);
	const [mtu, setMtu] = createSignal("");
	const [clearMtu, setClearMtu] = createSignal(false);
	const [manualLla, setManualLla] = createSignal(false);
	const [localLlIp, setLocalLlIp] = createSignal("");
	const [remoteLlIp, setRemoteLlIp] = createSignal("");
	const [nonce, setNonce] = createSignal("");
	const [expiresAt, setExpiresAt] = createSignal<number | null>(null);

	const [loading, setLoading] = createSignal(false);
	const [challengeLoading, setChallengeLoading] = createSignal(false);
	const [errorMsg, setErrorMsg] = createSignal<string | null>(null);
	const [result, setResult] = createSignal<any>(null);
	const [peerList, setPeerList] = createSignal<any[] | null>(null);
	if (typeof window !== "undefined") {
		(window as any).setResult = setResult;
	}
	const [copiedAddress, setCopiedAddress] = createSignal("");

	const [fetchingKeys, setFetchingKeys] = createSignal(false);
	const [fetchedKeys, setFetchedKeys] = createSignal<
		{ mntner: string; value: string }[]
	>([]);

	const [highlightedCmd, setHighlightedCmd] = createSignal("");
	const [highlightedWgConfig, setHighlightedWgConfig] = createSignal("");
	const [highlightedBgpConfig, setHighlightedBgpConfig] = createSignal("");
	const [codeBlockRef, setCodeBlockRef] = createSignal<HTMLDivElement>();
	const [copied, setCopied] = createSignal(false);

	const copyToClipboard = () => {
		if (codeBlockRef()) {
			const codeContent = codeBlockRef()!.innerText;
			if (codeContent) {
				navigator.clipboard.writeText(codeContent).then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				});
			}
		}
	};

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
	const copyAddress = async (address: string) => {
		try {
			await navigator.clipboard.writeText(address);
			setCopiedAddress(address);
			window.setTimeout(() => setCopiedAddress(""), 1500);
		} catch {
			setErrorMsg("The browser could not copy the address.");
		}
	};
	const getParsedPeerName = () => peerName().trim() || "<peer_name>";
	const isValidPeerName = () =>
		/^[a-z0-9][a-z0-9-]{0,31}$/.test(peerName().trim());
	const invalidateChallenge = () => {
		setNonce("");
		setExpiresAt(null);
		setSignature("");
	};

	const fetchAuthKeys = async (parsedAsn: number) => {
		setFetchingKeys(true);
		setFetchedKeys([]);
		try {
			const asnRes = await ky
				.get(`https://explorer.burble.com/api/registry/aut-num/AS${parsedAsn}`)
				.json<any>();
			const attributes = asnRes[`aut-num/AS${parsedAsn}`]?.Attributes;
			if (!attributes) return;

			const mntners = [];
			for (const attr of attributes) {
				if (attr[0] === "mnt-by") {
					const match = attr[1].match(/\(mntner\/(.+?)\)$/);
					if (match) mntners.push(match[1]);
				}
			}

			const keys = [];
			for (const mntner of mntners) {
				try {
					const mntRes = await ky
						.get(`https://explorer.burble.com/api/registry/mntner/${mntner}`)
						.json<any>();
					const mntAttrs = mntRes[`mntner/${mntner}`]?.Attributes;
					if (!mntAttrs) continue;
					for (const attr of mntAttrs) {
						if (attr[0] === "auth") {
							keys.push({ mntner, value: attr[1] });
						}
					}
				} catch (e) {
					// ignore
				}
			}
			setFetchedKeys(keys);
			if (keys.length > 0) {
				setAuth(keys[0].value);
				if (
					keys[0].value.includes("BEGIN PGP") ||
					keys[0].value.includes("pgp-fingerprint")
				) {
					setSignMode("gpg");
				} else {
					setSignMode("ssh");
				}
			}
		} catch (e) {
			console.error("Failed to fetch auth keys:", e);
		} finally {
			setFetchingKeys(false);
		}
	};

	let asnTimeout: number | undefined;
	createEffect(() => {
		const currentAsn = asn();
		clearTimeout(asnTimeout);
		asnTimeout = window.setTimeout(() => {
			const parsed = parseAsn(currentAsn);
			if (parsed !== null) {
				fetchAuthKeys(parsed);
			} else {
				setFetchedKeys([]);
			}
		}, 1500);
	});

	const selectMode = (nextMode: "post" | "patch" | "delete" | "check") => {
		setMode(nextMode);
		setClearEndpoint(false);
		setClearMtu(false);
		invalidateChallenge();
		setPeerList(null);
		setResult(null);
		setErrorMsg("");
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
	const canGetChallenge = () => parseAsn() !== null && isValidPeerName();

	const challengeMessage = () => {
		const a = getParsedAsn();
		const name = getParsedPeerName();
		const pk = pubkey().trim() || "<your_wireguard_pubkey>";
		const challengeNonce = nonce() || "<nonce>";
		const expiration = expiresAt() ?? "<expires_at>";
		if (mode() === "delete") {
			return `DN42-AUTOPEER-V3\noperation:delete\nasn:${a}\npeer_name:${name}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
		}
		return `DN42-AUTOPEER-V3\noperation:${mode() === "post" ? "create" : "update"}\nasn:${a}\npeer_name:${name}\npubkey:${pk}\nendpoint:${endpointMessage()}\nlink_local:${linkLocalMessage()}\nmtu:${mtuMessage()}\nnonce:${challengeNonce}\nexpires_at:${expiration}`;
	};

	const challengeCmd = () => {
		const a = parseAsn();
		const pk = pubkey().trim();

		if (a === null) {
			return "# Please fill out your ASN to generate the challenge command.";
		}
		if (!isValidPeerName()) {
			return "# Please enter a valid peer name to generate the challenge command.";
		}
		if (mode() !== "delete" && !pk) {
			return "# Please fill out your WireGuard Public Key to generate the challenge command.";
		}

		if (!nonce() || !expiresAt())
			return "# Get a challenge from the server first.";

		const message = challengeMessage().replaceAll("'", "'\\''");
		const writeMessage = `printf '%s' '${message}' > dn42-autopeer-request.txt`;
		if (signMode() === "ssh") {
			return `${writeMessage}\nssh-keygen -Y sign -f ~/.ssh/<your_id_ed25519> -n dn42 dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.sig`;
		}
		return `${writeMessage}\ngpg --armor --detach-sign dn42-autopeer-request.txt\ncat dn42-autopeer-request.txt.asc`;
	};

	createEffect(() => {
		const cmd = challengeCmd();
		codeToHtml(cmd, { lang: "bash", theme: "vitesse-light" })
			.then((html) => setHighlightedCmd(html))
			.catch((err) => {
				console.error("Shiki highlight error", err);
				setHighlightedCmd("");
			});
	});

	const wgConfigString = () => {
		const res = result();
		if (!res || !res.wg_config) return "";
		return `[Interface]
# Your Assigned IP
Address = ${res.wg_config.your_assigned_ip}/128
Table = off
MTU = ${getParsedMtu() || 1420}

[Peer]
# Nyaw Peer
PublicKey = ${res.wg_config.my_pubkey}
Endpoint = ${res.wg_config.my_endpoint}
AllowedIPs = ${res.wg_config.allowed_ips}
`;
	};

	createEffect(() => {
		const conf = wgConfigString();
		if (!conf) {
			setHighlightedWgConfig("");
			return;
		}
		codeToHtml(conf, { lang: "ini", theme: "vitesse-light" })
			.then((html) => setHighlightedWgConfig(html))
			.catch((err) => {
				console.error("Shiki highlight error wg config", err);
				setHighlightedWgConfig("");
			});
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
			.catch((err) => {
				console.error("Shiki highlight error bgp config", err);
				setHighlightedBgpConfig("");
			});
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
		if (mode() !== "delete" && pubkey().trim())
			payload.pubkey = pubkey().trim();
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
		if (parsedAsn === null) {
			setErrorMsg("Enter a valid ASN first.");
			return;
		}
		if (!isValidPeerName()) {
			setErrorMsg("Enter a valid peer name first.");
			return;
		}
		if (mode() !== "delete" && !pubkey().trim()) {
			setErrorMsg("Enter a WireGuard public key first.");
			return;
		}
		if (
			mode() !== "delete" &&
			!clearEndpoint() &&
			endpoint().trim() &&
			normalizeEndpoint(endpoint()) === null
		) {
			setErrorMsg(
				"The endpoint must contain an IP address or hostname and port.",
			);
			return;
		}
		if (
			mode() !== "delete" &&
			manualLla() &&
			(!nyawLinkLocal() || !yourLinkLocal())
		) {
			setErrorMsg("Enter two valid IPv6 link-local addresses.");
			return;
		}

		setChallengeLoading(true);
		setErrorMsg("");
		setResult(null);
		try {
			const challenge = await ky
				.post(CHALLENGES_API, {
					json: { asn: parsedAsn },
					headers: { "X-Backend-Target": selectedNode() },
				})
				.json<{ nonce: string; expires_at: number }>();
			setNonce(challenge.nonce);
			setExpiresAt(challenge.expires_at);
			setSignature("");
		} catch (error: any) {
			setErrorMsg(await readError(error));
		} finally {
			setChallengeLoading(false);
		}
	};

	const getPeers = async () => {
		const parsedAsn = parseAsn();
		if (parsedAsn === null) {
			setErrorMsg("Enter a valid ASN first.");
			return;
		}
		setLoading(true);
		setErrorMsg("");
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

	const request = async (method: "post" | "patch" | "delete") => {
		if (
			!asn() ||
			!isValidPeerName() ||
			!auth() ||
			!signature() ||
			!nonce() ||
			!expiresAt()
		) {
			setErrorMsg(
				"The ASN, peer name, auth key, signature, and a current challenge are required.",
			);
			return;
		}
		if (expiresAt()! < Math.floor(Date.now() / 1000)) {
			setErrorMsg("The challenge expired. Get a new challenge.");
			return;
		}
		if (method !== "delete" && !pubkey().trim()) {
			setErrorMsg(
				"WireGuard Public Key is required to create or update a peer.",
			);
			return;
		}

		setLoading(true);
		setErrorMsg("");
		setResult(null);

		try {
			let res;
			const reqOptions = {
				json: buildPayload(),
				headers: { "X-Backend-Target": selectedNode() },
			};
			if (method === "post") {
				res = await ky.post(PEERS_API, reqOptions).json();
			} else if (method === "patch") {
				res = await ky.patch(PEERS_API, reqOptions).json();
			} else if (method === "delete") {
				res = await ky.delete(PEERS_API, reqOptions).json();
			}
			setResult(res);
		} catch (e: any) {
			setErrorMsg(await readError(e));
		} finally {
			setNonce("");
			setExpiresAt(null);
			setSignature("");
			setClearEndpoint(false);
			setClearMtu(false);
			setLoading(false);
		}
	};

	const inputClass =
		"w-full px-4 py-2 mt-1 mb-4 text-sm bg-base-100 border border-base-content/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-base-content transition-all duration-300";
	const btnClass =
		"px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100";

	const canSubmit = () => {
		if (mode() === "check") return parseAsn() !== null;
		if (
			!asn() ||
			!isValidPeerName() ||
			!auth() ||
			!signature() ||
			!nonce() ||
			!expiresAt()
		)
			return false;
		if (expiresAt()! < Math.floor(Date.now() / 1000)) return false;
		if (mode() !== "delete" && !pubkey().trim()) return false;
		if (
			mode() !== "delete" &&
			manualLla() &&
			(!nyawLinkLocal() || !yourLinkLocal())
		)
			return false;
		return true;
	};

	return (
		<div class="max-w-2xl mx-auto p-6 bg-base-200/50 backdrop-blur-md rounded-2xl shadow-xl border border-base-content/10">
			<h2 class="text-2xl font-bold mb-6 text-base-content">
				Configure DN42 Peering
			</h2>

			<div class="mb-4">
				<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
					Select Target Node
				</label>
				<select
					class={inputClass}
					value={selectedNode()}
					onInput={(e) => {
						setSelectedNode(e.currentTarget.value);
						invalidateChallenge();
					}}
				>
					{NODES.map((node) => (
						<option value={node.domain}>{node.label}</option>
					))}
				</select>
			</div>

			<div class="mb-6 flex gap-2 p-1 bg-base-300/50 rounded-lg w-fit">
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "post"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("post")}
				>
					Create Peer
				</button>
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "patch"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("patch")}
				>
					Update
				</button>
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "delete"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("delete")}
				>
					Delete
				</button>
				<button
					class={twMerge(
						"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
						mode() === "check"
							? "bg-[#b5caa0] shadow-sm text-base-content/80"
							: "text-base-content/60 hover:text-base-content",
					)}
					onClick={() => selectMode("check")}
				>
					Check
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
				<div class={mode() === "check" ? "md:col-span-2" : ""}>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						Your ASN
					</label>
					<input
						type="text"
						placeholder="e.g. 4242421234"
						class={inputClass}
						value={asn()}
						onInput={(e) => {
							setAsn(e.currentTarget.value);
							invalidateChallenge();
						}}
					/>
				</div>
				<Show when={mode() !== "check"}>
					<div>
						<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
							Peer Name
						</label>
						<input
							type="text"
							placeholder="e.g. fra1"
							class={inputClass}
							value={peerName()}
							onInput={(e) => {
								setPeerName(e.currentTarget.value);
								invalidateChallenge();
							}}
						/>
						<p class="-mt-3 mb-4 text-[10px] text-base-content/50">
							Use lowercase letters, digits, or hyphens. Use a different name
							for each machine.
						</p>
					</div>
				</Show>
				<Show when={mode() !== "delete" && mode() !== "check"}>
					<div>
						<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
							{mode() === "patch"
								? "Endpoint (empty keeps current)"
								: "Endpoint (Optional)"}
						</label>
						<input
							type="text"
							placeholder="e.g. peer.example.net:51820"
							class={inputClass}
							value={endpoint()}
							disabled={clearEndpoint()}
							onInput={(e) => {
								setEndpoint(e.currentTarget.value);
								invalidateChallenge();
							}}
						/>
						<Show when={mode() === "patch"}>
							<label class="-mt-2 mb-4 flex items-center gap-2 text-xs text-base-content/70">
								<input
									type="checkbox"
									checked={clearEndpoint()}
									onChange={(e) => {
										setClearEndpoint(e.currentTarget.checked);
										invalidateChallenge();
									}}
								/>
								Clear the current endpoint
							</label>
						</Show>
					</div>
					<div>
						<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
							{mode() === "patch"
								? "MTU (empty keeps current)"
								: "MTU (Optional, default 1420)"}
						</label>
						<input
							type="number"
							placeholder="e.g. 1420"
							class={inputClass}
							value={mtu()}
							disabled={clearMtu()}
							onInput={(e) => {
								setMtu(e.currentTarget.value);
								invalidateChallenge();
							}}
						/>
						<Show when={mode() === "patch"}>
							<label class="-mt-2 mb-4 flex items-center gap-2 text-xs text-base-content/70">
								<input
									type="checkbox"
									checked={clearMtu()}
									onChange={(e) => {
										setClearMtu(e.currentTarget.checked);
										invalidateChallenge();
									}}
								/>
								Reset MTU to default (1420)
							</label>
						</Show>
					</div>
					<Show when={mode() !== "delete" && mode() !== "check"}>
						<div
							class="group relative mb-4 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-300/60 to-base-200/30 p-3 transition duration-200 hover:border-[#b5caa0]/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:col-span-2"
							tabindex="0"
							aria-describedby={
								manualLla() ? undefined : "link-local-address-help"
							}
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="font-sans text-xs font-semibold uppercase tracking-wide text-base-content/70">
										Link-local addresses
									</p>
									<p class="mt-0.5 font-sans text-[10px] text-base-content/50">
										{manualLla()
											? "Manual address assignment"
											: "Preview from the entered ASN"}
									</p>
								</div>
								<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-base-content/20 font-sans text-xs font-semibold text-base-content/50">
									?
								</span>
							</div>
							<label class="mt-3 flex items-center gap-2 font-sans text-[10px] text-base-content/70">
								<input
									type="checkbox"
									checked={manualLla()}
									onChange={(e) => {
										setManualLla(e.currentTarget.checked);
										invalidateChallenge();
									}}
								/>
								Manually set link-local addresses
							</label>
							<Show when={manualLla()}>
								<div class="mt-3 space-y-2">
									<div>
										<input
											type="text"
											placeholder="Nyaw BGP IP, e.g. fe80::1"
											class="peer w-full rounded-lg border border-base-content/20 bg-base-100 px-2.5 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/50"
											style="font-variant-ligatures: none;"
											value={localLlIp()}
											aria-describedby="nyaw-bgp-ip-help"
											onInput={(e) => {
												setLocalLlIp(e.currentTarget.value);
												invalidateChallenge();
											}}
										/>
										<p
											id="nyaw-bgp-ip-help"
											class="max-h-0 overflow-hidden px-1 font-sans text-[10px] leading-relaxed text-base-content/60 opacity-0 transition-all duration-200 peer-focus:mt-1 peer-focus:max-h-20 peer-focus:opacity-100"
										>
											Nyaw configures this address on its WireGuard interface.
											Use it as your BGP neighbor address.
										</p>
									</div>
									<div>
										<input
											type="text"
											placeholder="Your BGP IP, e.g. fe80::2"
											class="peer w-full rounded-lg border border-base-content/20 bg-base-100 px-2.5 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/50"
											style="font-variant-ligatures: none;"
											value={remoteLlIp()}
											aria-describedby="your-bgp-ip-help"
											onInput={(e) => {
												setRemoteLlIp(e.currentTarget.value);
												invalidateChallenge();
											}}
										/>
										<p
											id="your-bgp-ip-help"
											class="max-h-0 overflow-hidden px-1 font-sans text-[10px] leading-relaxed text-base-content/60 opacity-0 transition-all duration-200 peer-focus:mt-1 peer-focus:max-h-20 peer-focus:opacity-100"
										>
											Configure this address on your WireGuard interface. Nyaw
											uses it as the BGP neighbor address.
										</p>
									</div>
								</div>
							</Show>
							<Show when={!manualLla()}>
								<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
									<button
										type="button"
										disabled={!yourLinkLocal()}
										onClick={() => {
											const address = yourLinkLocal();
											if (address) copyAddress(address);
										}}
										class="w-full rounded-lg border border-base-content/5 bg-base-100/50 px-2.5 py-2 text-left transition hover:border-[#b5caa0]/70 hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-default disabled:hover:border-base-content/5 disabled:hover:bg-base-100/50"
										aria-label="Copy your BGP IP"
									>
										<p class="font-sans text-[9px] font-semibold uppercase tracking-wide text-base-content/45">
											Your BGP IP
										</p>
										<code class="mt-1 block text-[11px] text-[#6f9052]">
											<Show
												when={yourLinkLocal()}
												fallback={
													<span class="text-base-content/40">Enter ASN</span>
												}
											>
												{yourLinkLocal()}
											</Show>
										</code>
										<p class="mt-1 font-sans text-[9px] text-base-content/45">
											{copiedAddress() === yourLinkLocal()
												? "Copied"
												: "Click to copy"}
										</p>
									</button>
									<button
										type="button"
										disabled={!nyawLinkLocal()}
										onClick={() => {
											const address = nyawLinkLocal();
											if (address) copyAddress(address);
										}}
										class="w-full rounded-lg border border-base-content/5 bg-base-100/50 px-2.5 py-2 text-left transition hover:border-[#b5caa0]/70 hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
										aria-label="Copy Nyaw BGP IP"
									>
										<p class="font-sans text-[9px] font-semibold uppercase tracking-wide text-base-content/45">
											Nyaw BGP IP
										</p>
										<code class="mt-1 block text-[11px] text-[#6f9052]">
											{nyawLinkLocal()}
										</code>
										<p class="mt-1 font-sans text-[9px] text-base-content/45">
											{copiedAddress() === nyawLinkLocal()
												? "Copied"
												: "Click to copy"}
										</p>
									</button>
								</div>
							</Show>
							<Show when={!manualLla()}>
								<div
									id="link-local-address-help"
									role="tooltip"
									class="pointer-events-none mt-3 rounded-lg border border-neutral-content/10 bg-white p-3 font-sans text-[10px] leading-relaxed text-slate-800 shadow-xl sm:absolute sm:left-0 sm:top-full sm:z-50 sm:mt-2 sm:w-full sm:translate-y-1 sm:opacity-0 sm:shadow-2xl sm:transition-all sm:duration-300 sm:delay-500 sm:group-hover:delay-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus:delay-0 sm:group-focus:translate-y-0 sm:group-focus:opacity-100"
								>
									Configure Your BGP IP on your WireGuard interface. Use Nyaw
									BGP IP as the BGP neighbor address. Both use fe80::(ASN
									&gt;&gt; 16):(ASN &amp; 0xffff).
								</div>
							</Show>
						</div>
					</Show>
				</Show>
			</div>

			<Show when={mode() !== "delete" && mode() !== "check"}>
				<div>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						WireGuard Public Key
					</label>
					<input
						type="text"
						placeholder="Base64 encoded public key"
						class={inputClass}
						value={pubkey()}
						onInput={(e) => {
							setPubkey(e.currentTarget.value);
							invalidateChallenge();
						}}
					/>
				</div>
			</Show>

			<Show when={mode() !== "check"}>
				<div class="mt-2 mb-6 p-4 bg-base-300/40 rounded-xl border border-base-content/5">
					<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
						<div>
							<p class="text-xs font-medium text-base-content/70">
								Get a single-use challenge, then run the generated command.
							</p>
							<Show when={nonce() && expiresAt()}>
								<p class="mt-1 text-[10px] text-base-content/50">
									Challenge expires at{" "}
									{new Date(expiresAt()! * 1000).toLocaleString()}.
								</p>
							</Show>
						</div>
						<div class="flex gap-1 p-0.5 bg-base-200/80 rounded-md border border-base-content/10">
							<button
								class={twMerge(
									"px-2.5 py-1 text-[10px] font-semibold rounded-sm transition-all uppercase tracking-wider",
									signMode() === "ssh"
										? "bg-[#b5caa0] shadow-sm text-base-content/80"
										: "text-base-content/50 hover:text-base-content/80",
								)}
								onClick={() => {
									setSignMode("ssh");
									setSignature("");
								}}
							>
								SSH
							</button>
							<button
								class={twMerge(
									"px-2.5 py-1 text-[10px] font-semibold rounded-sm transition-all uppercase tracking-wider",
									signMode() === "gpg"
										? "bg-[#b5caa0] shadow-sm text-base-content/80"
										: "text-base-content/50 hover:text-base-content/80",
								)}
								onClick={() => {
									setSignMode("gpg");
									setSignature("");
								}}
							>
								GPG
							</button>
						</div>
					</div>
					<button
						class={twMerge(
							btnClass,
							"mb-3 w-full bg-[#6f9052] text-white hover:opacity-90",
						)}
						onClick={getChallenge}
						disabled={challengeLoading() || loading() || !canGetChallenge()}
					>
						{challengeLoading()
							? "Getting Challenge..."
							: nonce()
								? "Replace Challenge"
								: "Get Challenge"}
					</button>
					<div class="relative group w-full">
						<Show
							when={highlightedCmd()}
							fallback={
								<pre
									class="w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded text-[#393a34] rounded-lg text-xs font-mono whitespace-pre-wrap"
									ref={setCodeBlockRef}
								>
									{challengeCmd()}
								</pre>
							}
						>
							<div
								class="w-full [&>pre]:w-full [&>pre]:border [&>pre]:!bg-[#faf9f5] [&>pre]:px-4 [&>pre]:py-2.5 [&>pre]:overflow-auto [&>pre]:scrollbar [&>pre]:scrollbar-rounded [&>pre]:rounded-lg [&>pre]:text-xs [&>pre]:font-mono [&>pre]:whitespace-pre-wrap"
								innerHTML={highlightedCmd()}
								ref={setCodeBlockRef}
							/>
						</Show>
						<button
							class="absolute bg-transparent right-2 top-2 h-8 w-8 justify-center items-center flex rounded-md hover:bg-sprout-100 transition-all"
							onClick={copyToClipboard}
							title="Copy to clipboard"
						>
							<div
								class={twMerge(
									"transition-all duration-400 group-hover:text-sprout-500",
									copied()
										? "i-ci:check text-sprout-600"
										: "i-ci:copy text-sprout-400",
								)}
							/>
						</button>
					</div>
				</div>

				<div>
					<div class="flex justify-between w-full items-end mb-1">
						<div
							class="group relative flex items-center gap-1 cursor-help"
							tabindex="0"
						>
							<span class="text-xs font-semibold text-base-content/70 uppercase tracking-wide">
								Challenge Auth (PGP/SSH Key)
							</span>
							<span class="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-base-content/20 font-sans text-[9px] font-semibold text-base-content/50">
								?
							</span>
							<div
								role="tooltip"
								class="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 translate-y-1 rounded-lg border border-neutral-content/10 bg-white p-3 font-sans text-[10px] leading-relaxed text-slate-800 opacity-0 shadow-2xl transition-all duration-300 delay-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-0 group-focus:translate-y-0 group-focus:opacity-100 group-focus:delay-0"
							>
								The authentication public key must be listed in your DN42
								registry <strong>mntner</strong> object.
								<br />
								<br />
								<strong>For PGP Keys:</strong> Only{" "}
								<strong>ASCII Armored Detached Signatures</strong> are
								supported. You must sign the challenge using the{" "}
								<code>--armor --detach-sign</code> flags. Cleartext signatures
								(e.g., matching <code>--BEGIN-PGP-SIGNED-MESSAGE--</code>) or
								binary signatures will fail verification.
							</div>
						</div>
						<a
							href="https://explorer.dn42.dev/#/"
							target="_blank"
							rel="noreferrer"
							class="text-xs font-normal normal-case underline text-base-content/70 hover:text-base-content"
						>
							Search your mntner
						</a>
					</div>
					<Show when={fetchingKeys()}>
						<p class="text-xs text-base-content/50 mb-2 italic">
							Fetching keys from registry...
						</p>
					</Show>
					<Show when={fetchedKeys().length > 0}>
						<select
							class={twMerge(inputClass, "mb-2")}
							onChange={(e) => {
								setAuth(e.currentTarget.value);
								setSignature("");
								if (
									e.currentTarget.value.includes("BEGIN PGP") ||
									e.currentTarget.value.includes("pgp-fingerprint")
								) {
									setSignMode("gpg");
								} else {
									setSignMode("ssh");
								}
							}}
							value={auth()}
						>
							{fetchedKeys().map((k) => (
								<option value={k.value}>
									{k.mntner} -{" "}
									{k.value.length > 50
										? k.value.substring(0, 30) +
											"..." +
											k.value.substring(k.value.length - 15)
										: k.value}
								</option>
							))}
						</select>
					</Show>
					<textarea
						rows={3}
						placeholder={
							signMode() === "ssh"
								? "ssh-ed25519 AAAAC3..."
								: "-----BEGIN PGP PUBLIC KEY BLOCK-----\n..."
						}
						class={twMerge(
							inputClass,
							"resize-none",
							fetchedKeys().length > 0 ? "hidden" : "",
						)}
						value={auth()}
						onInput={(e) => {
							setAuth(e.currentTarget.value);
							setSignature("");
						}}
					></textarea>
				</div>

				<div>
					<label class="block text-xs font-semibold text-base-content/70 uppercase tracking-wide">
						Challenge Signature
					</label>
					<textarea
						rows={4}
						placeholder={
							signMode() === "ssh"
								? "-----BEGIN SSH SIGNATURE-----\n..."
								: "-----BEGIN PGP SIGNATURE-----\n..."
						}
						class={twMerge(inputClass, "resize-none")}
						value={signature()}
						onInput={(e) => setSignature(e.currentTarget.value)}
					></textarea>
				</div>
			</Show>

			<div class="flex mt-4">
				<button
					class={twMerge(
						btnClass,
						mode() === "post" &&
							"bg-[#6f9052] hover:opacity-90 text-white shadow-lg",
						mode() === "patch" &&
							"bg-[#6f9052] hover:opacity-90 text-white shadow-lg",
						mode() === "delete" &&
							"bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30",
						mode() === "check" &&
							"bg-[#6f9052] hover:opacity-90 text-white shadow-lg",
						"w-full sm:w-auto",
					)}
					onClick={() => {
						if (mode() === "check") getPeers();
						else request(mode() as any);
					}}
					disabled={loading() || !canSubmit()}
				>
					{loading()
						? "Processing..."
						: mode() === "post"
							? "Create Peer"
							: mode() === "patch"
								? "Update Peer"
								: mode() === "delete"
									? "Delete Peer"
									: "Check Status"}
				</button>
			</div>

			<Show when={errorMsg()}>
				<div class="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium">
					Error: {errorMsg()}
				</div>
			</Show>

			<Show when={result()}>
				<div class="mt-6 p-5 bg-base-300/50 rounded-xl border border-base-content/10">
					<h3 class="text-lg font-bold text-[#55713f] mb-2">
						{result()?.message || "Success!"}
					</h3>
					<p class="text-sm font-mono text-base-content/70">
						Peer: {result().peer_name} (ID {result().peer_id})
					</p>

					<Show when={result()?.wg_config}>
						<div class="mt-4 flex flex-col gap-4">
							<div class="p-3 bg-base-100/50 rounded-lg">
								<h4 class="text-xs font-bold text-base-content/60 uppercase mb-2">
									WireGuard Config
								</h4>
								<div class="relative group w-full mt-2">
									<Show
										when={highlightedWgConfig()}
										fallback={
											<pre class="w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded text-[#393a34] rounded-lg text-xs font-mono whitespace-pre-wrap">
												{wgConfigString()}
											</pre>
										}
									>
										<div
											class="w-full [&>pre]:w-full [&>pre]:border [&>pre]:!bg-[#faf9f5] [&>pre]:px-4 [&>pre]:py-2.5 [&>pre]:overflow-auto [&>pre]:scrollbar [&>pre]:scrollbar-rounded [&>pre]:rounded-lg [&>pre]:text-xs [&>pre]:font-mono [&>pre]:whitespace-pre-wrap"
											innerHTML={highlightedWgConfig()}
										/>
									</Show>
									<button
										class="absolute bg-transparent right-2 top-2 h-8 w-8 justify-center items-center flex rounded-md hover:bg-sprout-100 transition-all"
										onClick={() => {
											navigator.clipboard.writeText(wgConfigString());
										}}
										title="Copy config"
									>
										<div class="i-ci:copy text-sprout-400 transition-all duration-400 group-hover:text-sprout-500" />
									</button>
								</div>
							</div>
							<Show when={result()?.bgp_config}>
								<div class="p-3 bg-base-100/50 rounded-lg">
									<h4 class="text-xs font-bold text-base-content/60 uppercase mb-2">
										BGP Config
									</h4>
									<div class="relative group w-full mt-2">
										<Show
											when={highlightedBgpConfig()}
											fallback={
												<pre class="w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded text-[#393a34] rounded-lg text-xs font-mono whitespace-pre-wrap">
													{bgpConfigString()}
												</pre>
											}
										>
											<div
												class="w-full [&>pre]:w-full [&>pre]:border [&>pre]:!bg-[#faf9f5] [&>pre]:px-4 [&>pre]:py-2.5 [&>pre]:overflow-auto [&>pre]:scrollbar [&>pre]:scrollbar-rounded [&>pre]:rounded-lg [&>pre]:text-xs [&>pre]:font-mono [&>pre]:whitespace-pre-wrap"
												innerHTML={highlightedBgpConfig()}
											/>
										</Show>
										<button
											class="absolute bg-transparent right-2 top-2 h-8 w-8 justify-center items-center flex rounded-md hover:bg-sprout-100 transition-all"
											onClick={() => {
												navigator.clipboard.writeText(bgpConfigString());
											}}
											title="Copy config"
										>
											<div class="i-ci:copy text-sprout-400 transition-all duration-400 group-hover:text-sprout-500" />
										</button>
									</div>
								</div>
							</Show>
						</div>
					</Show>
				</div>
			</Show>

			<Show when={mode() === "check" && peerList() !== null}>
				<div class="mt-6">
					<h3 class="text-lg font-bold text-base-content mb-4">
						Peers for AS{parseAsn()}
					</h3>
					<Show when={peerList()!.length === 0}>
						<div class="p-4 bg-base-300/30 rounded-xl border border-base-content/5 text-sm text-base-content/70">
							No peers found for this ASN.
						</div>
					</Show>
					<div class="space-y-4">
						{peerList()!.map((peer: any) => (
							<div class="p-4 bg-base-300/50 rounded-xl border border-base-content/10">
								<div class="flex justify-between items-center mb-3">
									<h4 class="text-md font-bold text-base-content">
										{peer.peer_name}
									</h4>
									<span
										class={twMerge(
											"px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
											peer.status === "active"
												? "bg-[#6f9052] text-white"
												: peer.status === "provisioning"
													? "bg-amber-500 text-white"
													: peer.status === "error"
														? "bg-rose-500 text-white"
														: "bg-base-content/20 text-base-content",
										)}
									>
										{peer.status}
									</span>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-base-content/80">
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Endpoint
										</span>
										<span class="font-mono">{peer.endpoint || "Roaming"}</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Pubkey
										</span>
										<span class="font-mono truncate" title={peer.pubkey}>
											{peer.pubkey.substring(0, 16)}...
										</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Remote IP
										</span>
										<span class="font-mono">{peer.remote_ll_ip}</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Local IP
										</span>
										<span class="font-mono">{peer.local_ll_ip}</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											MTU
										</span>
										<span>{peer.mtu}</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Listen Port
										</span>
										<span>{peer.listen_port}</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Created At
										</span>
										<span>
											{new Date(peer.created_at * 1000).toLocaleString()}
										</span>
									</div>
									<div class="flex flex-col">
										<span class="font-semibold text-base-content/50 uppercase tracking-wide text-[10px]">
											Updated At
										</span>
										<span>
											{new Date(peer.updated_at * 1000).toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</Show>
		</div>
	);
}
