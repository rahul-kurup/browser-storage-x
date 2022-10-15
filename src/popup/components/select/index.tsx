import { Select as MantineSelect } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { SelectProps } from "./type";

export default function Select<T>({
  options,
  fieldKey,
  name,
  label,
  ...props
}: SelectProps<T>) {
  const getContent = useCallback(
    (m: T, keyFor: "label" | "value") => {
      if (fieldKey?.[keyFor]) {
        return typeof fieldKey[keyFor] === "string"
          ? m[fieldKey[keyFor] as string]
          : typeof fieldKey[keyFor] === "function"
          ? (fieldKey[keyFor] as Function)(m)
          : m[keyFor];
      }
      return m ? (typeof m === "object" ? m[keyFor] : m) : m;
    },
    [fieldKey]
  );

  const dataItems = useMemo(() => {
    return options.map((m) => {
      const label = getContent(m, "label");
      const value = String(getContent(m, "value"));
      return { label, value, data: m };
    });
  }, [fieldKey, options, getContent]);

  return (
    <MantineSelect
      id={name}
      name={name}
      maxDropdownHeight={180}
      {...props}
      data={dataItems}
      value={String(props.value ?? "")}
      title={props.title || `Select ${label}`}
      placeholder={props.placeholder || label}
      onChange={(evValue) => props.onChange?.({ name, value: evValue })}
    />
  );
}
