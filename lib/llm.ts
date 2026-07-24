import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { TAILOR_OUTPUT_SCHEMA } from "./prompts";

export interface TailorResult {
  tailoredResume: string;
  coverLetter: string;
}

async function tailorWithAnthropic(system: string, userPrompt: string): Promise<TailorResult> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system,
    output_config: {
      format: {
        type: "json_schema",
        schema: TAILOR_OUTPUT_SCHEMA,
      },
    },
    messages: [{ role: "user", content: userPrompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to process this request.");
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response received from the model.");
  }

  return JSON.parse(textBlock.text) as TailorResult;
}

async function tailorWithOpenAI(system: string, userPrompt: string): Promise<TailorResult> {
  const client = new OpenAI();

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tailor_output",
        schema: TAILOR_OUTPUT_SCHEMA,
        strict: true,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response received from the model.");
  }

  return JSON.parse(content) as TailorResult;
}

export async function tailorResume(system: string, userPrompt: string): Promise<TailorResult> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  if (provider === "openai") {
    return tailorWithOpenAI(system, userPrompt);
  }
  return tailorWithAnthropic(system, userPrompt);
}
