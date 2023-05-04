/// <reference types="vitest" />
import { defineConfig } from "vite"

import viteTsConfigPaths from "vite-tsconfig-paths"
import livereload from "rollup-plugin-livereload"
import { argv } from "process"

// 处理参数
const devOutDir = "/Users/terwer/Documents/mydocs/SiYuanWorkspace/public/conf/appearance/themes/zhi"
const args: any = argv[2].startsWith("{") ? JSON.parse(argv[2]) : undefined
const isWatch = args?.targetDescription?.target === "dev" ?? false
const isProduction = !isWatch
console.log("isWatch=>", isWatch)
console.log("isProduction=>", isProduction)

export default defineConfig({
  cacheDir: "../../node_modules/.vite/zhi-core",

  plugins: [
    viteTsConfigPaths({
      root: "../../",
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    cssCodeSplit: true,

    lib: {
      entry: ["src/index.ts"],
      formats: ["es"],
    },

    rollupOptions: {
      plugins: [...((isWatch ? [livereload(devOutDir)] : []) as any[])],
      // External packages that should not be bundled into your library.
      external: [],
      output: {
        entryFileNames: "theme.js",
        assetFileNames: "theme.css",
      },
    },
  },

  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest",
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
})
