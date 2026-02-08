import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    projects: [
      {
        test: {
          name: 'backend',
          environment: 'node',
          globals: true,
          include: ['../electron/__tests__/**/*.test.ts'],
          setupFiles: ['./test/setup-backend.ts'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'frontend',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./test/setup-frontend.ts'],
          css: false,
          pool: 'vmThreads',
        },
      },
    ],
  },
})
