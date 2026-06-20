import {
	createContext,
	createSignal,
	type ParentProps,
	useContext,
} from "solid-js";

const [activeState, setActiveState] = createSignal<string>("");

const ActiveContext = createContext<{
	activeState: typeof activeState;
	setActiveState: typeof setActiveState;
}>({
	activeState: () => "",
	setActiveState: () => {},
});

const Provider = (props: ParentProps) => (
	<ActiveContext.Provider value={{ activeState, setActiveState }}>
		{props.children}
	</ActiveContext.Provider>
);

const useAboutState = () => useContext(ActiveContext);

export { Provider, useAboutState };
