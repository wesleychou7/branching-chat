import { createContext } from "react";

type Model = {
  name: string;
  alias: string;
};

type User = {
  id: string | null;
};

export const ModelContext = createContext<Model>({
  name: "",
  alias: "",
});

export const UserContext = createContext<User>({
  id: null,
});
