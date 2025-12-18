import { getRoute } from "./routes";
import { renderHome } from "../ui/screens/Home";
import { renderViewer } from "../ui/screens/Viewer";
import { renderDiagnostics } from "../ui/screens/Diagnostics";

type Cleanup = void | (() => void | Promise<void>);

export function bootstrap() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Root #app não encontrado");

  let cleanup: Cleanup = undefined;

  const runCleanup = async () => {
    if (typeof cleanup === "function") await cleanup();
    cleanup = undefined;
  };

  const render = async () => {
    await runCleanup();

    root.innerHTML = "";
    const route = getRoute();

    if (route === "home") cleanup = await renderHome(root);
    else if (route === "viewer") cleanup = await renderViewer(root);
    else cleanup = await renderDiagnostics(root);
  };

  window.addEventListener("hashchange", () => void render());
  void render();
}