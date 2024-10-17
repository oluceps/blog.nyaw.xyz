import { JSX, ParentProps } from "solid-js"
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

const Title = (props: ParentProps & { level: number; color: string; text: string }) => {
  const levelProse = `prose-h${props.level}`;
  const levelPreBlockSize = 5.5 - props.level * 0.5;
  const levelPreBlockSizeStr = `w-${levelPreBlockSize} h-${levelPreBlockSize}`;
  const baseHStyle = twMerge("flex justify-start items-center", levelProse);

  const Tag = `h${props.level}` as keyof JSX.IntrinsicElements;

  return (
    <Dynamic component={Tag} class={baseHStyle} id={props.text}>
      <div
        class={twMerge(
          "rounded-sm mr-2 mb-0.5 shadow-md",
          props.color,
          levelPreBlockSizeStr
        )}
      />
      <a
        class="heading anchor no-underline active"
        noScroll={true}
        href={`#${props.text}`}
        aria-current="page"
      >
        {props.children ? props.children : props.text}
      </a>
    </Dynamic>
  );
};


export default Title;
