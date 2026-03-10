import * as tmImage from '@teachablemachine/image';
import * as tf from '@tensorflow/tfjs';

interface PredictionResult {
  label: string;
  probability: number;
}

interface ModelLoadResult {
  model: tmImage.CustomMobileNet;
  maxLabelLength: number;
}

// URLs for your model - replace with actual paths
const MODEL_URL = '/model/model.json';
const METADATA_URL = '/model/metadata.json';

let cachedModel: tmImage.CustomMobileNet | null = null;

export async function loadModel(): Promise<ModelLoadResult> {
  if (cachedModel) {
    return {
      model: cachedModel,
      maxLabelLength: 0,
    };
  }

  try {
    // Load the model and metadata
    const modelURL = MODEL_URL;
    const metadataURL = METADATA_URL;

    const model = await tmImage.load(modelURL, metadataURL);
    cachedModel = model;

    return {
      model,
      maxLabelLength: model.getTotalClasses(),
    };
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load the model. Make sure model files are in the /public/model directory.');
  }
}

export async function predict(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<PredictionResult[]> {
  if (!cachedModel) {
    const { model } = await loadModel();
    cachedModel = model;
  }

  try {
    // Make predictions
    const predictions = await cachedModel.predict(imageElement);

    // Convert predictions to array and sort by probability
    const results: PredictionResult[] = Array.from(predictions)
      .map((pred: any, index: number) => ({
        label: cachedModel!.getClassLabels()[index],
        probability: pred.probability,
      }))
      .sort((a, b) => b.probability - a.probability);

    return results;
  } catch (error) {
    console.error('Error making prediction:', error);
    throw new Error('Failed to make prediction');
  }
}

export async function cleanupModel(): Promise<void> {
  if (cachedModel) {
    cachedModel.dispose();
    cachedModel = null;
    tf.disposeVariables();
  }
}
