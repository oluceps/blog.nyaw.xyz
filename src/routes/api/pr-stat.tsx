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
import ky, { KyInstance } from "ky";
import type { APIEvent } from "@solidjs/start/server";
import { getTitle, isContain, PrInfo } from "~/ingredients/nixpkgs-tracker";


export async function GET(e: APIEvent) {
  const validPrNum = (raw: string) => {
    return !isNaN(Number(raw)) && Number(raw) > 0
  }
  const buildPr = (pr: string) => {
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

  const url = new URL(e.request.url)
  const params = new URLSearchParams(url.search)
  const userParamsRaw = {
    token: params.get("token"),  // github authorization token
    pr: params.get("pr"), // url or number or `#${number}`
    branch: params.getAll("branch")
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
  const api = ky.create({
    prefixUrl: "https://api.github.com/repos/nixos/nixpkgs/",
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

      if (!r.title) throw new Error("get pr title error");
      if (!r.merge_commit_sha) throw new Error("get merge commit sha error");

      const pr = r as Partial<PrInfo>;

      if (userParamsRaw.branch.length == 0) { // main branches 
        return await chk(branches, pr); // checked
      } else {
        return await chk(userParamsRaw.branch, pr);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  return await chkBranch()
}
