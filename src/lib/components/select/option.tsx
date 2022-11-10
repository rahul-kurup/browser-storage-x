import { Group, Text } from '@mantine/core';
import { ItemProps } from 'popup/share/type';
import { forwardRef } from 'react';
import {
  SelectTextWrapper,
  SelectWrapper,
  StyledAvatar,
  StyledImgIcon,
} from './style';

export const SelectOptionBrowserTab = forwardRef<HTMLDivElement, ItemProps>(
  ({ data, label, ...others }: ItemProps, ref) => (
    <SelectWrapper ref={ref} {...others}>
      {data.incognito && <StyledImgIcon size={15} />}

      <Group noWrap>
        <StyledAvatar src={data.favIconUrl} size='sm' />

        <SelectTextWrapper>
          <Text size='sm'>
            {data.title} {data.audible && (data.mutedInfo.muted ? '🔇' : '🔊')}
          </Text>

          <Text size='xs'>{data.url}</Text>
        </SelectTextWrapper>
      </Group>
    </SelectWrapper>
  )
);
