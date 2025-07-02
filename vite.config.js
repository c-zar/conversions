import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
// https://vitejs.dev/config/
export default defineConfig({
  base: '/conversions/', // <-- Set this to your repo name, or '/' for root
  plugins: [svelte(), tailwindcss()],
});
