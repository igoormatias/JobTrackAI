import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../../../../config/env.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import type { AIProviderPort, CareerAnalysisPromptInput } from "../../domain/ports/ai-provider.port.js";
import { buildCareerAnalysisPrompt } from "../prompts/career-analysis.prompt-builder.js";
import { parseCareerAnalysisResponse } from "../prompts/career-analysis.response-parser.js";

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
        return await this.generateWithModel(apiKey, modelName, input);
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

  private async generateWithModel(apiKey: string, modelName: string, input: CareerAnalysisPromptInput) {
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
        model.generateContent(buildCareerAnalysisPrompt(input.snapshot)),
        env.GEMINI_TIMEOUT_MS,
      );
      const text = result.response.text();
      if (!text?.trim()) {
        throw new Error("Empty AI response");
      }

      const parsed = parseCareerAnalysisResponse(text);
      const usage = result.response.usageMetadata;

      return {
        ...parsed,
        promptTokens: usage?.promptTokenCount,
        completionTokens: usage?.candidatesTokenCount,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to analyze career with AI provider: ${message}`, 502, "AI_PROVIDER_ERROR");
    }
  }
}

export const geminiProvider = new GeminiProvider();
