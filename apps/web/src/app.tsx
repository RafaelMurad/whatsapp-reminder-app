// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Navigation from "./components/Navigation";

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
          <Navigation />
          <Suspense>{props.children}</Suspense>
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
