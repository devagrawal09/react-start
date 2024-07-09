import { createApp, resolve } from "vinxi";
import reactRefresh from "@vitejs/plugin-react";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { BaseFileSystemRouter, cleanPath } from "vinxi/fs-router";

export class PagesRouter extends BaseFileSystemRouter {
  toPath(src) {
    const routePath =
      // remove directory and file extensions
      cleanPath(src, this.config)
        // remove the initial slash
        .slice(1)
        // default `index.ts` to `/`
        .replace(/index$/, "")
        // dynamic routing
        .replace(/\[([^\/]+)\]/g, (_, m) => {
          if (m.length > 3 && m.startsWith("...")) {
            // [...catchall].tsx
            return `*${m.slice(3)}`;
          }

          // [param].tsx
          return `:${m}`;
        });

    console.log({ src, routePath });
    return routePath?.length > 0 ? `/${routePath}` : "/";
  }

  toRoute(src) {
    let path = this.toPath(src);

    // const [imports, exports] = analyzeModule(src);

    // object that will be available at runtime
    return {
      $component: {
        src: src,
        pick: ["default", "$css"],
      },
      path,
      filePath: src,
    };
  }
}

export default createApp({
  routers: [
    {
      type: "client",
      name: "client",
      handler: "./src/client.tsx",
      target: "browser",
      plugins: () => [serverFunctions.client(), reactRefresh()],
      routes: (router, app) =>
        new PagesRouter(
          {
            dir: resolve.absolute("./src/pages", router.root),
            extensions: ["js", "jsx", "ts", "tsx"],
          },
          router,
          app
        ),
      base: "/_build",
    },
    {
      type: "http",
      name: "ssr",
      handler: "./src/server.tsx",
      target: "server",
      plugins: () => [reactRefresh()],
      routes: (router, app) =>
        new PagesRouter(
          {
            dir: resolve.absolute("./src/pages", router.root),
            extensions: ["js", "jsx", "ts", "tsx"],
          },
          router,
          app
        ),
    },
    {
      type: "http",
      name: "api",
      handler: "./src/api.ts",
      base: "/api",
      target: "server",
    },
    serverFunctions.router(),
  ],
});
