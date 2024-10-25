// uri follow rfc6570
/*
{
  "title": "insync: 3.9.1.60010 -> 3.9.3.60019",
  "state": "closed",
  "user": "hellwolf",
  "merge": {
    "staging-next": true,
    "master": true,
    "nixos-unstable-small": true,
    "nixpkgs-unstable": true,
    "nixos-unstable": true
  }
}
*/
import ky from "ky";
import type { APIEvent } from "@solidjs/start/server";
import { buildPr, getTitle, isContain, NotFoundError, PrInfo } from "~/ingredients/nixpkgs-tracker";


export async function GET(e: APIEvent) {


  const url = new URL(e.request.url)
  const params = new URLSearchParams(url.search)
  const userParamsRaw = {
    token: params.get("token"),  // github authorization token
    pr: params.get("pr"), // url or number or `#${number}`
    repo: params.get("repo"),
    branch: params.getAll("branch"),
  }
  console.log("[pr-stat] query raw branch", userParamsRaw.branch)
  if (!userParamsRaw.pr) {
    return new Response("Bad! must give [pr] param, support github nixpkgs pr (uri | number | #number)", {
      headers: { "content-type": "text/plain" },
      status: 400
    });
  }
  const realPrN = buildPr(userParamsRaw.pr)
  console.log("[pr-stat] query pr", realPrN)
  if (realPrN === undefined) {
    return new Response("Bad! PR param invalid. support github nixpkgs pr (uri | number | #number)", {
      headers: { "content-type": "text/plain" },
      status: 400
    });
  }
  if (userParamsRaw.repo && userParamsRaw.branch.length == 0) {
    return new Response("Bad! must specify branch when querying repo other than NixOS/nixpkgs", {
      headers: { "content-type": "text/plain" },
      status: 400
    });
  }
  const repo = userParamsRaw.repo || "nixos/nixpkgs";
  const api = ky.create({
    prefixUrl: `https://api.github.com/repos/${repo}/`,
    headers: userParamsRaw.token ? { Authorization: `token ${userParamsRaw.token}` } : {},
  });

  const chk = async (bs: string[], pr: Partial<PrInfo>) => {
    return Object.assign({
      title: pr.title,
      state: pr.state,
      user: pr.user?.login
    }, {
      merge: (await Promise.all(bs.map(async b => {
        return { [b]: await isContain(b, pr.merge_commit_sha!, api) };
      }))).reduce((acc, i) => Object.assign(acc, i), {})
    });
  };

  let branches =
    ["staging-next",
      "master",
      "nixos-unstable-small",
      "nixpkgs-unstable",
      "nixos-unstable"
    ]



  const chkBranch = async () => {
    try {
      const r = await getTitle(realPrN, api);

      if (!r.title) {
        throw new NotFoundError("PR title not found");
      }
      if (!r.merge_commit_sha) {
        throw new Error("Merge commit SHA not found");
      }

      const pr = r as Partial<PrInfo>;

      if (userParamsRaw.branch.length === 0) {
        // Main branches
        return await chk(branches, pr);
      } else {
        return await chk(userParamsRaw.branch, pr);
      }
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error to be handled in the caller
    }
  };

  const res = async () => {
    try {
      const a = await chkBranch();
      // console.log(a)
      return a;
    } catch (e: any) {
      if (e instanceof NotFoundError) {
        return { status: e.statusCode, message: e.message };
      } else {
        return { status: 500, message: "Internal Server Error" };
      }
    }
  };

  // Call the function and handle the response
  return await res();
}
