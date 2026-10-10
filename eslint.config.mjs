import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Static scene assets use native image error handlers and CSS cropping.
  {
    files: ['src/components/HeritageApp.tsx', 'src/components/SceneImage.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', '.superpowers/**', 'next-env.d.ts', 'test-results/**', 'playwright-report/**']),
]);
