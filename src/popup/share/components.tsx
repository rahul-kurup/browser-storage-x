import { Alert, Avatar, Group, Text } from '@mantine/core';
import { Progress } from 'lib-models/progress';
import { forwardRef } from 'react';
import { ItemProps } from './type';

export const CustomSelectOption = forwardRef<HTMLDivElement, ItemProps>(
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

export const PresetAlerts = {
  [Progress.started]: (
    <Alert color='blue' title='🔁 Sharing'>
      Storage is being transferred...
    </Alert>
  ),

  [Progress.stopped]: (
    <Alert color='blue' title='⏹ No change'>
      No data found to be transferred
    </Alert>
  ),

  [Progress.pass]: (
    <Alert color='green' title='✅ Done'>
      Storage transfer completed!
    </Alert>
  ),

  [Progress.fail]: (
    <Alert color='red' title='❌ Some error occurred'>
      You may share the logged error in console with the extension author
    </Alert>
  ),

  [Progress.abort]: (
    <Alert color='red' title='🛑 Aborted'>
      Aborted
    </Alert>
  ),
};
