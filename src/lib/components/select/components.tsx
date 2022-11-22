import { Button, Group, Text, Tooltip } from '@mantine/core';
import { IconCurrentLocation, IconSelector } from '@tabler/icons';
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

export const genRightIcon = ({
  title = 'Select Current Tab',
  icon = 'selector',
  onClick,
}: {
  title?: string;
  icon?: 'selector';
  onClick: () => void;
}) => {
  const IconToRender = icon === 'selector' ? IconSelector : IconSelector;
  return {
    rightSectionWidth: 60,
    rightSection: (
      <>
        <Tooltip withArrow offset={2} label={title}>
          <Button
            compact
            size='xs'
            type='button'
            variant='outline'
            onClick={onClick}
          >
            <IconCurrentLocation size={10} />
          </Button>
        </Tooltip>
        &nbsp;
        <IconToRender size={16} color='#868E96' />
      </>
    ),
  };
};
