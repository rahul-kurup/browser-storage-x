import { Avatar, Group, Text } from '@mantine/core';
import { forwardRef } from 'react';
import { ItemProps } from './type';

export default forwardRef<HTMLDivElement, ItemProps>(
  ({ data, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={data.favIconUrl} size='sm' />

        <div>
          <Text size='sm'>
            {data.incognito && '🕶'} {data.title}{' '}
            {data.audible && (data.mutedInfo.muted ? '🔇' : '🔊')}
          </Text>

          <Text size='xs'>{data.url}</Text>
        </div>
      </Group>
    </div>
  )
);
