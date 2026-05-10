import { 
  METADATA_PROMPT, 
  PHENOMENOLOGY_PROMPT, 
  JUNGIAN_PROMPT,
  IMAGE_PROMPT_REWRITE,
} from './prompts'
import type { DreamMetadata } from './types'

// 通用 Kimi 调用封装
async function callKimi(
  systemPrompt: string,
  userInput: string,
  temperature: number = 0.7
): Promise<string> {
  const response = await fetch('/api/kimi/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      temperature,
    }),
  })
  
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Kimi API error: ${response.status} ${text}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// Agent 1: 元数据提取
export async function extractMetadata(dreamText: string): Promise<DreamMetadata> {
  const raw = await callKimi(METADATA_PROMPT, dreamText, 0.3)
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON 解析失败,原文:', raw)
    throw new Error('元数据提取失败,请重试')
  }
}

// Agent 2: 现象学还原
export async function phenomenologicalReduction(
  dreamText: string,
  metadata: DreamMetadata
): Promise<string> {
  const input = `【原始梦境】\n${dreamText}\n\n【结构化信息】\n${JSON.stringify(metadata, null, 2)}`
  return callKimi(PHENOMENOLOGY_PROMPT, input, 0.8)
}

// Agent 3: 荣格解读
export async function jungianInterpretation(
  dreamText: string,
  metadata: DreamMetadata,
  phenomenology: string
): Promise<string> {
  const input = `【梦境结构】\n${JSON.stringify(metadata, null, 2)}\n\n【现象学还原】\n${phenomenology}\n\n【原始梦境】\n${dreamText}`
  return callKimi(JUNGIAN_PROMPT, input, 0.85)
}

// Agent 4a: 把梦境改写为英文绘画 prompt
async function rewriteImagePrompt(dreamText: string): Promise<string> {
  return callKimi(IMAGE_PROMPT_REWRITE, dreamText, 0.7)
}

// Agent 4b: 调硅基流动文生图
async function generateImage(imagePrompt: string): Promise<string> {
  const response = await fetch('/api/silicon/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Kwai-Kolors/Kolors',
      prompt: imagePrompt,
      image_size: '1024x1024',
      batch_size: 1,
      num_inference_steps: 20,
      guidance_scale: 7.5,
    }),
  })
  
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`图片生成失败: ${response.status} ${text}`)
  }
  
  const data = await response.json()
  return data.images[0].url
}

// Agent 4 整体:从梦境到图片 URL
export async function generateDreamImage(dreamText: string): Promise<string> {
  console.log('[Step 4a] 改写绘画 prompt...')
  const imagePrompt = await rewriteImagePrompt(dreamText)
  console.log('[Step 4b] 生成图片,prompt:', imagePrompt)
  return generateImage(imagePrompt)
}

// 完整管线
export async function analyzeDream(dreamText: string) {
  console.log('[Step 1/4] 提取元数据...')
  const metadata = await extractMetadata(dreamText)
  
  console.log('[Step 2/4] 现象学还原...')
  const phenomenology = await phenomenologicalReduction(dreamText, metadata)
  
  console.log('[Step 3/4] 荣格解读...')
  const jungian = await jungianInterpretation(dreamText, metadata, phenomenology)
  
  console.log('[Step 4/4] 生成图片...')
  let imageUrl: string | undefined
  try {
    imageUrl = await generateDreamImage(dreamText)
  } catch (e) {
    console.error('图片生成失败,但不影响文字结果:', e)
  }
  
  return { metadata, phenomenology, jungian, imageUrl }
}