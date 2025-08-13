export type Post = {
  frontMatter: {
    date: string
    title: string
    category: string
    tags: string[]
    description: string
    meta?: Array<{
      property: string
      content: string
    }>
  }
  regularPath: string
}
