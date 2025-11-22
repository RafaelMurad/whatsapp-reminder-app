// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, Show } from "solid-js";
import { FeatureFlagsProvider, FeatureFlagsDebugPanel } from "./lib/feature-flags";
import "./app.css";

// Check if we're in development mode
const isDev = import.meta.env.DEV;

export default function App() {
  return (
    <FeatureFlagsProvider>
      <Router
        root={(props) => (
          <Suspense>{props.children}</Suspense>
        )}
      >
        <FileRoutes />
      </Router>
      {/* Debug panel only in development */}
      <Show when={isDev}>
        <FeatureFlagsDebugPanel />
      </Show>
    </FeatureFlagsProvider>
  );
}
