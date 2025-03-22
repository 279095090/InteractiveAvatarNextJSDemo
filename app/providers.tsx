"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </NextUIProvider>
  );
}


export interface LangContextPrpos{
  lang: string;
  setLang: (lang: string) => void;
} 

// 创建 Context
export const LangContext = React.createContext<LangContextPrpos|null>(null);

// 定义一个包装组件，用于管理 Context 的值
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = React.useState<string>(navigator.language);

  return (
    <LangContext.Provider value={{ lang:value, setLang:setValue }}>
      {children}
    </LangContext.Provider>
  );
}