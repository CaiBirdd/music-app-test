/**
 * 歌词解析器
 * 支持 LRC 标准格式
 */

export interface LyricLine {
  time: number // 开始时间（秒）
  duration: number // 持续时间（秒）
  text: string // 歌词文本
  index: number // 行索引
}

export interface ParseResult {
  lines: LyricLine[]
  noTimestamp: boolean // 是否没有时间戳（纯文本歌词）
}

/**
 * 时间格式反序列化
 * @example '01:02.410' => 62.41
 */
function parseTime(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length !== 2) return 0
  const minutes = parseInt(parts[0], 10)
  const seconds = parseFloat(parts[1])
  return minutes * 60 + seconds
}

/**
 * 解析标准 LRC 格式歌词
 * @example [00:24.46]春雨后太阳缓缓的露出笑容
 * @example [03:05.32][01:28.24]这个夏天 融化了整个季节（多时间标签）
 */
export function parseLRC(lrcStr: string): ParseResult {
  const result: LyricLine[] = []
  if (!lrcStr || !lrcStr.trim()) {
    return { lines: result, noTimestamp: true }
  }

  const lines = lrcStr.split(/\r?\n/).filter((line) => line.trim())
  let needSort = false
  let index = 0

  for (const line of lines) {
    // 跳过 JSON 格式的元数据行（作词、作曲等）
    if (line.startsWith('{')) continue

    // 跳过元数据标签 [ti:xxx] [ar:xxx] [al:xxx] 等
    if (/^\[[a-zA-Z]+:/.test(line)) continue

    // 匹配时间标签 [mm:ss.xx] 或 [mm:ss:xx]
    const timeRegex = /\[(\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?)\]/g
    const timeTags: number[] = []
    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = timeRegex.exec(line)) !== null) {
      timeTags.push(parseTime(match[1]))
      lastIndex = timeRegex.lastIndex
    }

    // 没有时间标签的行
    if (timeTags.length === 0) {
      const text = line.trim()
      if (text) {
        result.push({ time: 0, duration: 0, text, index: index++ })
      }
      continue
    }

    // 提取歌词文本
    const text = line.slice(lastIndex).trim()

    // 多时间标签情况，需要后续排序
    if (timeTags.length > 1) needSort = true

    // 为每个时间标签创建歌词行
    for (const time of timeTags) {
      result.push({ time, duration: 0, text, index: 0 })
    }
  }

  // 检查是否都没有有效时间
  const hasValidTime = result.some((line) => line.time > 0)
  if (!hasValidTime && result.length > 0) {
    result.forEach((line, i) => (line.index = i))
    return { lines: result, noTimestamp: true }
  }

  // 按时间排序
  if (needSort) {
    result.sort((a, b) => a.time - b.time)
  }

  // 重新分配索引并计算 duration
  for (let i = 0; i < result.length; i++) {
    result[i].index = i
    if (i < result.length - 1) {
      result[i].duration = result[i + 1].time - result[i].time
    } else {
      result[i].duration = 5 // 最后一行默认 5 秒
    }
  }

  return { lines: result, noTimestamp: false }
}
