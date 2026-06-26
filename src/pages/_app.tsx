import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { WorkspaceProvider } from "@/lib/workspace-data";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WorkspaceProvider>
      <Component {...pageProps} />
    </WorkspaceProvider>
  );
}
