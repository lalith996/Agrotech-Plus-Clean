"use client"
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface ChatItem {
  role: 'user' | 'bot' | 'system'
  content: string
}

const STORAGE_KEY = 'chatbotHistory'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const suggestions = [
    'What can you help me with?',
    'Show latest products',
    'Help tracking my order',
    'Recommend items for me'
  ]

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as ChatItem[]
        setChatHistory(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory))
      }
    } catch {}
  }, [chatHistory])

  useEffect(() => {
    if (listRef.current && autoScroll) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [chatHistory, isLoading, autoScroll])

  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    const threshold = 16
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
    setShowScrollToBottom(!atBottom)
  }

  const sendMessage = async (text?: string) => {
    const msg = (text ?? message).trim()
    if (!msg) return

    setError(null)
    setChatHistory(prev => [...prev, { role: 'user', content: msg }])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || 'Failed to get response')
      }

      const data = await response.json()
      const botText = data?.text || 'Sorry, I could not understand that.'
      setChatHistory(prev => [...prev, { role: 'bot', content: botText }])
    } catch (e: any) {
      const message = e?.message || 'Something went wrong.'
      setError(message)
      setChatHistory(prev => [...prev, { role: 'system', content: message }])
    } finally {
      setIsLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Launcher button */}
      {!isOpen && (
        <button
          aria-label="Open chat"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-[#00B207] text-white shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[22rem] max-w-[92vw]">
          <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div>
                <p className="text-sm font-semibold">AgroTech Assistant</p>
                <p className="text-xs text-gray-500">Ask anything about products or orders</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoScroll(v => !v)}
                  className="text-xs px-2 py-1 rounded-md border bg-white hover:bg-gray-100"
                  aria-label="Toggle auto-scroll"
                >
                  Auto-scroll: {autoScroll ? 'On' : 'Off'}
                </button>
                <button
                  aria-label="Close chat"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {chatHistory.length === 0 && (
              <div className="px-4 pt-3 pb-2 space-y-2">
                <p className="text-xs text-gray-500">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div 
              ref={listRef} 
              onScroll={handleScroll}
              className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-3"
            >
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm ${
                      chat.role === 'user'
                        ? 'bg-[#00B207] text-white rounded-br-sm'
                        : chat.role === 'bot'
                        ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {chat.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scroll to bottom button */}
            {showScrollToBottom && (
              <div className="px-4">
                <button
                  type="button"
                  className="mt-2 mb-2 w-full text-xs px-3 py-1 rounded-md border bg-white hover:bg-gray-100"
                  onClick={() => {
                    if (listRef.current) {
                      listRef.current.scrollTop = listRef.current.scrollHeight
                    }
                  }}
                >
                  Scroll to bottom
                </button>
              </div>
            )}

            {/* Input */}
            <div className="border-t p-3">
              {error && (
                <div className="mb-2 text-xs text-red-600">{error}</div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  aria-label="Type your message"
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00B207]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button
                  aria-label="Send message"
                  className="h-9 px-3 inline-flex items-center gap-1 rounded-lg bg-[#00B207] text-white disabled:opacity-50 hover:bg-green-700"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="text-xs">Send</span>
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">Press Enter to send, Shift+Enter for newline</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
