import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '.context/api/openapi.json',
  output: 'src/generated/api',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@tanstack/react-query',
  ],
})
