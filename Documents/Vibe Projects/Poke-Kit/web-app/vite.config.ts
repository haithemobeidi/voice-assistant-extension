import { defineConfig } from 'vite'

export default defineConfig({
  // WSL2 fix: Use polling for file watching since native watchers
  // don't work reliably across the Windows/WSL filesystem boundary
  server: {
    watch: {
      usePolling: true,
      interval: 100, // Check every 100ms
    },
    // Force HMR to work properly
    hmr: {
      overlay: true,
    },
  },
  // Ensure full page reload for TS files if HMR fails
  optimizeDeps: {
    exclude: [], // Don't exclude anything from optimization
  },
})
