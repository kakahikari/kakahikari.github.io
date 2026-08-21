export type Post = {
  frontMatter: {
    date: string
    title: string
    category: string
    tags: string[]
    description: string
    author?: string
    meta?: Array<{
      property: string
      content: string
    }>
  }
  regularPath: string
  cover: Cover | null
}

export type Cover = {
  src: string
  width: number | null
  height: number | null
  variants: Array<{ width: number; url: string }>
}
