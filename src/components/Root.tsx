import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { For, Suspense, type Component } from "solid-js";
import cfg from "../constant";
import { Arti } from "./Arti";

const Root: Component = () => {
  return (
    <MetaProvider>
      <Title>扉页 - {cfg.title}</Title>
      <Meta name="description" content={cfg.extra.description} />
      <div class="flex flex-col space-y-3 lg:space-y-8 px-3 sm:px-0 w-full sm:w-2/3 lg:w-1/2 mx-auto my-6 md:mt-14 grow">
        <Suspense fallback={<>
          <div class="h-8 w-16 mb-4 skeleton" />
          <div class="flex flex-col space-y-10">
            <For each={[...Array(7).keys()]}>
              {() => {
                return <><div class="h-3 py-3 skeleton mx-6" /></>
              }}
            </For></div></>
        }>
          <Arti />
        </Suspense>
      </div>
    </MetaProvider>
  );
};

export default Root;
