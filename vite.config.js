import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // amazon-cognito-identity-js (via its `buffer` dep) references Node's
  // `global`, which doesn't exist in browsers. Alias it to globalThis so
  // the SDK loads in both dev and build.
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5200,
    strictPort: true,
  },
})
