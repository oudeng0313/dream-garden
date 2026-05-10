// 第一段输出的结构化数据
export interface DreamMetadata {
  scene: string
  characters: string[]
  keyImages: string[]
  emotion: string
  actionLine: string
}

// 完整的梦境记录
export interface DreamRecord {
  id: string
  date: string
  rawText: string
  metadata: DreamMetadata
  phenomenology: string
  jungian: string
  imageUrl?: string
}