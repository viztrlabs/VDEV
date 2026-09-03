/**
 * ML Pipeline Service — Phase 3
 * Provides a lightweight model training/evaluation/deployment abstraction.
 * Uses in-memory simulation for development; designed to swap in real
 * TensorFlow.js or ONNX models in production.
 */
import { performanceMonitor } from '../performance';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type ModelType =
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'forecasting'
  | 'anomaly_detection';

export type ModelStatus = 'untrained' | 'training' | 'trained' | 'deployed' | 'archived';

export interface Hyperparameters {
  [key: string]: number | string | boolean;
}

export interface TrainingData {
  features: number[][];
  labels: number[] | string[];
  featureNames?: string[];
  labelNames?: string[];
}

export interface ModelConfig {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  framework: 'simulation' | 'scikit-learn' | 'tensorflow' | 'onnx' | 'pytorch';
  hyperparameters: Hyperparameters;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  status: ModelStatus;
}

export interface TrainingJob {
  id: string;
  modelId: string;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  epochs: number;
  batchSize: number;
  learningRate: number;
  dataSize: number;
  error?: string;
}

export interface ModelMetrics {
  modelId: string;
  version: string;
  timestamp: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss?: number;
  validationSplit: number;
  trainingTimeMs: number;
  datasetSize: number;
}

export interface DeploymentConfig {
  modelId: string;
  version: string;
  environment: 'staging' | 'production';
  deployedAt: string;
  deployedBy?: string;
  endpoint?: string;
  healthCheckUrl?: string;
}

// -----------------------------------------------------------------------
// In-memory state
// -----------------------------------------------------------------------

const models: Map<string, ModelConfig> = new Map();
const trainingJobs: Map<string, TrainingJob> = new Map();
const modelMetrics: Map<string, ModelMetrics[]> = new Map(); // modelId → metrics history
const deployments: Map<string, DeploymentConfig> = new Map(); // modelId → deployment

// Seed a demo classification model (churn predictor)
models.set('model-churn-preview', {
  id: 'model-churn-preview',
  name: 'Churn Prediction Model',
  type: 'classification',
  version: '1.2.0',
  framework: 'simulation',
  hyperparameters: {
    n_estimators: 150,
    max_depth: 12,
    min_samples_split: 10,
    random_state: 42,
    learning_rate: 0.01,
  },
  status: 'deployed',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  ownerId: 'team-ml',
});

modelMetrics.set('model-churn-preview', [
  {
    modelId: 'model-churn-preview',
    version: '1.2.0',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    accuracy: 0.876,
    precision: 0.852,
    recall: 0.821,
    f1Score: 0.836,
    loss: 0.321,
    validationSplit: 0.2,
    trainingTimeMs: 12500,
    datasetSize: 12480,
  },
]);

deployments.set('model-churn-preview', {
  modelId: 'model-churn-preview',
  version: '1.2.0',
  environment: 'production',
  deployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  deployedBy: 'ml-team',
  endpoint: '/api/ml/predict/churn',
  healthCheckUrl: '/api/ml/health',
});

// Seed a demo forecasting model (project timeline)
models.set('model-timeline-forecast', {
  id: 'model-timeline-forecast',
  name: 'Project Timeline Forecasting Model',
  type: 'forecasting',
  version: '2.0.1',
  framework: 'simulation',
  hyperparameters: {
    horizon_days: 30,
    seasonality: 'weekly',
    trend: 'linear',
    confidence_interval: 0.95,
  },
  status: 'deployed',
  createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  ownerId: 'team-ml',
});

modelMetrics.set('model-timeline-forecast', [
  {
    modelId: 'model-timeline-forecast',
    version: '2.0.1',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    accuracy: 0.91,
    precision: 0.89,
    recall: 0.92,
    f1Score: 0.905,
    loss: 0.18,
    validationSplit: 0.15,
    trainingTimeMs: 24800,
    datasetSize: 8750,
  },
]);

// -----------------------------------------------------------------------
// Pipeline Operations
// -----------------------------------------------------------------------

/**
 * Register a new model configuration.
 */
export function registerModel(config: Omit<ModelConfig, 'createdAt' | 'updatedAt' | 'status'>): ModelConfig {
  const now = new Date().toISOString();
  const model: ModelConfig = {
    ...config,
    createdAt: now,
    updatedAt: now,
    status: 'untrained',
  };
  models.set(model.id, model);
  return model;
}

/**
 * Start a training job for a model.
 */
export function trainModel(
  modelId: string,
  data: TrainingData,
  config: { epochs?: number; batchSize?: number; learningRate?: number; validationSplit?: number }
): TrainingJob {
  const model = models.get(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job: TrainingJob = {
    id: jobId,
    modelId,
    startedAt: new Date().toISOString(),
    status: 'running',
    epochs: config.epochs ?? model.hyperparameters.epochs as number ?? 10,
    batchSize: config.batchSize ?? model.hyperparameters.batch_size as number ?? 32,
    learningRate: config.learningRate ?? model.hyperparameters.learning_rate as number ?? 0.001,
    dataSize: data.features.length,
  };

  trainingJobs.set(jobId, job);

  // Simulate training asynchronously
  simulateTraining(job, model, data, config);

  return job;
}

/**
 * Simulated training — resolves after a randomized delay.
 */
async function simulateTraining(job: TrainingJob, model: ModelConfig, data: TrainingData, config: any): Promise<void> {
  // Simulate training time (100ms per 1000 samples, capped)
  const simTime = Math.min(5000, Math.max(500, Math.ceil(data.features.length / 1000) * 100));
  const startTime = Date.now();

  setTimeout(() => {
    const elapsed = Date.now() - startTime;
    const metrics: ModelMetrics = generateFakeMetrics(model, data, elapsed, config);
    const metricsHistory = modelMetrics.get(model.id) ?? [];
    metricsHistory.push(metrics);
    modelMetrics.set(model.id, metricsHistory);

    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    models.get(model.id)!.status = 'trained';
    models.get(model.id)!.updatedAt = new Date().toISOString();
  }, simTime);
}

/**
 * Generate simulated metrics for training output.
 */
function generateFakeMetrics(model: ModelConfig, data: TrainingData, trainingTimeMs: number, config: any): ModelMetrics {
  // Simulate slightly different results based on data size and model type
  const baseAccuracy = 0.75 + (Math.min(0.25, data.features.length / 10000));
  const noise = (Math.random() - 0.5) * 0.1;
  const accuracy = Math.min(0.99, Math.max(0.5, baseAccuracy + noise));

  return {
    modelId: model.id,
    version: model.version,
    timestamp: Date.now(),
    accuracy,
    precision: accuracy - 0.03 + Math.random() * 0.02,
    recall: accuracy - 0.05 + Math.random() * 0.03,
    f1Score: accuracy - 0.04,
    loss: 1 - accuracy,
    validationSplit: config.validationSplit ?? 0.2,
    trainingTimeMs,
    datasetSize: data.features.length,
  };
}

/**
 * Evaluate a deployed model against test data.
 */
export async function evaluateModel(modelId: string, testData: TrainingData): Promise<ModelMetrics> {
  const start = performance.now();
  const model = models.get(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  if (model.status !== 'trained' && model.status !== 'deployed') {
    throw new Error(`Model ${modelId} is not trained or deployed (status: ${model.status})`);
  }

  // Simulate evaluation
  const simTime = Math.min(2000, Math.max(100, Math.ceil(testData.features.length / 5000) * 200));
  await new Promise(r => setTimeout(r, simTime));

  const metrics = generateFakeMetrics(model, testData, simTime, { validationSplit: 0 });

  // Track performance telemetry
  const duration = performance.now() - start;
  performanceMonitor.track('custom', duration, {
    unit: 'ms',
    context: { event: 'ml_model_evaluate', model_id: modelId, dataset_size: testData.features.length },
  });

  return metrics;
}

/**
 * Deploy a model to a target environment.
 */
export async function deployModel(modelId: string, deployment: Omit<DeploymentConfig, 'modelId'>): Promise<DeploymentConfig> {
  const model = models.get(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }

  if (model.status !== 'trained') {
    throw new Error(`Model ${modelId} must be trained before deployment (status: ${model.status})`);
  }

  model.status = 'deployed';
  model.updatedAt = new Date().toISOString();

  const deploymentConfig: DeploymentConfig = {
    modelId,
    ...deployment,
  };

  deployments.set(modelId, deploymentConfig);

  performanceMonitor.track('custom', 0, {
    unit: 'count',
    context: { event: 'ml_model_deploy', model_id: modelId, environment: deployment.environment },
  });

  return deploymentConfig;
}

/**
 * Get model status and latest metrics.
 */
export function getModelInfo(modelId: string): { config: ModelConfig; latestMetrics?: ModelMetrics; deployment?: DeploymentConfig } {
  const config = models.get(modelId);
  if (!config) {
    throw new Error(`Model ${modelId} not found`);
  }

  const metricsHistory = modelMetrics.get(modelId);
  const latestMetrics = metricsHistory && metricsHistory.length > 0
    ? metricsHistory[metricsHistory.length - 1]
    : undefined;

  const deployment = deployments.get(modelId);

  return { config, latestMetrics, deployment };
}

/**
 * List all models (optionally filtered by status).
 */
export function listModels(status?: ModelStatus): ModelConfig[] {
  const all = Array.from(models.values());
  if (status) {
    return all.filter(m => m.status === status);
  }
  return all;
}

/**
 * Get training jobs (optionally filtered by status).
 */
export function getTrainingJobs(status?: 'pending' | 'running' | 'completed' | 'failed'): TrainingJob[] {
  const all = Array.from(trainingJobs.values());
  if (status) {
    return all.filter(j => j.status === status);
  }
  return all;
}

/**
 * Get model metric history.
 */
export function getModelMetricsHistory(modelId: string): ModelMetrics[] {
  return modelMetrics.get(modelId) ?? [];
}

// -----------------------------------------------------------------------
// Service Object
// -----------------------------------------------------------------------

export const mlPipeline = {
  registerModel,
  trainModel,
  evaluateModel,
  deployModel,
  getModelInfo,
  listModels,
  getTrainingJobs,
  getModelMetricsHistory,
};

export default mlPipeline;
