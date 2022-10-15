import { SelectProps as MantineSelectProps } from "@mantine/core";

export type FieldKey<T> = string | ((e: T) => any);

export type ChangeHandlerArgs = { name: string; value: string };

export type SelectProps<T> = Omit<
  MantineSelectProps,
  "data" | "value" | "onChange"
> & {
  options: T[];
  label?: string;
  value?: string | number | boolean;
  fieldKey?: {
    label?: FieldKey<T>;
    value?: FieldKey<T>;
  };
  onChange?: (e: ChangeHandlerArgs) => void;
};
