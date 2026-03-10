import axios from 'axios'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 5000

export async function generateGeminiContent(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables')
  }

  let lastError: any
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
        }
      )

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content) {
        throw new Error('No content received from Gemini API')
      }

      return content
    } catch (error: any) {
      lastError = error
      const status = error?.response?.status
      if (status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
        console.warn(`Gemini rate limit hit (429). Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error('Gemini API Error:', error)
        throw error
      }
    }
  }

  throw lastError
}

// Example for analysis (skin condition analysis)
export async function analyzeSkinCondition(description: string, imageData?: string): Promise<string> {
  const prompt = imageData
    ? `Analyze this skin condition image and description: ${description}. Provide preliminary observations.`
    : `Analyze this skin condition: ${description}. Provide preliminary observations.`

  return generateGeminiContent(prompt)
}
