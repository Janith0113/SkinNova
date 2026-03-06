import { Router, Request, Response } from 'express';

const router = Router();

// Feature weights for Tinea Doisha classification
const TINEA_DOISHA_FEATURE_WEIGHTS: Record<string, Record<string, number>> = {
  vata: {
    body_frame: 0.18,
    skin_type: 0.20,
    digestion: 0.14,
    change_handling: 0.15,
    sleep_pattern: 0.16,
    stress_response: 0.17,
  },
  pitta: {
    body_frame: 0.14,
    skin_type: 0.18,
    digestion: 0.18,
    change_handling: 0.20,
    sleep_pattern: 0.13,
    stress_response: 0.17,
  },
  kapha: {
    body_frame: 0.20,
    skin_type: 0.17,
    digestion: 0.16,
    change_handling: 0.13,
    sleep_pattern: 0.19,
    stress_response: 0.15,
  },
};

// Feature explanations for each doisha type
const FEATURE_EXPLANATIONS: Record<string, Record<string, Record<number, string>>> = {
  body_frame: {
    vata: {
      0: "Your thin, light frame is a classic Vata characteristic, indicating higher air element dominance.",
      1: "Your medium athletic frame suggests some Pitta influence on your Vata constitution.",
      2: "Your larger, sturdy frame indicates Kapha characteristics, which might moderate Vata tendencies.",
    },
    pitta: {
      0: "Your thin build suggests some Vata influence on your predominantly Pitta constitution.",
      1: "Your medium, athletic frame perfectly matches Pitta's strong metabolic nature.",
      2: "Your larger frame indicates Kapha influence, which can stabilize intense Pitta energy.",
    },
    kapha: {
      0: "Your thin frame suggests Vata influence, making your Kapha less heavy.",
      1: "Your medium frame shows Pitta influence on your stable Kapha foundation.",
      2: "Your larger, sturdy frame is quintessentially Kapha, reflecting earth element dominance.",
    },
  },
  skin_type: {
    vata: {
      0: "Dry, thin skin is the hallmark of Vata, caused by the dry quality of air and space elements.",
      1: "Warm, oily, sensitive skin suggests Pitta influence, which may complicate Vata dryness.",
      2: "Thick, oily, smooth skin indicates strong Kapha presence, opposing Vata's natural dryness.",
    },
    pitta: {
      0: "Dry skin suggests Vata influence, which may temper Pitta's intense fire qualities.",
      1: "Warm, oily, sensitive skin perfectly reflects Pitta's fiery, transformative nature.",
      2: "Thick, oily skin indicates Kapha balance, which can cool excessive Pitta heat.",
    },
    kapha: {
      0: "Dry skin suggests Vata influence, creating a lighter Kapha type.",
      1: "Warm, oily, sensitive skin shows Pitta influence, adding metabolism to Kapha stability.",
      2: "Thick, oily, smooth skin is characteristically Kapha, reflecting water and earth elements.",
    },
  },
  digestion: {
    vata: {
      0: "Irregular, variable digestion is typical of Vata's unpredictable air element.",
      1: "Strong, quick digestion suggests Pitta influence, which needs management in Vata types.",
      2: "Slow, heavy digestion indicates Kapha influence, providing stability to Vata.",
    },
    pitta: {
      0: "Irregular digestion suggests Vata interference with your normally strong Pitta digestion.",
      1: "Strong, quick digestion is Pitta's natural state, reflecting intense digestive fire.",
      2: "Slow, heavy digestion indicates Kapha influence, which can inhibit Pitta's metabolism.",
    },
    kapha: {
      0: "Irregular digestion suggests Vata influence, disturbing your natural Kapha steadiness.",
      1: "Strong, quick digestion shows Pitta influence, which can enhance Kapha's metabolism.",
      2: "Slow, heavy digestion is characteristic of Kapha, reflecting its dense earth-water nature.",
    },
  },
  change_handling: {
    vata: {
      0: "Adaptability with anxiety is purely Vata - the natural response to air element changeability.",
      1: "Focused, driven response indicates Pitta influence, adding determination to your Vata adaptability.",
      2: "Resistance to change is Kapha-like, which stabilizes typical Vata restlessness.",
    },
    pitta: {
      0: "Anxious adaptability suggests Vata interference with your naturally focused Pitta nature.",
      1: "Focused, driven approach is quintessentially Pitta, reflecting your strategic fire element nature.",
      2: "Resistance to change indicates Kapha influence, which can slow your Pitta momentum.",
    },
    kapha: {
      0: "Anxious adaptability suggests Vata influence, disturbing your natural Kapha stability.",
      1: "Driven focus shows Pitta influence, adding ambition to stable Kapha nature.",
      2: "Resistance to change is characteristic Kapha - the steady, grounded response.",
    },
  },
  sleep_pattern: {
    vata: {
      0: "Light, variable sleep is Vata's natural pattern, reflecting air element sensitivity.",
      1: "Moderate sleep with easy waking shows Pitta influence, reducing Vata's sleep disruption.",
      2: "Deep, heavy sleep indicates strong Kapha influence, grounding your nervous Vata system.",
    },
    pitta: {
      0: "Variable sleep suggests Vata interference, disturbing your normally moderate Pitta sleep.",
      1: "Moderate sleep with easy waking is typical Pitta - alert and responsive.",
      2: "Deep, heavy sleep shows Kapha influence, which may dull your natural Pitta alertness.",
    },
    kapha: {
      0: "Light, variable sleep suggests Vata influence, creating insomnia in your naturally deep-sleeping Kapha.",
      1: "Moderate sleep with easy waking shows Pitta influence, reducing your natural Kapha heaviness.",
      2: "Deep, heavy sleep is quintessentially Kapha - the grounded earth element sleep pattern.",
    },
  },
  stress_response: {
    vata: {
      0: "Worry and anxiety are Vata's stress manifestations, the natural wind-like flight response.",
      1: "Irritability indicates Pitta influence, adding fire to your Vata anxiety.",
      2: "Withdrawal is Kapha-like, grounding your typical Vata nervous response to stress.",
    },
    pitta: {
      0: "Worrying anxiety suggests Vata influence, complicating your normally direct Pitta response.",
      1: "Irritability is Pitta's typical stress response - sharp, focused, sometimes aggressive.",
      2: "Withdrawal indicates Kapha influence, which may slow your natural Pitta intensity during stress.",
    },
    kapha: {
      0: "Anxiety suggests Vata influence, affecting your naturally calm Kapha response to stress.",
      1: "Irritability shows Pitta influence, adding intensity to stable Kapha nature.",
      2: "Withdrawal is characteristic Kapha stress response - introspective and grounded.",
    },
  },
};

const FEATURE_NAMES = [
  'body_frame',
  'skin_type',
  'digestion',
  'change_handling',
  'sleep_pattern',
  'stress_response',
];

/**
 * Compute Tinea Doisha GradCAM
 * POST /api/tinea-xai/compute-cnn-gradcam
 */
router.post('/compute-cnn-gradcam', (req: Request, res: Response) => {
  try {
    const { quizAnswers, predictedDoisha } = req.body;

    if (!quizAnswers || !predictedDoisha) {
      return res.status(400).json({
        error: 'Missing required fields: quizAnswers and predictedDoisha',
      });
    }

    if (!Array.isArray(quizAnswers) || quizAnswers.length !== 6) {
      return res.status(400).json({
        error: 'quizAnswers must be an array of 6 values (0, 1, or 2)',
      });
    }

    if (!['vata', 'pitta', 'kapha'].includes(predictedDoisha)) {
      return res.status(400).json({
        error: 'predictedDoisha must be one of: vata, pitta, kapha',
      });
    }

    const weights = TINEA_DOISHA_FEATURE_WEIGHTS[predictedDoisha];
    const gradcamResults = [];
    let totalScore = 0;

    // Compute GradCAM for each feature
    for (let i = 0; i < 6; i++) {
      const answerValue = quizAnswers[i];
      const featureName = FEATURE_NAMES[i];
      const baseWeight = weights[featureName] || 0.16;

      // Calculate importance
      const answerContribution = (answerValue / 2.0) * baseWeight;
      const alignmentScore = answerValue === DOISHA_TO_INDEX[predictedDoisha] ? 1.0 : 0.4;

      const featureImportance = {
        base_weight: baseWeight * 100,
        answer_contribution: answerContribution * 100,
        alignment_score: alignmentScore * 100,
        normalized_importance: answerContribution * alignmentScore * 100,
      };

      // GradCAM score (0-100)
      const gradcamScore = Math.min(100, Math.max(0, featureImportance.normalized_importance * 1.2));

      // Get explanation
      const explanation =
        FEATURE_EXPLANATIONS[featureName]?.[predictedDoisha]?.[answerValue] ||
        `This ${featureName} response contributes to your ${predictedDoisha} classification.`;

      gradcamResults.push({
        feature_index: i,
        feature_name: featureName,
        answer_value: answerValue,
        gradcam_score: gradcamScore,
        feature_importance: featureImportance,
        alignment_score: alignmentScore,
        explanation: explanation,
        heatmap_value: Math.min(1.0, gradcamScore / 100.0),
      });

      totalScore += gradcamScore;
    }

    // Calculate overall metrics
    const overallImportance = totalScore / 6;
    const topFeatures = [...gradcamResults]
      .sort((a, b) => b.gradcam_score - a.gradcam_score)
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        doisha_type: predictedDoisha,
        overall_importance: overallImportance,
        gradcam_data: gradcamResults,
        heatmap_values: gradcamResults.map((r) => r.heatmap_value),
        region_importance: gradcamResults.reduce(
          (acc, r, i) => {
            acc[`answer_${i}`] = r.heatmap_value;
            return acc;
          },
          {} as Record<string, number>
        ),
        top_features: topFeatures,
        visualization_ready: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Tinea Doisha GradCAM computation error:', error);
    res.status(500).json({
      error: 'Failed to compute Tinea Doisha GradCAM',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get feature explanation with GradCAM insight
 * GET /api/tinea-xai/feature-explanation/:featureIndex/:doisha/:answerValue
 */
router.get('/feature-explanation/:featureIndex/:doisha/:answerValue', (req: Request, res: Response) => {
  try {
    const { featureIndex, doisha, answerValue } = req.params;
    const featIdx = parseInt(featureIndex);
    const ansVal = parseInt(answerValue);

    if (isNaN(featIdx) || isNaN(ansVal) || !['vata', 'pitta', 'kapha'].includes(doisha)) {
      return res.status(400).json({
        error: 'Invalid parameters',
      });
    }

    if (featIdx < 0 || featIdx > 5) {
      return res.status(400).json({
        error: 'featureIndex must be between 0 and 5',
      });
    }

    if (ansVal < 0 || ansVal > 2) {
      return res.status(400).json({
        error: 'answerValue must be 0, 1, or 2',
      });
    }

    const featureName = FEATURE_NAMES[featIdx];
    const weights = TINEA_DOISHA_FEATURE_WEIGHTS[doisha];
    const weight = weights[featureName] || 0.16;

    const explanation =
      FEATURE_EXPLANATIONS[featureName]?.[doisha as 'vata' | 'pitta' | 'kapha']?.[ansVal] ||
      `This ${featureName} response contributes to your ${doisha} classification.`;

    res.json({
      success: true,
      data: {
        feature_index: featIdx,
        feature_name: featureName,
        doisha: doisha,
        answer_value: ansVal,
        weight: weight * 100,
        explanation: explanation,
        gradcam_ready: true,
      },
    });
  } catch (error) {
    console.error('Feature explanation error:', error);
    res.status(500).json({
      error: 'Failed to get feature explanation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get all top features by importance
 * POST /api/tinea-xai/top-features
 */
router.post('/top-features', (req: Request, res: Response) => {
  try {
    const { quizAnswers, predictedDoisha, topN = 3 } = req.body;

    if (!quizAnswers || !predictedDoisha) {
      return res.status(400).json({
        error: 'Missing required fields: quizAnswers and predictedDoisha',
      });
    }

    const weights = TINEA_DOISHA_FEATURE_WEIGHTS[predictedDoisha];
    const featureScores = [];

    // Calculate importance for each feature
    for (let i = 0; i < 6; i++) {
      const answerValue = quizAnswers[i];
      const featureName = FEATURE_NAMES[i];
      const baseWeight = weights[featureName] || 0.16;
      const alignmentScore = answerValue === DOISHA_TO_INDEX[predictedDoisha] ? 1.0 : 0.4;

      const score = baseWeight * 100 * alignmentScore;

      featureScores.push({
        feature_name: featureName,
        score: score,
        answer_value: answerValue,
        importance_percent: Math.min(100, score * 1.2),
      });
    }

    // Sort and get top N
    const topFeatures = featureScores
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    res.json({
      success: true,
      data: {
        doisha_type: predictedDoisha,
        top_features: topFeatures,
        total_features: featureScores.length,
      },
    });
  } catch (error) {
    console.error('Top features computation error:', error);
    res.status(500).json({
      error: 'Failed to compute top features',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper mapping
const DOISHA_TO_INDEX: Record<string, number> = {
  vata: 0,
  pitta: 1,
  kapha: 2,
};

export default router;
