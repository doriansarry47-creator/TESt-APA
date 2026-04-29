import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig(async () => {
  const devPlugins: ReturnType<typeof import("vite").defineConfig>[] = [];

  // Only load Replit-specific plugins in Replit dev environment
  if (!isProduction && process.env.REPL_ID !== undefined) {
    try {
      const { default: runtimeErrorOverlay } = await import(
        "@replit/vite-plugin-runtime-error-modal"
      );
      const { cartographer } = await import(
        "@replit/vite-plugin-cartographer"
      );
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      devPlugins.push(
        runtimeErrorOverlay(),
        cartographer({ root: path.resolve(import.meta.dirname, "..") }),
        devBanner(),
      );
    } catch {
      // Replit plugins not available – silently skip
    }
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), ...devPlugins],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      // Improve chunk loading reliability
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["wouter"],
            query: ["@tanstack/react-query"],
            charts: ["recharts"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-toast",
              "@radix-ui/react-tooltip",
            ],
          },
        },
      },
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
