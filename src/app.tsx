import { lazyRoute } from "@vinxi/react";
import { pathToRegexp } from "path-to-regexp";
import { Suspense } from "react";
import { getManifest } from "vinxi/manifest";
import fileRoutes from "vinxi/routes";
import { Link, Route, Router } from "wouter";

export interface Todo {
  text: string;
  completed: boolean;
}

const convertPathToRegexp = (path: string) => {
  let keys = [];
  const pattern = pathToRegexp(path, keys, { strict: true });
  return { keys, pattern };
};

const routes = fileRoutes.map((route) => ({
  path: route.path,
  component: lazyRoute(
    route.$component,
    getManifest("client"),
    getManifest("client")
  ),
}));

export default function () {
  return (
    <>
      <div style={{ display: "flex", gap: "8px" }}>
        <Link to="/">Home</Link>
        <Link to="/todos">Todos</Link>
      </div>
      <Suspense>
        <Router parser={convertPathToRegexp} base={(window as any).base}>
          {routes.map((route) => (
            <Route
              path={route.path}
              key={route.path}
              component={route.component}
            />
          ))}
        </Router>
      </Suspense>
    </>
  );
}
