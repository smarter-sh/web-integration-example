import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { comlink } from "vite-plugin-comlink";
import { ROOT_DOMAIN } from "./src/shared/constants";

const env = loadEnv("production", process.cwd(), "");

let subdomain = "alpha.";

let environment = env.VITE_ENVIRONMENT || "alpha";
console.log("vite.config.ts: environment:", environment);

switch (environment) {
  case "alpha":
    subdomain = "alpha.";
    break;
  case "beta":
    subdomain = "beta.";
    break;
  case "prod":
    subdomain = "";
    break;
  default:
    console.log("vite.config.ts: unrecognized git branch. Using alpha as default", environment);
    subdomain = "alpha.";
}
// see smarter_settings.environment_cdn_url
// https://github.com/smarter-sh/smarter/blob/beta/smarter/smarter/common/conf.py#L523
export const CDN_HOST_BASE_URL = "https://cdn." + subdomain + "platform." + ROOT_DOMAIN + "/ui-chat/";

console.log("smarter-workbench app-loader subdomain:", subdomain);
console.log("smarter-workbench app-loader CDN_HOST_BASE_URL:", CDN_HOST_BASE_URL);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const commonConfig = {
    plugins: [react(), comlink()],
    define: {
      VITE_ENVIRONMENT: JSON.stringify(env.VITE_ENVIRONMENT),
    },
    build: {
      sourcemap: true,
      outDir: "../build",
      assetsDir: "assets",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.html"),
          helloWorld: resolve(__dirname, "src/hello-world.html"),
        },
        external: [],
      },
    },
    root: "src",
    publicDir: resolve(__dirname, "src/public"),
    optimizeDeps: {
      include: ["@smarter.sh/ui-chat", "@chatscope/chat-ui-kit-react"],
    },
  };

  if (mode === "dev") {
    return {
      ...commonConfig,
      base: "/",
      server: {
        port: 3000,
        open: true,
      },
    };
  } else {
    return {
      ...commonConfig,
      base: CDN_HOST_BASE_URL,
    };
  }
});
