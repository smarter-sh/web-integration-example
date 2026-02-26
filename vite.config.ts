import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { comlink } from "vite-plugin-comlink";
import { execSync } from "child_process";
import { platform } from "os";

// Get current git branch name synchronously (outside the exported function)
let subdomain = "";
try {
  subdomain = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  subdomain = subdomain + ".";
} catch (e) {
  console.warn("Could not determine git branch for subdomain:", e);
  subdomain = "";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const rootDomain = env.VITE_ROOT_DOMAIN;
  const platformSubdomain = env.VITE_PLATFORM_SUBDOMAIN;
  if (subdomain == platformSubdomain || subdomain === platformSubdomain + ".") {
    subdomain = "";
  }


  // see smarter_settings.environment_cdn_url
  // https://github.com/smarter-sh/smarter/blob/beta/smarter/smarter/common/conf.py#L523
  const CDN_HOST_BASE_URL = "https://cdn." + subdomain + platformSubdomain + "." + rootDomain + "/ui-chat/";

  console.log("smarter-workbench app-loader subdomain:", subdomain.replace(/\./g, ""));
  console.log("smarter-workbench app-loader CDN_HOST_BASE_URL:", CDN_HOST_BASE_URL);


  const commonConfig = {
    plugins: [react(), comlink()],
    define: {
      VITE_ENVIRONMENT: JSON.stringify(env.VITE_ENVIRONMENT),
      VITE_ROOT_DOMAIN: JSON.stringify(rootDomain),
      VITE_PLATFORM_SUBDOMAIN: JSON.stringify(platformSubdomain),
      VITE_SUBDOMAIN: JSON.stringify(subdomain.replace(/\./g, "")),
    },
    build: {
      sourcemap: true,
      outDir: "../build",
      assetsDir: "assets",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.html"),
          helloWorld: resolve(__dirname, "src/hello-world.html"),
          "app-loader": resolve(__dirname, "src/app-loader.js"),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          preserveModules: false,
        },
        external: [],
        //preserveEntrySignatures: 'strict',
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
