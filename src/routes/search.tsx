import { type Component, createEffect, createSignal, For } from "solid-js";
import cfg from "~/constant";
import { A } from "@solidjs/router";
import { twMerge } from "tailwind-merge";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";


const Search: Component = () => {

  const [focus, setFocus] = createSignal(false);
  const [inp, setInp] = createSignal<string>();
  const [res, setRes] = createSignal<undefined | Array<Record<string, string>>>();

  const [unexp, setUnexp] = createSignal<boolean>();

  createEffect(async () => {
    if (inp()) {
      if (inp()!.length < 2) {
        setRes([]);
        return;
      }
      try {
        const search = await fetch(`/api/search/${encodeURIComponent(inp()!)}`)
          .then(r => r.json());
        setRes(search.hits)
      } catch (e) {
        console.log(e)
        setUnexp(true);
      }
    }
  })

  return (<>
    <MetaProvider>
      <Title>搜索 - {cfg.title}</Title>
      <Link rel="canonical" href={cfg.base_url + "/search"} />
      <Meta
        property="og:description"
        content={"search for " + cfg.base_url}
      />
      <Meta
        name="description"
        content={"search for " + cfg.base_url}
      />
      <Meta name="author" content={cfg.author} />
    </MetaProvider>
    <div class="flex flex-col space-y-10 2xl:space-y-12 px-3 sm:px-0 w-full sm:w-2/3 2xl:w-7/12 mx-auto my-6 md:mt-14 grow ">
      <input
        class={twMerge("mx-auto w-11/12 md:w-1/2 md:mb-4 h-10 ring ring-2 focus:ring-offset-2 transition-all rounded-md shadow-lg focus:outline-none px-3",
          focus() ? " mt-8 md:mt-0" : "mt-30 md:mt-0",
          !unexp() ? "ring-sprout-200" : "ring-red-200")}
        onInput={(e) =>
          setInp(e.target.value)
        }
        onFocusIn={() => setFocus(true)}
        onFocusOut={() => setFocus(false)}
        placeholder={unexp() ? "Search Service Down" : ""}
      ></input>

      <div class="min-h-3/4 grow w-full md:w-3/4 mx-auto">
        <For each={res()}>
          {(attr) => {
            return (
              <div class="antialiased flex flex-col mx-3 md:mx-8 2xl:mx-12">
                <article class="flex overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
                  <div class="no-underline font-light leading-snug text-slate-600 min-w-12 font-mono">
                    {new Date(attr?.date || "").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                      .toString()}
                  </div>
                  <A
                    href={`/${attr.path}#:~:text=${inp()}`}
                    class={twMerge(
                      "no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose",
                    )}
                    target="_blank"
                  >
                    {attr.title}
                    <span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
                  </A>
                </article>
              </div>)
          }}
        </For>
      </div>
    </div>
  </>)
}


export default Search;
