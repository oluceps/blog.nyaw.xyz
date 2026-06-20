import Tooltip from '@corvu/tooltip'
import type { ParentProps } from 'solid-js'

const Comment = (props: ParentProps) => {
  return (
    <Tooltip
      placement="top"
      floatingOptions={{
        offset: 13,
        flip: true,
        shift: true,
      }}
      openOnHover={false}
      openOnFocus={true}
    >
      <Tooltip.Trigger
        as="button"
        class="-translate-y-1/8 items-center flex justify-center bg-[#DA9F6D] w-4 h-4 rounded-full text-[10px] font-extrabold text-white"
      >
        注
        <span class="sr-only">comment</span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="rounded-md bg-corvu-100 px-2 py-1 font-normal text-[14px] max-w-1/2 md:max-w-1/4 leading-tight">
          {props.children}
          <Tooltip.Arrow class="text-corvu-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  )
}

export default Comment;
