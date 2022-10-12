import { ComponentProps, useCallback, useMemo } from "react";
import "./index.module.scss";

export default function Select<T>({
  options,
  fieldKey,
  name,
  label,
  ...props
}: ComponentProps<"select"> & {
  options: T[];
  label?: string;
  fieldKey?: {
    label?: string | ((e: T) => any);
    value?: string | ((e: T) => any);
  };
}) {
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

  return (
    <label>
      {label}

      <select
        id={name}
        name={name}
        {...props}
        title={props.title || `Select ${label}`}
        placeholder={props.placeholder || label}
      >
        <option value=''>{`Select ${label}`}</option>

        {options.map((m) => {
          const label = getContent(m, "label");
          const value = getContent(m, "value");
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}

      </select>
    </label>
  );
}
