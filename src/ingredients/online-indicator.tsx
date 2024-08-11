import { onCleanup, Show, type Component, type ParentProps } from "solid-js"
import { createSignal, onMount } from 'solid-js';
import ky from 'ky';
import { twMerge } from "tailwind-merge";
interface UserResponse {
  onlineStatus: string;
}
const OnlineIndicator: Component = () => {
  const [isOnline, setIsOnline] = createSignal(false);
  const qBody = {
    i: 'RWKGJuqW8xcIsSd2kfKhgHOPzePHWMNu',
    userId: '9wmrojkev8wp001z'
  };
  const misskeyInstance = 'https://nyaw.xyz';


  const fetchOnlineStatus = async () => {
    try {
      const response = await ky.post(`${misskeyInstance}/api/users/show`, {
        json: qBody,
      }).json<UserResponse>();

      setIsOnline(response.onlineStatus === "online");
    } catch (error) {
      console.error('Failed to fetch user status:', error);
      setIsOnline(false);
    }
  };
  onMount(() => {
    fetchOnlineStatus();

    const interval = setInterval(fetchOnlineStatus, 2000);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <>
      <Show when={isOnline()}>
        <div class="absolute -bottom-0 -right-0 w-4 h-4 md:w-8 md:h-8 md:-top-2 md:-right-2 bg-sprout-200 md:bg-sprout-300 rounded-full animate-ping" />
      </Show>
      <div data-tip={isOnline() ? "online" : "offline"} class={twMerge(`absolute tooltip -bottom-0 -right-0 w-4 h-4 md:w-8 md:h-8 md:-top-2 md:-right-2 rounded-full`, isOnline() ? "bg-sprout-200 md:bg-sprout-300" : "bg-slate-300")} />
    </>
  )
}


// <div {...(isOnline() ? { 'data-tip': "online" } : {})} class={twMerge(`absolute tooltip -bottom-0 -right-0 w-4 h-4 md:w-8 md:h-8 md:-top-2 md:-right-2 rounded-full`, isOnline() ? "bg-sprout-200 md:bg-sprout-300" : "bg-slate-300")} />
export default OnlineIndicator;
