import { eventHandler } from "vinxi/http";
import { renderToPipeableStream } from "react-dom/server";
import App from "./app";
import { Suspense } from "react";
import { Route, Router } from "wouter";
import { lazyRoute, renderAsset } from "@vinxi/react";
import { getManifest } from "vinxi/manifest";
import fileRoutes from "vinxi/routes";

export default eventHandler(async (event) => {
  const clientManifest = getManifest("client");
  const ssrManifest = getManifest("ssr");

  const routes = fileRoutes.map((route) => ({
    path: route.path,
    component: lazyRoute(route.$component, clientManifest, ssrManifest),
  }));

  const assets = await clientManifest.inputs[clientManifest.handler].assets();

  const base =
    import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

  const stream = renderToPipeableStream(
    <Router ssrPath={event.path} base={base}>
      {/* @ts-expect-error */}
      <App assets={<Suspense>{assets.map(renderAsset)}</Suspense>}>
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
    </Router>,
    {
      bootstrapModules: [
        clientManifest.inputs[clientManifest.handler].output.path,
      ],
      bootstrapScriptContent: `
        window.manifest = ${JSON.stringify(clientManifest.json())};
        window.base = ${JSON.stringify(base)}
      `,
    }
  );

  return stream;
});
