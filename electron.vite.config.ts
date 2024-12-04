import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
          noteWinPreload: resolve(__dirname, "src/preload/noteWinPreload.ts") // Include the new preload script
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          main_window: resolve(__dirname, "src/renderer/index.html"),
          modal_window: resolve(__dirname, "src/renderer/windows/newNote/index.html")
        },
        output: {
          entryFileNames: "assets/[name].js", // Ensures unique filenames
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]"
        }
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react()]
  }
});
