import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['api/abbreviations.ts'],
  outDir: 'dist/api',
  format: 'esm'
})
