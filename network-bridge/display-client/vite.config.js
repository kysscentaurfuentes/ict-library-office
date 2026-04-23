// display-client/vite.config.d.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { builtinModules } from "module";
// https://vitejs.dev/config/
export default defineConfig({
    root: ".",
    base: "./",
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                app: "index.html",
                preload: "preload.ts",
            },
            output: {
                entryFileNames: "[name].js",
                assetFileNames: "assets/[name].[ext]",
                // **Ito ang mahalagang bahagi**
                // I-set ang format sa 'cjs' para sa preload script
                manualChunks(id) {
                    if (id.includes("preload.ts")) {
                        return "preload";
                    }
                },
                format: "cjs" // I-set sa cjs para sa lahat ng entry points
            },
            external: [
                "electron",
                ...builtinModules.map(m => `node:${m}`)
            ]
        },
    },
    plugins: [react()],
});
