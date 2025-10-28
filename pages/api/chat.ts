import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication for chat
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in to use chat' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const message: string = typeof body.message === 'string' ? body.message : ''

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' })
    }

    const requestedModel: string | undefined = body.model || body?.gemini?.name
    const preferredModel = requestedModel || process.env.GEMINI_MODEL || 'models/gemini-1.5-flash'

    const generationConfigInput = body.generationConfig || body?.gemini?.generationConfig || {}
    const generationConfig: Record<string, unknown> = {}
    for (const key of ['temperature', 'topK', 'topP', 'maxOutputTokens']) {
      if (generationConfigInput[key] !== undefined) generationConfig[key] = generationConfigInput[key]
    }

    const candidates = Array.from(new Set([
      preferredModel,
      'models/gemini-1.5-flash',
      'models/gemini-1.5-flash-latest',
    ]))

    const runGenerate = async (modelName: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          generationConfig,
        }),
      })

      if (!resp.ok) {
        const errText = await resp.text()
        const error = new Error(`Gemini API error: ${resp.status} ${resp.statusText} - ${errText}`)
        ;(error as any).status = resp.status
        ;(error as any).statusText = resp.statusText
        throw error
      }

      const data = await resp.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (!text) throw new Error('No content returned from Gemini API')
      return text
    }

    let lastError: any
    for (const modelName of candidates) {
      try {
        const text = await runGenerate(modelName)
        return res.status(200).json({ text })
      } catch (err: any) {
        lastError = err
        const isNotFound = err?.status === 404 || /not found/i.test(err?.message || '') || /not found/i.test(err?.statusText || '')
        if (isNotFound) {
          console.warn(`Model "${modelName}" not available, trying next candidate`)
          continue
        } else {
          break
        }
      }
    }

    const isNotFound = lastError?.status === 404 || /not found/i.test(lastError?.message || '') || /not found/i.test(lastError?.statusText || '')
    if (isNotFound) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const data = await resp.json()
        const models = Array.isArray(data?.models) ? data.models.map((m: any) => ({
          name: m?.name,
          methods: m?.supportedGenerationMethods,
        })) : []
        console.warn('Available models for current API key:', models)
        return res.status(404).json({
          error: 'Requested model not available for this API key',
          availableModels: models,
          hint: 'Set GEMINI_MODEL to one of the available names or use models/gemini-1.5-flash(-latest). Ensure Generative Language API is enabled for your project.'
        })
      } catch (listErr) {
        console.warn('Failed to list available models:', listErr)
      }
    }

    throw lastError || new Error('Failed to generate response')
  } catch (error: any) {
    console.error('Chat API error:', {
      status: error?.status,
      statusText: error?.statusText,
      message: error?.message,
    })
    const status = typeof error?.status === 'number' ? error.status : 500
    const message = error?.message || 'Failed to generate response'
    return res.status(status).json({ error: message })
  }
}