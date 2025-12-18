export type Route = "home" | "viewer" | "diagnostics";

export function getRoute(): Route {
  const hash = (location.hash || "#/home").replace("#/", "");
  if (hash === "viewer") return "viewer";
  if (hash === "diagnostics") return "diagnostics";
  return "home";
}

export function goTo(route: Route) {
  location.hash = `#/${route}`;
}
