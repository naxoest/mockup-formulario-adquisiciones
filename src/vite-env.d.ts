interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_PROFILE_IMAGES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
