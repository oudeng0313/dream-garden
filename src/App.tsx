import { useState, useEffect } from 'react'
import { analyzeDream } from './agents'
import { saveDream, loadAllDreams, deleteDream } from './storage'
import type { DreamRecord } from './types'

export default function App() {
  const [dreamText, setDreamText] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentResult, setCurrentResult] = useState<DreamRecord | null>(null)
  const [history, setHistory] = useState<DreamRecord[]>([])
  const [error, setError] = useState('')
  const [step, setStep] = useState('')

  useEffect(() => {
    setHistory(loadAllDreams())
  }, [])

  const handleAnalyze = async () => {
    if (!dreamText.trim()) {
      setError('请先描述你的梦境')
      return
    }
    setLoading(true)
    setError('')
    setCurrentResult(null)

    try {
      setStep('正在与梦境对话...')
      const result = await analyzeDream(dreamText)
      
      const record: DreamRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('zh-CN'),
        rawText: dreamText,
        ...result,
      }
      
      saveDream(record)
      setCurrentResult(record)
      setHistory(loadAllDreams())
      setDreamText('')
    } catch (e: any) {
      setError(e.message || '分析失败,请重试')
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const handleDelete = (id: string) => {
    deleteDream(id)
    setHistory(loadAllDreams())
    if (currentResult?.id === id) setCurrentResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="text-center py-8">
        <h1 className="text-4xl font-light tracking-wider">梦境花园</h1>
        <p className="text-sm text-gray-400 mt-2">基于荣格分析心理学的梦境对话</p>
      </header>

      <div className="bg-white/5 rounded-lg p-6 backdrop-blur">
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="描述一个梦……发生了什么?你看到了什么?感受到什么?"
          className="w-full h-40 bg-transparent border border-white/20 rounded p-4 text-gray-100 resize-none focus:outline-none focus:border-white/40"
          disabled={loading}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 w-full py-3 bg-indigo-600/80 hover:bg-indigo-500 rounded transition disabled:opacity-50"
        >
          {loading ? step || '分析中...' : '开始对话'}
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      {currentResult && <ResultView record={currentResult} />}

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-light mb-4">梦境档案</h2>
          <div className="space-y-3">
            {history.map((d) => (
              <div
                key={d.id}
                className="bg-white/5 rounded p-4 cursor-pointer hover:bg-white/10 transition"
                onClick={() => setCurrentResult(d)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{d.date}</p>
                    <p className="text-sm mt-1 line-clamp-2">{d.rawText}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(d.id)
                    }}
                    className="text-gray-500 hover:text-red-400 ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ResultView({ record }: { record: DreamRecord }) {
  return (
    <div className="mt-8 space-y-6">
      {/* 梦境配图(放最上方,有就显示) */}
      {record.imageUrl && (
        <section className="rounded-lg overflow-hidden border border-white/10 shadow-2xl">
          <img 
            src={record.imageUrl} 
            alt="梦境视觉化" 
            className="w-full h-auto block"
            loading="lazy"
          />
        </section>
      )}

      {/* 梦境结构 */}
      <section className="bg-white/5 rounded-lg p-6">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">梦境结构</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">场景:</span> {record.metadata.scene}</div>
          <div><span className="text-gray-500">情绪:</span> {record.metadata.emotion}</div>
          <div><span className="text-gray-500">角色:</span> {record.metadata.characters.join('、')}</div>
          <div><span className="text-gray-500">意象:</span> {record.metadata.keyImages.join('、')}</div>
        </div>
      </section>

      {/* 现象学还原 */}
      <section className="bg-white/5 rounded-lg p-6">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">现象学还原</h3>
        <p className="leading-relaxed text-gray-200 italic">{record.phenomenology}</p>
      </section>

      {/* 荣格解读 */}
      <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-500/20">
        <h3 className="text-sm uppercase tracking-widest text-indigo-300 mb-3">荣格的低语</h3>
        <p className="leading-relaxed text-gray-100 whitespace-pre-wrap">{record.jungian}</p>
      </section>
    </div>
  )
}