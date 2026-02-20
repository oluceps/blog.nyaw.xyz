import type { APIEvent } from "@solidjs/start/server";
import { API, commonBranch, verifiedPr } from "~/routes/post/nixpkgs-tracker/PrStat";
import { Ok, Err, Throwable } from '@typ3/throwable'
import HttpStatusCode from '~/ingredients/http-status-code'

export async function GET(e: APIEvent) {
  const url = new URL(e.request.url)
  const params = new URLSearchParams(url.search)
  const userParamsRaw = {
    token: params.get("token"),  // github authorization token
    pr: params.get("pr"), // url or number or `#${number}`
    repo: params.get("repo"),
    branch: params.getAll("branch"),
  }
  console.log("[pr-stat] query branch", userParamsRaw.branch)
  const plain400Rsp = (msg: string) =>
    new Response(JSON.stringify({ type: 400, msg }), {
      headers: { "content-type": "application/json" },
      status: 400
    })
  if (!userParamsRaw.pr)
    return plain400Rsp("Bad! must give [pr] param, support github nixpkgs pr (uri | number | #number)");
  const vdPr = verifiedPr(userParamsRaw.pr)
  console.log("[pr-stat] query pr", vdPr.value)
  if (vdPr.isError)
    return plain400Rsp("Bad! PR param invalid. support github nixpkgs pr (uri | number | #number)");

  if (userParamsRaw.repo && userParamsRaw.branch.length === 0)
    return plain400Rsp("Bad! must specify branch when querying repo other than NixOS/nixpkgs");

  const repo = userParamsRaw.repo || "nixos/nixpkgs";
  const api = new API(repo, userParamsRaw.token ? { Authorization: `token ${userParamsRaw.token}` } : {})

  const toQueryBranches: string[] = (userParamsRaw.branch.length === 0) ? commonBranch : userParamsRaw.branch;

  const meta = await vdPr.pipe(async p => await api.getMeta(p)).unwrap();

  if (meta.error) return new Response(JSON.stringify(meta.error), {
    headers: { "content-type": "application/json" },
    status: meta.error.type
  })

  if (!meta.value) return new Response(JSON.stringify({ type: HttpStatusCode.INTERNAL_SERVER_ERROR, msg: "Internal Error" }), {
    headers: { "content-type": "application/json" },
    status: HttpStatusCode.INTERNAL_SERVER_ERROR
  })

  const ret0 = (await api.chk(toQueryBranches, meta.value.merge_commit_sha)).unwrap()
  const ret1 = new Response(JSON.stringify({ ...meta.value, merge: ret0 }), {
    headers: { "content-type": "application/json" },
    status: HttpStatusCode.INTERNAL_SERVER_ERROR
  })

  return ret1;
}
