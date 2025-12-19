export const routeTable = {
  home: { hash: "home" },
  viewer: { hash: "viewer" },
  diagnostics: { hash: "diagnostics" },
} as const;

export type RouteName = keyof typeof routeTable;

export type ResolvedRoute = {
  name: RouteName;
  hash: string;
  query: Record<string, string>;
  raw: string;
};

const defaultRoute: RouteName = "home";

function normalizeHash(rawHash: string): string {
  const h = rawHash || `#/${routeTable[defaultRoute].hash}`;
  if (h.startsWith("#/")) return h.slice(2);
  if (h.startsWith("#")) return h.slice(1);
  return h;
}

function splitRouteAndQuery(normalized: string): { routePart: string; query: Record<string, string> } {
  const qIndex = normalized.indexOf("?");
  const routePart = qIndex === -1 ? normalized : normalized.slice(0, qIndex);
  const queryString = qIndex === -1 ? "" : normalized.slice(qIndex + 1);

  const query = Object.fromEntries(new URLSearchParams(queryString));
  return { routePart, query };
}

export function resolveRoute(rawHash: string = location.hash): ResolvedRoute {
  const normalized = normalizeHash(rawHash);
  const { routePart, query } = splitRouteAndQuery(normalized);

  const names = Object.keys(routeTable) as RouteName[];
  const name = names.find((n) => routeTable[n].hash === routePart) ?? defaultRoute;

  return {
    name,
    hash: routeTable[name].hash,
    query,
    raw: rawHash,
  };
}

export function getRoute(): RouteName {
  return resolveRoute().name;
}

export function goTo(
  name: RouteName,
  query?: Record<string, string | number | boolean | null | undefined>
) {
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue;
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  const hashPath = routeTable[name].hash;

  location.hash = `#/${hashPath}${queryString ? `?${queryString}` : ""}`;
}

export function onRouteChange(cb: (route: ResolvedRoute) => void, immediate = true) {
  const handler = () => cb(resolveRoute());
  window.addEventListener("hashchange", handler);
  if (immediate) handler();
  return () => window.removeEventListener("hashchange", handler);
}
