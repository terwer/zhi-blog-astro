import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"
import vercel from "@astrojs/vercel/serverless"
import path from "path"

// https://astro.build/config
export default defineConfig({
  integrations: [vue({ appEntrypoint: "/src/pages/_app" })],
  output: "server",
  adapter: vercel(),
})
