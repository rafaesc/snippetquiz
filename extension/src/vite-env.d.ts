/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly FRONTEND_URL: string

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}