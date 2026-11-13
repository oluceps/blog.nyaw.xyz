import { Meta, Title } from "@solidjs/meta";
import { For } from "solid-js";
import "./evidence.css";

const keyoxideIdentity = "aspe:keyoxide.org:L7LTIP5EPWWXKEF3L7E5DNNWBI";
const keyoxideUrl = `https://keyoxide.org/${keyoxideIdentity}`;

const contributions = [
	{
		id: "nixpkgs",
		name: "Nix / NixOS",
		role: "生态贡献",
		title: "软件包维护与系统模块改进",
		description:
			"参与 Nixpkgs 软件包与系统模块维护，提交构建修复、版本更新及功能改进。",
		link: "https://github.com/NixOS/nixpkgs/pulls?q=is%3Apr+is%3Amerged+author%3Aoluceps",
		linkLabel: "个人已合并 PR",
		meta: "99 个已合并 PR · 查询快照",
		evidence: [
			{
				label: "签名提交",
				text: "nixos/shadowsocks: ensure password be set",
				url: "https://github.com/NixOS/nixpkgs/commit/c2c632ff310bc090e5763fc4508edd0012ddc80a",
			},
			{
				label: "签名提交",
				text: "dae: init at 0.1.5",
				url: "https://github.com/NixOS/nixpkgs/commit/405977f9064aab729d10ed950a52c024d8aeae28",
			},
		],
		note: "统计条件：is:pr is:merged author:oluceps。数字为静态查询快照，请以来源记录为准。",
	},
	{
		id: "eunomia",
		name: "eunomia-bpf",
		role: "开源贡献 / OSPP",
		title: "云原生工具链与多架构支持",
		description:
			"参与 eBPF 与 Wasm 工具链开发，改进 CLI 数据目录逻辑，并适配多架构构建。",
		link: "https://github.com/search?q=org%3Aeunomia-bpf+is%3Apr+author%3Aoluceps&type=pullrequests",
		linkLabel: "贡献记录",
		meta: "Rust · eBPF · WebAssembly",
		evidence: [
			{
				label: "贡献汇总",
				text: "组织内个人 PR",
				url: "https://github.com/search?q=org%3Aeunomia-bpf+is%3Apr+author%3Aoluceps&type=pullrequests",
			},
			{
				label: "提交记录",
				text: "wasm-bpf 个人提交",
				url: "https://github.com/eunomia-bpf/wasm-bpf/commits?author=oluceps",
			},
		],
		note: "完整贡献见个人 PR 与提交记录。",
	},
	{
		id: "vaultix",
		name: "Vaultix",
		role: "作者 / 核心开发",
		title: "密钥管理工具的设计与开发",
		description:
			"使用 Rust 开发面向 NixOS 的密钥管理工具，支持并行加密与模板化的密钥分发。",
		link: "https://github.com/milieuim/vaultix/commits?author=oluceps",
		linkLabel: "个人提交记录",
		meta: "Rust · NixOS · 密钥管理",
		evidence: [
			{
				label: "提交记录",
				text: "完整个人提交",
				url: "https://github.com/milieuim/vaultix/commits?author=oluceps",
			},
			{
				label: "贡献汇总",
				text: "个人 PR 记录",
				url: "https://github.com/milieuim/vaultix/pulls?q=is%3Apr+author%3Aoluceps",
			},
		],
		note: "完整开发记录见个人提交与 PR 入口。",
	},
	{
		id: "linux",
		name: "Btrfs",
		role: "邮件列表贡献",
		title: "通过邮件列表提交补丁",
		description:
			"向 linux-btrfs 邮件列表提交 btrfs-progs 帮助文字修正，补丁已由维护者合入。",
		link: "https://lore.kernel.org/all/171320182308.8.1632190135551877582.308812139@oluceps.uk/",
		linkLabel: "原始邮件线程",
		meta: "btrfs-progs · 用户态工具",
		evidence: [
			{
				label: "合入提交",
				text: "property set: fix typo in help message",
				url: "https://github.com/kdave/btrfs-progs/commit/6088039cf84f44e6a5a8f2e277d5f0a9387c6d3d",
			},
			{
				label: "维护者回复",
				text: "Added to devel, thanks.",
				url: "https://www.spinics.net/lists/linux-btrfs/msg145490.html",
			},
		],
		note: "历史发件地址为 linux@oluceps.uk。合入提交的作者由 GitHub 关联至 oluceps，该提交本身无签名。",
	},
];

export default function Evidence() {
	return (
		<>
			<Title>evidence · oluceps</Title>
			<Meta name="robots" content="noindex" />
			<Meta name="description" content="简历中公开贡献与身份关联的补充材料。" />
			<article class="evidence-page" aria-labelledby="evidence-title">
				<div class="evidence-topline">
					<span>
						evidence <span aria-hidden="true">/</span> 01
					</span>
				</div>

				<header class="evidence-heading">
					<div>
						<p class="evidence-byline">oluceps</p>
						<h1 id="evidence-title">
							evidence<span aria-hidden="true">.</span>
						</h1>
					</div>
					<div class="evidence-contact">
						<a
							href="https://github.com/oluceps"
							target="_blank"
							rel="noreferrer"
						>
							<span class="i-ci:github" aria-hidden="true" />
							github.com/oluceps{" "}
							<span class="evidence-contact-arrow" aria-hidden="true">
								↗
							</span>
						</a>
						<a
							href="https://orcid.org/0009-0006-9008-1888"
							target="_blank"
							rel="noreferrer"
						>
							<span class="i-evidence:orcid" aria-hidden="true" />
							ORCID 0009-0006-9008-1888{" "}
							<span class="evidence-contact-arrow" aria-hidden="true">
								↗
							</span>
						</a>
					</div>
				</header>

				<section
					class="evidence-section"
					aria-labelledby="identity-title"
					id="identity"
				>
					<div class="evidence-section-heading">
						<span class="evidence-section-number" aria-hidden="true">
							01
						</span>
						<h2 id="identity-title">身份关联</h2>
						<a
							class="evidence-section-caption"
							href={keyoxideUrl}
							target="_blank"
							rel="noreferrer"
						>
							Keyoxide 身份页 <span aria-hidden="true">↗</span>
						</a>
					</div>
					<div class="evidence-identity">
						<details>
							<summary>
								<span class="evidence-identity-label">GitHub 与历史邮箱</span>
								<span class="evidence-identity-value">
									oluceps <span aria-hidden="true">↔</span> i@oluceps.uk
								</span>
								<span class="evidence-status">签名记录</span>
								<span class="evidence-chevron" aria-hidden="true">
									+
								</span>
							</summary>
							<div class="evidence-identity-detail">
								<p>
									历史邮箱，域名已过期。以下提交的作者与提交者邮箱均为
									i@oluceps.uk，并关联 GitHub 账号 oluceps。
								</p>
								<a
									href={contributions[0]!.evidence[0]!.url}
									target="_blank"
									rel="noreferrer"
								>
									SSH 签名提交 ↗
								</a>
								<a
									href={contributions[0]!.evidence[1]!.url}
									target="_blank"
									rel="noreferrer"
								>
									PGP 签名提交 ↗
								</a>
							</div>
						</details>
						<details id="key-transition">
							<summary>
								<span class="evidence-identity-label">PGP 身份继承</span>
								<span class="evidence-identity-value">
									旧密钥吊销于{" "}
									<time datetime="2026-11-10T10:35:20Z">2026-11-10</time>
								</span>
								<span class="evidence-status">双签声明</span>
								<span class="evidence-chevron" aria-hidden="true">
									+
								</span>
							</summary>
							<div class="evidence-identity-detail">
								<p>
									新旧密钥已签署同一份迁移声明，旧主钥也认证了新证书中的 secia
									身份。
								</p>
								<p>
									旧主钥指纹
									<br />
									<code>ED9B8F88BD92824FF96A22135E45FB643F7092CF</code>
								</p>
								<p>
									新主钥指纹
									<br />
									<code>
										9F164A1AA6437ED91E85C721AAE71AD1DA532B733DC9AD8B776BB034802CB740
									</code>
								</p>
								<p>
									旧证书已于 2026-11-10 10:35:20 UTC 以 superseded
									原因撤销，由新证书替代。
								</p>
								<div class="evidence-key-downloads">
									<a
										href="/evidence/keys/transition.txt"
										download="transition.txt"
									>
										迁移声明 ↓
									</a>
									<a
										href="/evidence/keys/transition.old.asc"
										download="transition.old.asc"
									>
										旧钥签名 ↓
									</a>
									<a
										href="/evidence/keys/transition.new.asc"
										download="transition.new.asc"
									>
										新钥签名 ↓
									</a>
									<a
										href="/evidence/keys/old-public.asc"
										download="old-public.asc"
									>
										旧公钥快照 ↓
									</a>
									<a
										href="/evidence/keys/new-public.asc"
										download="new-public.asc"
									>
										新公钥及认证 ↓
									</a>
									<a
										href="/evidence/keys/old-revoked.asc"
										download="old-revoked.asc"
									>
										旧证书及撤销记录 ↓
									</a>
								</div>
								<p>新钥为 OpenPGP v6，核验工具需支持该版本。</p>
							</div>
						</details>
						<details>
							<summary>
								<span class="evidence-identity-label">domains</span>
								<span class="evidence-identity-value">
									nyaw.xyz <span aria-hidden="true">/</span> aeon.onl
								</span>
								<span class="evidence-status">已发布声明</span>
								<span class="evidence-chevron" aria-hidden="true">
									+
								</span>
							</summary>
							<div class="evidence-identity-detail">
								<p>
									两个域名的 DNS TXT 与 GitHub 身份声明均指向同一个 Keyoxide
									身份。
								</p>
								<p>
									<code>{keyoxideIdentity}</code>
								</p>
								<a href={keyoxideUrl} target="_blank" rel="noreferrer">
									查看核验结果 ↗
								</a>
								<a
									href="https://gist.github.com/oluceps/399f3fa40b246ef036b4ca7a25cdb8a8"
									target="_blank"
									rel="noreferrer"
								>
									GitHub 身份声明 ↗
								</a>
							</div>
						</details>
						<details>
							<summary>
								<span class="evidence-identity-label">邮件贡献身份</span>
								<span class="evidence-identity-value">linux@oluceps.uk</span>
								<span class="evidence-status">公开记录</span>
								<span class="evidence-chevron" aria-hidden="true">
									+
								</span>
							</summary>
							<div class="evidence-identity-detail">
								<p>
									Btrfs 邮件与已合入提交使用此地址。它与 i@oluceps.uk
									分别保留各自的关联证据。
								</p>
								<a
									href={contributions[3]!.evidence[0]!.url}
									target="_blank"
									rel="noreferrer"
								>
									查看作者关联 ↗
								</a>
							</div>
						</details>
					</div>
				</section>

				<section class="evidence-section" aria-labelledby="contributions-title">
					<div class="evidence-section-heading">
						<span class="evidence-section-number" aria-hidden="true">
							02
						</span>
						<h2 id="contributions-title">贡献记录</h2>
						<span class="evidence-section-caption">原始来源</span>
					</div>
					<div class="evidence-contributions">
						<For each={contributions}>
							{(item, index) => (
								<article
									class="evidence-contribution"
									id={item.id}
									aria-labelledby={`${item.id}-title`}
								>
									<span class="evidence-record-number" aria-hidden="true">
										{String(index() + 1).padStart(2, "0")}
									</span>
									<div class="evidence-record-body">
										<div class="evidence-record-heading">
											<h3 id={`${item.id}-title`}>{item.name}</h3>
											<span class="evidence-role">{item.role}</span>
										</div>
										<p class="evidence-record-title">{item.title}</p>
										<p class="evidence-record-description">
											{item.description}
										</p>
										<div class="evidence-record-meta">
											<span>{item.meta}</span>
											<a href={item.link} target="_blank" rel="noreferrer">
												{item.linkLabel} <span aria-hidden="true">↗</span>
											</a>
										</div>
										<details class="evidence-record-details">
											<summary>
												查看证据{" "}
												<span class="evidence-chevron" aria-hidden="true">
													+
												</span>
											</summary>
											<div class="evidence-record-detail-content">
												<dl>
													<For each={item.evidence}>
														{(entry) => (
															<div>
																<dt>{entry.label}</dt>
																<dd>
																	<a
																		href={entry.url}
																		target="_blank"
																		rel="noreferrer"
																	>
																		{entry.text} ↗
																	</a>
																</dd>
															</div>
														)}
													</For>
												</dl>
												<p>{item.note}</p>
											</div>
										</details>
									</div>
								</article>
							)}
						</For>
					</div>
				</section>

				<footer class="evidence-notes">
					<span class="evidence-notes-title">资料说明</span>
					<div>
						<p>数字为静态快照，请以来源记录为准。</p>
						<p>本页用于第三方核验参考，已声明请求搜索引擎不予收录。</p>
					</div>
				</footer>
			</article>
		</>
	);
}
