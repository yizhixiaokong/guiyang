import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getGithubPagesBase() {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    return '/'
  }

  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]

  if (!repository) {
    return '/'
  }

  return `/${repository}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getGithubPagesBase(),
  plugins: [react()],
  server: {
    port: 5100,
  },
  preview: {
    port: 5100,
  },
})
