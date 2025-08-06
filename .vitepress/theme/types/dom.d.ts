declare global {
  interface Element {
    readonly contentWindow?: Window | null
  }
}

export {}
