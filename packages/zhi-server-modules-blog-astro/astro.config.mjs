import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"
import node from "@astrojs/node"
import vercel from "@astrojs/vercel/serverless"

const isDev = process.env.NODE_ENV === "development"
// const isTest = process.env.NODE_ENV === "test"
// const isVercelBuild = process.env.BUILD_TYPE === "vercel"
// default is vercel
const isVercelBuild = true
// const isNodeBuild = process.env.BUILD_TYPE === "node"
console.log("isDev=>", isDev)
console.log("isVercelBuild=>", isVercelBuild)
// console.log("isNodeBuild=>", isNodeBuild)

// 生产构建需要加上externals，否则无法运行
// const externals = isDev
//     ? []
//     : [
//           "undici",
//           "server-destroy",
//           "vue",
//           "busboy",
//           "html-escaper",
//           "kleur",
//           "slash",
//           "string-width",
//           "path-to-regexp",
//           "streamsearch",
//           "strip-ansi",
//           "eastasianwidth",
//           "ansi-regex",
//           "emoji-regex",
//       ]

export default defineConfig({
    outDir: "../../dist/packages/zhi/server/blog-astro",
    integrations: [
        vue({
            appEntrypoint: "/src/pages/_app",
        }),
    ],
    // 注释掉 output 可以构建成纯静态页面
    output: "server",
    // vite: {
    //     ssr: {
    //         noExternal: externals,
    //     },
    //     server: {
    //         fs: {
    //             // if you use this with --host anyone on the network can view
    //             // the contents of your yarn cache (including private packages)
    //             strict: false
    //         }
    //     }
    // },
    // https://docs.astro.build/en/guides/integrations-guide/vercel/
    // https://docs.astro.build/en/guides/integrations-guide/node/#standalone
    adapter: isVercelBuild
        ? vercel()
        : node({
              mode: "standalone",
              // middleware 可配合express
              // mode: "middleware"
          }),
})
