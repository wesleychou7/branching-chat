import { ReactNode, createContext, useContext } from "react";
import OpenAI from "openai";

const APIContext = createContext<OpenAI | null>(null);

export const APIContextProvider = ({ children }: { children: ReactNode }) => {
  const client = new OpenAI({
    apiKey:
      "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",
    dangerouslyAllowBrowser: true,
  });

  return <APIContext.Provider value={client}>{children}</APIContext.Provider>;
};

export const useAPIContext = () => useContext(APIContext);
