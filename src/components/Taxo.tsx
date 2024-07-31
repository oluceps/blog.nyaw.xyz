import { createEffect, createSignal, For } from "solid-js"
import data from "../routes/data.json"
import { A, useLocation } from "@solidjs/router";
import cfg from "../constant";
import { Data } from "./Arti";
import { Meta, MetaProvider } from "@solidjs/meta";


export default function Taxo() {
  const [checked, setChecked] = createSignal(false);
  // createEffect(() => {
  //   console.log(checked())
  // })
  let reData = data.filter((item) => {
    const itemHideLvl = item.hideLevel || 5;
    return cfg.hideLevel < itemHideLvl && !item.draft;
  });


  const allTags = new Set(reData.reduce<string[]>((acc, item) => {
    return item.tags ? acc.concat(item.tags) : acc;
  }, []));
  const allCate = new Set(reData.reduce<string[]>((acc, item) => {
    return item.categories ? acc.concat(item.categories) : acc;
  }, []));


  // find all only one article tag
  const onlyTag: Map<string, string> = new Map()

  for (const t of allTags) {
    let count = 0;
    let last;
    for (const it of reData) {
      if (it.tags?.includes(t)) {
        count++;
        last = it.title;
      }
    }
    if (count == 1 && last) {
      onlyTag.set(t, last)
      allTags.delete(t)
    }
  }
  console.log("onlyT", onlyTag)

  // [A -> bbb, B -> bbb] => [ [A, B] -> bbb ]
  const outputMap = new Map<string[], string>();
  const tempMap = new Map<string, string[]>();

  onlyTag.forEach((value, key) => {
    if (!tempMap.has(value)) {
      tempMap.set(value, []);
    }
    tempMap.get(value)?.push(key);
  });
  tempMap.forEach((keys, value) => {
    outputMap.set(keys, value);
  });


  for (const i of outputMap.keys()) {
    allTags.add(i.join(" / "))
  }

  const reversedMap: Map<string, string[]> = new Map();

  outputMap.forEach((value, key) => {
    reversedMap.set(value, key);
  });

  reData = reData.reduce<typeof reData>((acc, item) => {
    if (Array.from(outputMap.values()).includes(item.title)) {
      const updatedTags = item.tags!.filter(tag => !Array.from(onlyTag.keys()).includes(tag))
        .concat(reversedMap.get(item.title)?.join(" / ") || []);
      // @ts-ignore
      acc.push({ ...item, tags: updatedTags });
      return acc
    }
    acc.push({ ...item });
    return acc;
  }, []);

  const [ctx] = createSignal(
    new Set(
      reData.map((i) => { return { ...i, date: new Date(i.date) } })
    ));

  return (
    <MetaProvider>
      <Meta property="og:title" content={cfg.title + " " + "分类"} />
      <Meta property="og:description" content={"分类" + " " + cfg.description} />
      <Meta property="og:url" content={cfg.base_url + useLocation().pathname} />
      <div class="mx-auto sm:w-2/3 2xl:w-7/12 flex flex-col grow w-11/12 space-y-8 mt-20">
        <div class="flex space-x-2 items-center">
          <div class={`px-2 py-px tansition-all duration-300 ${!checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}>目录</div>
          <input
            type="checkbox"
            class="toggle border-sprout-400 bg-sprout-500 [--tglbg:#e4ecdb] hover:bg-sprout-600"
            onInput={() => setChecked(!checked())}
          />
          <div class={`px-2 py-px tansition-all duration-300 ${checked() ? "bg-sprout-200/80 text-neutral-600 rounded-md" : "text-neutral-500"}`}>标签</div>
        </div>

        <div class="w-full flex flex-col">
          <p class="text-neutral-700 font-bold">All</p>
          <div class="flex flex-wrap text-sm justify-center">
            <For each={Array.from(checked() ? allTags.values() : allCate.values())}>
              {(cat) => {
                return (<button
                  class="px-2 py-1 2xl:text-base text-neutral-600 dark:text-chill-100 justify-self-end text-nowrap whitespace-nowrap group transition-all duration-300 ease-in-out leading-snug"
                  onClick={() => { document.getElementById(cat)!.scrollIntoView({ behavior: "smooth" }) }}
                >
                  {cat}
                  <span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
                </button>
                )
              }
              }</For>
          </div>

        </div>

        <div class="divider" />


        <div class="antialiased flex flex-col sm:mx-3 md:mx-10 2xl:mx-16">

          <For each={Array.from(checked() ? allTags.values() : allCate.values())}>
            {(outerAttr) => {
              return <>
                <p class={checked() ? "mt-6" : "mt-4"}
                  id={outerAttr}
                >{outerAttr}</p>
                <For
                  each={[...ctx()]
                    .map((item, index, arr) => {
                      if (index === 0) {
                        return { ...item, showYear: true };
                      }
                      return {
                        ...item,
                        showYear: !(
                          arr[index - 1].date.getFullYear() ===
                          item.date.getFullYear()
                        ),
                      };
                    }).filter((item) => {
                      return checked() ? (item.tags ? item.tags.includes(outerAttr) : false) :
                        (item.categories ? item.categories.includes(outerAttr) : false)
                    })}
                >
                  {(attr) => {
                    return <article class="flex ml-4 sm:ml-6 lg:ml-10 my-px overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
                      <div
                        class="no-underline mb-px font-extralight leading-loose font-mono text-slate-600 dark:text-chill-100 min-w-12"
                      >
                        {attr.date
                          .toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                          .toString().replace(/-/g, '/')}
                      </div>
                      <A
                        href={`/${attr.path}`}
                        class="no-underline text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-slug"
                      >
                        {attr.title}
                        <span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
                      </A>
                    </article>
                  }}
                </For></>
            }}
          </For>
        </div >
      </div>
    </MetaProvider>
  )

}
