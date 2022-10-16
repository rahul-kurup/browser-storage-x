import { Select as MantineSelect } from "@mantine/core";
import { isNully } from "lib-utils/common";
import { useCallback, useMemo } from "react";
import { SelectProps } from "./type";

export default function Select<T>({
  name,
  label,
  value,
  options,
  fieldKey,
  valueAsObject,
  ...props
}: SelectProps<T>) {
  const getContent = useCallback(
    (m: T, keyFor: "label" | "value") => {
      if (isNully(m)) {
        return m;
      } else if (fieldKey?.[keyFor]) {
        return typeof fieldKey[keyFor] === "string"
          ? m[fieldKey[keyFor] as string]
          : typeof fieldKey[keyFor] === "function"
          ? (fieldKey[keyFor] as Function)(m)
          : m[keyFor];
      } else if (typeof m === "object") {
        return m[keyFor];
      } else {
        return m;
      }
    },
    [fieldKey]
  );

  const selectedValue = useMemo(() => {
    let val = value;
    if (valueAsObject) {
      val = getContent(value as T, "value");
    }
    return String(val ?? "");
  }, [value, getContent]);

  const dataItems = useMemo(() => {
    return options.map((m) => {
      const label = getContent(m, "label");
      const value = String(getContent(m, "value"));
      return { label, value, data: m };
    });
  }, [fieldKey, options, getContent]);

  function handleChange(value: string) {
    const data = dataItems.find((f) => f.value === value)?.data;
    props.onChange?.({
      name,
      data,
      value: valueAsObject ? data : value,
    });
  }

  return (
    <MantineSelect
      id={name}
      name={name}
      maxDropdownHeight={180}
      {...props}
      data={dataItems}
      value={selectedValue}
      onChange={handleChange}
      title={props.title || `Select ${label}`}
      placeholder={props.placeholder || label}
    />
  );
}
