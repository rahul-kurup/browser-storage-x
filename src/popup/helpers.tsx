import { ButtonProps } from '@mantine/core';
import { IconCurrentLocation } from '@tabler/icons';

export const activeTabButtonProps = {
  compact: true,
  size: 'lg',
  type: 'button',
  variant: 'outline',
  title: 'Select Current Tab',
  children: <IconCurrentLocation size={13} />,
} as ButtonProps;
