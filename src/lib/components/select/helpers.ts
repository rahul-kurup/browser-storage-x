import { SelectProps } from '@mantine/core';

export const fnFilter: SelectProps['filter'] = (value, item) => {
  let inUrl = false,
    inTitle = false;
  inUrl = item?.data?.url
    ?.toLowerCase()
    .trim()
    .includes(value.toLowerCase().trim());
  if (!inUrl) {
    inTitle = item.label
      .toLowerCase()
      .trim()
      .includes(value.toLowerCase().trim());
  }
  return inUrl || inTitle;
};
