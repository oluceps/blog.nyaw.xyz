import { createContext, ParentProps, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";


const [activeState, setActiveState] = createStore<{ state: string }>({ state: "" });

const ActiveContext =
  createContext<{
    activeState: { state: string };
    setActiveState: SetStoreFunction<{ state: string }>;
  }>
    ({
      activeState: { state: "" },
      setActiveState: () => { }
    });

const Provider = (props: ParentProps) => (
  <ActiveContext.Provider value={{ activeState, setActiveState }}>{props.children}</ActiveContext.Provider>
);

const useAboutState = () => useContext(ActiveContext)

export { Provider, useAboutState }
