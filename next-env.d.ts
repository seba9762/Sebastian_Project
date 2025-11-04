/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL?: string
    readonly NEXT_PUBLIC_SUPABASE_KEY?: string
  }
}
