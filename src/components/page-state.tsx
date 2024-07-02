import { SetStoreFunction, StoreSetter, createStore } from "solid-js/store";
import { createEffect, createContext, ParentProps, useContext } from "solid-js";

function usePageState() {
  return useContext(PageStateContext);
}

type PageStateStore = {
  sections: ParentSection[];
  path: string;
};
type ParentSection = {
  text: string | undefined;
  id: string;
  level: number;
  children: ChildSection[] | [];
};
type ChildSection = {
  text: string | undefined;
  id: string;
  level: number;
};
const INITIAL_PAGE_STATE_STORE = {
  sections: [],
  path: "",
};

const PageStateContext = createContext<{
  pageSections: PageStateStore;
  setPageSections: SetStoreFunction<PageStateStore>;
}>({
  pageSections: INITIAL_PAGE_STATE_STORE,
  setPageSections: () => { },
});
const PageStateProvider = (props: ParentProps) => {
  const [pageSections, setPageSections] = createStore<PageStateStore>(
    INITIAL_PAGE_STATE_STORE
  );

  return (
    <PageStateContext.Provider
      value={{
        pageSections,
        setPageSections,
      }}
    >
      {props.children}
    </PageStateContext.Provider>
  );
};

export { PageStateProvider, usePageState };

