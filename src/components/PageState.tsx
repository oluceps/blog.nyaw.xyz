import { type SetStoreFunction, createStore } from "solid-js/store";
import { createContext, type ParentProps, useContext } from "solid-js";

function usePageState() {
	return useContext(PageStateContext);
}

function useTaxoState() {
	return useContext(TaxoStateContext);
}

type TaxoStateStore = {
	id: string | undefined;
};

const INITIAL_STATE_STORE = { id: undefined };

const TaxoStateContext = createContext<{
	taxoInfo: TaxoStateStore;
	setTaxoInfo: SetStoreFunction<TaxoStateStore>;
}>({
	taxoInfo: INITIAL_STATE_STORE,
	setTaxoInfo: () => {},
});
const TaxoStateProvider = (props: ParentProps) => {
	const [taxoInfo, setTaxoInfo] =
		createStore<TaxoStateStore>(INITIAL_STATE_STORE);

	return (
		<TaxoStateContext.Provider
			value={{
				taxoInfo,
				setTaxoInfo,
			}}
		>
			{props.children}
		</TaxoStateContext.Provider>
	);
};

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
	// 2 level of child
	children: ChildSection[] | [];
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
	setPageSections: () => {},
});
const PageStateProvider = (props: ParentProps) => {
	const [pageSections, setPageSections] = createStore<PageStateStore>(
		INITIAL_PAGE_STATE_STORE,
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

export { PageStateProvider, usePageState, TaxoStateProvider, useTaxoState };
