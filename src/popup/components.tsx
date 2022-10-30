import { Avatar, Badge, Group, Spoiler, SpoilerProps, Text } from "@mantine/core";
import { forwardRef } from "react";
import { ItemProps } from "./type";

export const CustomSelectOption = forwardRef<HTMLDivElement, ItemProps>(
  ({ data, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={data.favIconUrl} size='sm' />

        <div>
          <Text size="sm">
            {data.incognito && "🕶"} {data.title}{" "}
            {data.audible && (data.mutedInfo.muted ? "🔇" : "🔊")}
          </Text>

          <Text size="xs">
            {data.url}
          </Text>
        </div>
      </Group>
    </div>
  )
);


const spoilerProps: SpoilerProps = {
  hideLabel: 'hide',
  showLabel: 'show more',
  maxHeight: 40,
  transitionDuration: 500
}
export const CheckboxTreeLabel:React.FC<{name: string, value: string}> = ({ name, value }) => {
  return (
    <Group>
      <Badge >{name}</Badge>
      <Spoiler {...spoilerProps}>{value}</Spoiler>
    </Group>
  )
}