'use client'

import { useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function DocumentEditor({
  content,
  onChange,
  placeholder
}: DocumentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Focus the editor when it's mounted
    textareaRef.current?.focus()
  }, [])

  return (
    <TextareaAutosize
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none bg-transparent outline-none"
      minRows={20}
    />
  )
} 