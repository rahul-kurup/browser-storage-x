import { createContext } from "react";

export default createContext(
  {} as {
    selections: string[];
    setSelections: (id: string) => void;
  }
);
