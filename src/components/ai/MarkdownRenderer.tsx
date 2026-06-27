import React from "react"

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<strong key={parts.length}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

interface ListBlock {
  type: "ul" | "ol"
  items: React.ReactNode[]
}

function isListBlock(line: string): { type: "ul" | "ol"; content: string } | null {
  const ulMatch = line.match(/^[-*]\s+(.*)/)
  if (ulMatch) return { type: "ul", content: ulMatch[1] }
  const olMatch = line.match(/^\d+\.\s+(.*)/)
  if (olMatch) return { type: "ol", content: olMatch[1] }
  return null
}

export default function MarkdownRenderer({ children }: { children: string }) {
  const blocks: React.ReactNode[] = []
  const paragraphs = children.split(/\n\n+/)
  let blockIndex = 0

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    const lines = trimmed.split("\n")
    const listBlocks: ListBlock[] = []
    let currentList: ListBlock | null = null

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) {
        currentList = null
        continue
      }

      const listMatch = isListBlock(line)
      if (listMatch) {
        if (!currentList || currentList.type !== listMatch.type) {
          currentList = { type: listMatch.type, items: [] }
          listBlocks.push(currentList)
        }
        currentList.items.push(<li key={currentList.items.length}>{parseInline(listMatch.content)}</li>)
      } else {
        currentList = null
        blocks.push(
          <p key={blockIndex++} className="mb-1 last:mb-0">
            {parseInline(line)}
          </p>,
        )
      }
    }

    for (const list of listBlocks) {
      const ListTag = list.type === "ul" ? "ul" : "ol"
      const className = list.type === "ul" ? "list-disc list-inside mb-1 last:mb-0 space-y-0.5" : "list-decimal list-inside mb-1 last:mb-0 space-y-0.5"
      blocks.push(
        <ListTag key={blockIndex++} className={className}>
          {list.items}
        </ListTag>,
      )
    }
  }

  return <>{blocks}</>
}
