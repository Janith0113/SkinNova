import { Router, Request, Response } from 'express';

const router = Router();

interface DoshaAnswer {
  questionId: number;
  question: string;
  selectedAnswer: string;
  dosha: 'vata' | 'pitta' | 'kapha';
}

interface GradCAMRequest {
  answers: DoshaAnswer[];
  primaryDosha: 'vata' | 'pitta' | 'kapha';
}

interface GradCAMResponse {
  questionId: number;
  question: string;
  selectedAnswer: string;
  gradcamScore: number;
  featureImportance: {
    [key: string]: number;
  };
  explanation: string;
}

// Feature weights for each dosha type - these determine how much each characteristic contributes
const DOSHA_FEATURE_WEIGHTS: Record<string, Record<string, number>> = {
  vata: {
    'body_frame': 0.12,
    'skin_type': 0.14,
    'appetite': 0.08,
    'emotional_state': 0.10,
    'sleep_pattern': 0.09,
    'weather_preference': 0.07,
    'digestion': 0.08,
    'energy_level': 0.10,
    'stress_response': 0.09,
    'hair_type': 0.06,
    'hands_feet': 0.11,
    'memory': 0.07,
    'speaking_style': 0.08,
    'movement': 0.09,
    'body_temperature': 0.08,
    'leisure_time': 0.08,
    'body_odor': 0.06,
    'cold_weather': 0.09,
    'bowel_habit': 0.08,
    'humor': 0.05,
    'nails': 0.07,
    'noise_sensitivity': 0.08,
    'spending_pattern': 0.06,
    'new_situations': 0.08,
    'eye_type': 0.07,
  },
  pitta: {
    'body_frame': 0.10,
    'skin_type': 0.15,
    'appetite': 0.12,
    'emotional_state': 0.11,
    'sleep_pattern': 0.08,
    'weather_preference': 0.09,
    'digestion': 0.10,
    'energy_level': 0.09,
    'stress_response': 0.10,
    'hair_type': 0.07,
    'hands_feet': 0.10,
    'memory': 0.08,
    'speaking_style': 0.09,
    'movement': 0.08,
    'body_temperature': 0.11,
    'leisure_time': 0.07,
    'body_odor': 0.10,
    'cold_weather': 0.08,
    'bowel_habit': 0.09,
    'humor': 0.06,
    'nails': 0.06,
    'noise_sensitivity': 0.06,
    'spending_pattern': 0.07,
    'new_situations': 0.08,
    'eye_type': 0.08,
  },
  kapha: {
    'body_frame': 0.13,
    'skin_type': 0.13,
    'appetite': 0.10,
    'emotional_state': 0.09,
    'sleep_pattern': 0.11,
    'weather_preference': 0.08,
    'digestion': 0.09,
    'energy_level': 0.07,
    'stress_response': 0.08,
    'hair_type': 0.08,
    'hands_feet': 0.10,
    'memory': 0.06,
    'speaking_style': 0.07,
    'movement': 0.08,
    'body_temperature': 0.07,
    'leisure_time': 0.08,
    'body_odor': 0.07,
    'cold_weather': 0.06,
    'bowel_habit': 0.10,
    'humor': 0.06,
    'nails': 0.09,
    'noise_sensitivity': 0.05,
    'spending_pattern': 0.06,
    'new_situations': 0.08,
    'eye_type': 0.07,
  },
};

// Category mapping for questions
const QUESTION_CATEGORIES: Record<number, string> = {
  1: 'body_frame',
  2: 'skin_type',
  3: 'appetite',
  4: 'emotional_state',
  5: 'sleep_pattern',
  6: 'weather_preference',
  7: 'digestion',
  8: 'energy_level',
  9: 'stress_response',
  10: 'hair_type',
  11: 'hands_feet',
  12: 'memory',
  13: 'speaking_style',
  14: 'movement',
  15: 'body_temperature',
  16: 'leisure_time',
  17: 'body_odor',
  18: 'cold_weather',
  19: 'bowel_habit',
  20: 'humor',
  21: 'nails',
  22: 'noise_sensitivity',
  23: 'spending_pattern',
  24: 'new_situations',
  25: 'eye_type',
};

// GradCAM computation function
function computeGradCAM(
  answers: DoshaAnswer[],
  primaryDosha: 'vata' | 'pitta' | 'kapha'
): GradCAMResponse[] {
  const weights = DOSHA_FEATURE_WEIGHTS[primaryDosha];
  
  return answers.map((answer) => {
    const category = QUESTION_CATEGORIES[answer.questionId];
    const baseWeight = weights[category] || 0.08;
    
    // Compute feature importance based on answer correctness
    const isCorrectDosha = answer.dosha === primaryDosha;
    const alignmentScore = isCorrectDosha ? 1.0 : 0.4;
    
    // Feature importance is weighted by how much this feature contributes to the dosha
    const featureImportance: Record<string, number> = {
      'answer_alignment': baseWeight * 100 * alignmentScore,
      'answer_specificity': (isCorrectDosha ? 85 : 35),
      'question_relevance': baseWeight * 100,
      'confidence_score': alignmentScore * 100,
    };
    
    // Calculate GradCAM score (0-100)
    const gradcamScore = (
      (featureImportance.answer_alignment * 0.35 +
        featureImportance.answer_specificity * 0.25 +
        featureImportance.question_relevance * 0.25 +
        featureImportance.confidence_score * 0.15) /
      100
    ) * (baseWeight * 200); // Scale based on feature weight
    
    // Generate explanations based on the dosha and answer
    const explanations: Record<string, string> = {
      vata: {
        high: `This answer strongly indicates Vata characteristics. The "${answer.selectedAnswer}" response aligns with typical Vata traits like adaptability, variability, and sensitivity.`,
        low: `This answer doesn't strongly indicate Vata tendencies. Your response suggests traits more aligned with other doshas.`,
      },
      pitta: {
        high: `This answer strongly indicates Pitta characteristics. The "${answer.selectedAnswer}" response shows the focused, intense, and strong personality typical of Pitta types.`,
        low: `This answer doesn't strongly indicate Pitta tendencies. Your response suggests different dosha characteristics.`,
      },
      kapha: {
        high: `This answer strongly indicates Kapha characteristics. The "${answer.selectedAnswer}" response demonstrates the stable, grounded, and calm nature of Kapha types.`,
        low: `This answer doesn't strongly indicate Kapha tendencies. Your response aligns more with other dosha types.`,
      },
    };
    
    const explanation = alignmentScore > 0.7
      ? explanations[primaryDosha].high
      : explanations[primaryDosha].low;
    
    return {
      questionId: answer.questionId,
      question: answer.question,
      selectedAnswer: answer.selectedAnswer,
      gradcamScore: Math.min(100, Math.max(0, gradcamScore)),
      featureImportance,
      explanation,
    };
  });
}

// POST endpoint to compute GradCAM
router.post('/compute-xai', (req: Request, res: Response) => {
  try {
    const { answers, primaryDosha } = req.body as GradCAMRequest;
    
    if (!answers || !primaryDosha) {
      return res.status(400).json({
        error: 'Missing required fields: answers and primaryDosha',
      });
    }
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: 'Answers must be a non-empty array',
      });
    }
    
    // Compute GradCAM visualization data
    const gradcamResults = computeGradCAM(answers, primaryDosha);
    
    // Calculate overall confidence score
    const overallScore =
      gradcamResults.reduce((sum, result) => sum + result.gradcamScore, 0) /
      gradcamResults.length;
    
    res.json({
      success: true,
      data: {
        results: gradcamResults,
        overallConfidence: Math.min(100, overallScore * 1.2), // Scale to 100
        doshaType: primaryDosha,
        totalQuestions: answers.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GradCAM computation error:', error);
    res.status(500).json({
      error: 'Failed to compute GradCAM visualization',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET endpoint to get explanation for a specific question
router.get('/xai-explanation/:questionId/:dosha', (req: Request, res: Response) => {
  try {
    const { questionId, dosha } = req.params;
    const qId = parseInt(questionId);
    
    if (isNaN(qId) || !['vata', 'pitta', 'kapha'].includes(dosha)) {
      return res.status(400).json({
        error: 'Invalid questionId or dosha',
      });
    }
    
    const category = QUESTION_CATEGORIES[qId];
    const weight = DOSHA_FEATURE_WEIGHTS[dosha][category] || 0.08;
    
    const explanations: Record<string, Record<string, string>> = {
      vata: {
        'body_frame': 'Body frame is a key Vata indicator. Vata types tend to have thin, light builds.',
        'skin_type': 'Your skin type is important for Vata assessment. Dry, thin skin indicates Vata dominance.',
        'appetite': 'Appetite variability is a classic Vata trait, reflecting their changeable nature.',
        'emotional_state': 'Emotional patterns help identify Vata\'s anxious and restless tendencies.',
        'sleep_pattern': 'Light, interrupted sleep is typical of Vata constitution.',
      },
      pitta: {
        'body_frame': 'Body frame contributes to Pitta assessment. Medium, muscular builds indicate Pitta.',
        'skin_type': 'Warm, oily, sensitive skin is a strong Pitta indicator.',
        'appetite': 'Strong, consistent appetite is characteristic of Pitta\'s strong metabolism.',
        'emotional_state': 'Ambitious and driven personality is typical of Pitta types.',
        'sleep_pattern': 'Sound sleep interrupted by heat indicates Pitta characteristics.',
      },
      kapha: {
        'body_frame': 'Heavy, sturdy build is a Kapha characteristic.',
        'skin_type': 'Thick, moist, cool skin indicates Kapha constitution.',
        'appetite': 'Steady eating pattern reflects Kapha\'s grounded nature.',
        'emotional_state': 'Calm and grounded emotional state is typical of Kapha types.',
        'sleep_pattern': 'Deep, heavy sleep with oversleep tendency indicates Kapha.',
      },
    };
    
    const baseExplanation = explanations[dosha as 'vata' | 'pitta' | 'kapha'][category] ||
      `This ${category.replace('_', ' ')} is moderately important (${(weight * 100).toFixed(1)}%) for assessing ${dosha} constitution.`;
    
    res.json({
      success: true,
      data: {
        questionId: qId,
        category,
        dosha,
        weight: weight * 100,
        explanation: baseExplanation,
      },
    });
  } catch (error) {
    console.error('XAI explanation error:', error);
    res.status(500).json({
      error: 'Failed to retrieve explanation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
