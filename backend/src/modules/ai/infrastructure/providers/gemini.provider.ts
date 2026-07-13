import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../../../../config/env.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import type {
  AIProviderPort,
  CareerAnalysisPromptInput,
  ResumeJobAnalysisPromptInput,
  ResumeStructurePromptInput,
} from "../../domain/ports/ai-provider.port.js";
import { buildCareerAnalysisPrompt } from "../prompts/career-analysis.prompt-builder.js";
import { parseCareerAnalysisResponse } from "../prompts/career-analysis.response-parser.js";
import {
  buildResumeJobAnalysisPrompt,
  buildResumeStructurePrompt,
} from "../../../resume/infrastructure/prompts/resume.prompt-builder.js";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
export const FALLBACK_GEMINI_MODEL = "gemini-flash-latest";

export const resolveGeminiModel = (): string => env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

function resolveModelsToTry(preferredModel: string): string[] {
  return [...new Set([preferredModel, DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODEL])];
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

export class GeminiProvider implements AIProviderPort {
  readonly providerName = "gemini";

  async analyzeCareer(input: CareerAnalysisPromptInput) {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new AppError("AI provider is not configured", 503, "AI_NOT_CONFIGURED");
    }

    const modelsToTry = resolveModelsToTry(input.model);
    let lastError: unknown;

    for (const modelName of modelsToTry) {
      try {
        return await this.generateCareerWithModel(apiKey, modelName, input);
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && (error as AppError).code === "AI_PROVIDER_ERROR") {
          continue;
        }
        throw error;
      }
    }

    throw new AppError(
      `Failed to analyze career with AI provider: ${lastError instanceof Error ? lastError.message : "unknown"}`,
      502,
      "AI_PROVIDER_ERROR",
    );
  }

  async analyzeResumeStructure(input: ResumeStructurePromptInput) {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new AppError("AI provider is not configured", 503, "AI_NOT_CONFIGURED");
    }
    const prompt = buildResumeStructurePrompt(input.rawText);
    return this.generateJsonWithFallback(apiKey, input.model, prompt);
  }

  async analyzeResumeForJob(input: ResumeJobAnalysisPromptInput) {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new AppError("AI provider is not configured", 503, "AI_NOT_CONFIGURED");
    }
    const prompt = buildResumeJobAnalysisPrompt(input.snapshot);
    return this.generateJsonWithFallback(apiKey, input.model, prompt);
  }

  private async generateJsonWithFallback(apiKey: string, preferredModel: string, prompt: string) {
    const modelsToTry = resolveModelsToTry(preferredModel);
    let lastError: unknown;
    for (const modelName of modelsToTry) {
      try {
        return await this.generateJsonWithPrompt(apiKey, modelName, prompt);
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && (error as AppError).code === "AI_PROVIDER_ERROR") {
          continue;
        }
        throw error;
      }
    }
    throw new AppError(
      `Failed to analyze with AI provider: ${lastError instanceof Error ? lastError.message : "unknown"}`,
      502,
      "AI_PROVIDER_ERROR",
    );
  }

  private async generateCareerWithModel(apiKey: string, modelName: string, input: CareerAnalysisPromptInput) {
    const result = await this.generateJsonWithPrompt(
      apiKey,
      modelName,
      buildCareerAnalysisPrompt(input.snapshot),
    );
    const parsed = parseCareerAnalysisResponse(result.rawJson);
    return {
      ...parsed,
      missingSkills: input.snapshot.match.missingSkills,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
    };
  }

  private async generateJsonWithPrompt(apiKey: string, modelName: string, prompt: string) {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    });

    try {
      const result = await withTimeout(
        model.generateContent(prompt),
        env.GEMINI_TIMEOUT_MS,
      );
      const text = result.response.text();
      if (!text?.trim()) {
        throw new Error("Empty AI response");
      }

      const usage = result.response.usageMetadata;

      return {
        rawJson: text,
        promptTokens: usage?.promptTokenCount,
        completionTokens: usage?.candidatesTokenCount,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to analyze with AI provider: ${message}`, 502, "AI_PROVIDER_ERROR");
    }
  }
}

export const geminiProvider = new GeminiProvider();
