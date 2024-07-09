import App from "./app";
import { Suspense } from "react";
import { Route, Router } from "wouter";
import { getManifest } from "vinxi/manifest";
import { createAssets, lazyRoute } from "@vinxi/react";
import fileRoutes from "vinxi/routes";
import { pathToRegexp } from "path-to-regexp";
import { hydrateRoot } from "react-dom/client";
import "vinxi/client";

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
    getManifest("ssr")
  ),
}));

const Assets = createAssets(
  getManifest("client").handler,
  getManifest("client")
);

hydrateRoot(
  document,
  <Router parser={convertPathToRegexp} base={(window as any).base}>
    <App
      assets={
        <Suspense>
          <Assets />
        </Suspense>
      }
    >
      <Suspense>
        {routes.map((route) => (
          <Route
            path={route.path}
            key={route.path}
            component={route.component}
          />
        ))}
      </Suspense>
    </App>
  </Router>
);
