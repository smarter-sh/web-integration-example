import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { comlink } from "vite-plugin-comlink";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const rootDomain = env.VITE_ROOT_DOMAIN;
  const platformSubdomain = env.VITE_PLATFORM_SUBDOMAIN;
  const subdomain = "";


  // see smarter_settings.environment_cdn_url
  // https://github.com/smarter-sh/smarter/blob/beta/smarter/smarter/common/conf.py#L523
  const CDN_HOST_BASE_URL = "https://cdn." + subdomain + platformSubdomain + "." + rootDomain + "/ui-chat/";

  console.log("smarter-workbench app-loader subdomain:", subdomain);
  console.log("smarter-workbench app-loader CDN_HOST_BASE_URL:", CDN_HOST_BASE_URL);


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
