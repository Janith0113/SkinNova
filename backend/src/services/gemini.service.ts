import axios from 'axios'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables')
    }

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

    // Extract the text from the response
    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error('No content received from Gemini API')
    }

    return content
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}

// Example for analysis (skin condition analysis)
export async function analyzeSkinCondition(description: string, imageData?: string): Promise<string> {
  const prompt = imageData
    ? `Analyze this skin condition image and description: ${description}. Provide preliminary observations.`
    : `Analyze this skin condition: ${description}. Provide preliminary observations.`

  return generateGeminiContent(prompt)
}
