/// <reference types="vite/client" />

/**
 * Types for this project's own environment variables, so `import.meta.env`
 * is checked rather than being `any`.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
