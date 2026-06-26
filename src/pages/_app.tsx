import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { LanguageProvider } from "@/lib/language-context";
import { WorkspaceProvider } from "@/lib/workspace-data";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <WorkspaceProvider>
        <Component {...pageProps} />
      </WorkspaceProvider>
    </LanguageProvider>
  );
}
