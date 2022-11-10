import { SelectProps as MantineSelectProps } from '@mantine/core';

export type FieldKey<T> = keyof T | ((e: T) => string);

export type ChangeHandlerArgs<T> = { name: string; value: string | T; data: T };

export type SelectProps<T> = Omit<
  MantineSelectProps,
  'data' | 'value' | 'onChange'
> & {
  options: T[];
  label?: string;
  value?: T | string | number | boolean;
  valueAsObject?: boolean;
  fieldKey?: {
    label?: FieldKey<T>;
    value?: FieldKey<T>;
    group?: FieldKey<T>;
  };
  onChange?: (e: ChangeHandlerArgs<T>) => void;
};
