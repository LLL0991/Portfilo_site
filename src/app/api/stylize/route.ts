import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { STYLIZE_STYLES } from "@/lib/stylizeStyles";

export const runtime = "nodejs";
export const maxDuration = 120;

type OpenAIImageEditResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
  };
};

type OpenAIConfig = {
  headers: Record<string, string>;
  model: string;
  url: string;
};

type KieRecordData = {
  downloadUrl?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  failMsg?: string;
  fileUrl?: string;
  file_url?: string;
  progress?: string;
  response?:
    | {
        resultUrl?: string;
        result_url?: string;
        resultUrls?: string[];
        result_urls?: string[];
      }
    | string;
  resultUrl?: string;
  result_url?: string;
  resultUrls?: string[];
  result_urls?: string[];
  state?: string;
  status?: string;
  successFlag?: number;
  taskId?: string;
};

type KieResponse = {
  code?: number;
  data?: KieRecordData | string;
  msg?: string;
  message?: string;
  success?: boolean;
  taskId?: string;
};

const styleRoot = path.join(process.cwd(), "public", "images", "home", "stylize", "styles");

const isStylizeDebugEnabled = () => process.env.STYLIZE_DEBUG === "true";

const KIE_STYLE_GUARDS: Partial<Record<string, string>> = {
  IS064: [
    "STYLE-SPECIFIC LOCK FOR IS064:",
    "- The final image must feel like a soft hand-painted watercolor sticker on clean white paper.",
    "- Use airy pastel color, weak watercolor pigment, paper texture, loose uneven hand-drawn shapes, and very soft natural paint edges.",
    "- Do not make a 3D toy, 3D avatar, glossy render, clay render, semi-realistic child, cinematic portrait, anime model, or realistic illustration.",
    "- Do not use dark background, vignette, radial light, glow, bloom, lens blur, depth of field, dramatic lighting, hard shadow, glossy skin, or realistic hair texture.",
    "- If the target is a person, simplify them into a loose 1.5-2 head watercolor doodle character, not a polished Q-version 3D character.",
    "- Keep the entire canvas bright and clean with a pure white background.",
  ].join("\n"),
};

const buildKiePrompt = (stylePrompt: string, styleId: string) =>
  [
    "You will receive multiple input images in filesUrl.",
    "Image 1 is the STYLE REFERENCE ONLY. Use it only to learn the visual language, materials, color mood, edge treatment, and finish quality.",
    "Image 2 is the TARGET PHOTO. Transform only Image 2.",
    "Never copy objects, characters, text, layout, props, cups, decorations, or scene content from Image 1 into the result.",
    "Preserve the main subject, action, pose, direction, composition logic, and recognizable identity from Image 2.",
    "The output should be a newly redrawn stylized version of Image 2, not a collage and not a blend of both source images.",
    "Use a clean white background unless the style instructions explicitly require otherwise.",
    "",
    stylePrompt,
    "",
    KIE_STYLE_GUARDS[styleId] ?? "",
    "",
    "FINAL QUALITY CHECK:",
    "- No dark vignette, no glow, no blur effect, no photorealism, no 3D rendering, no cinematic lighting.",
    "- The result must look intentionally designed and visually close to Image 1's style while still depicting Image 2's subject.",
  ]
    .filter(Boolean)
    .join("\n");

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const cause = error.cause;

    if (cause instanceof Error && cause.message) {
      return `${error.message}: ${cause.message}`;
    }

    if (cause && typeof cause === "object") {
      const causeRecord = cause as { code?: unknown; message?: unknown };
      const causeMessage = [causeRecord.code, causeRecord.message].filter(Boolean).join(" / ");

      if (causeMessage) {
        return `${error.message}: ${causeMessage}`;
      }
    }

    return error.message;
  }

  return typeof error === "string" ? error : "Unexpected stylize error";
};

const readOpenAIImageEditResponse = async (response: Response): Promise<OpenAIImageEditResponse> => {
  const text = await response.text();

  if (!text) {
    return {
      error: {
        message: response.ok
          ? "Image edit returned an empty response"
          : `Image edit failed with HTTP ${response.status} and an empty response`,
      },
    };
  }

  try {
    return JSON.parse(text) as OpenAIImageEditResponse;
  } catch {
    return {
      error: {
        message: text.slice(0, 500),
      },
    };
  }
};

const readJsonPayload = async <T>(response: Response): Promise<T & { rawText?: string }> => {
  const text = await response.text();

  if (!text) {
    return { rawText: "" } as T & { rawText?: string };
  }

  try {
    return JSON.parse(text) as T & { rawText?: string };
  } catch {
    return { rawText: text } as T & { rawText?: string };
  }
};

const isRetryableStatus = (status: number) => [408, 429, 500, 502, 503, 504].includes(status);

const isRetryableError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("terminated") ||
    message.includes("timeout") ||
    message.includes("enotfound") ||
    message.includes("econnreset") ||
    message.includes("etimedout")
  );
};

const fetchWithRetry = async (url: string, init: RequestInit, attempts = 3) => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);

      if (attempt < attempts && isRetryableStatus(response.status)) {
        await wait(900 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt >= attempts || !isRetryableError(error)) {
        throw error;
      }

      await wait(900 * attempt);
    }
  }

  throw lastError;
};

const getKieError = (payload: KieResponse & { rawText?: string }, fallback: string) =>
  payload.message ??
  payload.msg ??
  (payload.data && typeof payload.data === "object" ? payload.data.failMsg : null) ??
  payload.rawText?.slice(0, 500) ??
  fallback;

const findUrlInValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    return /^https?:\/\//.test(value) ? value : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findUrlInValue(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const preferredKeys = [
    "downloadUrl",
    "download_url",
    "fileUrl",
    "file_url",
    "url",
    "imageUrl",
    "image_url",
    "sourceUrl",
    "source_url",
    "path",
  ];

  for (const key of preferredKeys) {
    const found = findUrlInValue(record[key]);

    if (found) {
      return found;
    }
  }

  for (const nested of Object.values(record)) {
    const found = findUrlInValue(nested);

    if (found) {
      return found;
    }
  }

  return null;
};

const describeKiePayloadShape = (payload: KieResponse & { rawText?: string }) => {
  if (!payload.data || typeof payload.data === "string") {
    return payload.rawText?.slice(0, 220) ?? `data:${typeof payload.data}`;
  }

  return `data keys: ${Object.keys(payload.data).join(", ") || "none"}`;
};

const extractKieFileUrl = (payload: KieResponse & { rawText?: string }) => {
  if (payload.data && typeof payload.data === "object") {
    return payload.data.fileUrl ?? payload.data.file_url ?? findUrlInValue(payload.data);
  }

  return findUrlInValue(payload.data) ?? findUrlInValue(payload);
};

const extractKieTaskId = (payload: KieResponse & { rawText?: string }) => {
  if (payload.taskId) {
    return payload.taskId;
  }

  if (typeof payload.data === "string") {
    return payload.data;
  }

  if (payload.data && typeof payload.data === "object") {
    return payload.data.taskId ?? null;
  }

  return null;
};

const extractKieResultUrl = (payload: KieResponse & { rawText?: string }) => {
  const data = payload.data;

  if (!data || typeof data === "string") {
    return null;
  }

  if (typeof data.response === "string") {
    try {
      const parsed = JSON.parse(data.response) as {
        resultUrl?: string;
        result_url?: string;
        resultUrls?: string[];
        result_urls?: string[];
      };

      return (
        data.resultUrls?.[0] ??
        data.result_urls?.[0] ??
        data.resultUrl ??
        data.result_url ??
        parsed.resultUrls?.[0] ??
        parsed.result_urls?.[0] ??
        parsed.resultUrl ??
        parsed.result_url ??
        null
      );
    } catch {
      return data.resultUrls?.[0] ?? data.result_urls?.[0] ?? data.resultUrl ?? data.result_url ?? null;
    }
  }

  return (
    data.resultUrls?.[0] ??
    data.result_urls?.[0] ??
    data.resultUrl ??
    data.result_url ??
    data.response?.resultUrls?.[0] ??
    data.response?.result_urls?.[0] ??
    data.response?.resultUrl ??
    data.response?.result_url ??
    null
  );
};

const getDirectKieDownloadUrl = async (taskId: string, url: string) => {
  const key = process.env.KIE_API_KEY;

  if (!key) {
    return url;
  }

  const apiBase = process.env.KIE_API_BASE ?? "https://api.kie.ai";
  const response = await fetchWithRetry(`${apiBase.replace(/\/$/, "")}/api/v1/gpt4o-image/download-url`, {
    body: JSON.stringify({ taskId, url }),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await readJsonPayload<KieResponse>(response);

  if (!response.ok || typeof payload.data !== "string") {
    return url;
  }

  return payload.data;
};

const sanitizeUploadPath = (fileName: string) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "image.png";

  return `stylize/${Date.now()}-${safeName}`;
};

const getStyleReference = (styleId: string) => {
  const jpgPath = path.join(styleRoot, styleId, "image.jpg");
  const pngPath = path.join(styleRoot, styleId, "image.png");

  if (existsSync(jpgPath)) {
    return {
      fileName: `${styleId}.jpg`,
      mimeType: "image/jpeg",
      path: jpgPath,
      publicPath: `/images/home/stylize/styles/${styleId}/image.jpg`,
    };
  }

  if (existsSync(pngPath)) {
    return {
      fileName: `${styleId}.png`,
      mimeType: "image/png",
      path: pngPath,
      publicPath: `/images/home/stylize/styles/${styleId}/image.png`,
    };
  }

  return null;
};

const getOpenAIConfig = (): OpenAIConfig | null => {
  const tuziKey = process.env.TUZI_API_KEY;
  const tuziBaseUrl = process.env.TUZI_API_BASE ?? "https://api.tu-zi.com/v1";
  const shouldUseTuzi = process.env.USE_TUZI?.toLowerCase() === "true" || Boolean(tuziKey);

  if (shouldUseTuzi && tuziKey) {
    return {
      headers: { Authorization: `Bearer ${tuziKey}` },
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      url: `${tuziBaseUrl.replace(/\/$/, "")}/images/edits`,
    };
  }

  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT ?? process.env.AZURE_API_BASE;
  const azureKey = process.env.AZURE_OPENAI_API_KEY ?? process.env.AZURE_API_KEY;
  const azureDeployment =
    process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

  if (azureEndpoint && azureKey) {
    return {
      headers: { "api-key": azureKey },
      model: azureDeployment,
      url: `${azureEndpoint.replace(/\/$/, "")}/openai/deployments/${azureDeployment}/images/edits?api-version=${
        process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview"
      }`,
    };
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  const openAIBaseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  if (!openAIKey) {
    return null;
  }

  return {
    headers: { Authorization: `Bearer ${openAIKey}` },
    model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
    url: `${openAIBaseUrl.replace(/\/$/, "")}/images/edits`,
  };
};

const uploadToKie = async (file: Blob, fileName: string) => {
  const key = process.env.KIE_API_KEY;

  if (!key) {
    throw new Error("Missing KIE_API_KEY");
  }

  const uploadBase = process.env.KIE_UPLOAD_BASE ?? "https://kieai.redpandaai.co";
  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("uploadPath", sanitizeUploadPath(fileName));
  formData.append("fileName", fileName);

  const response = await fetchWithRetry(`${uploadBase.replace(/\/$/, "")}/api/file-stream-upload`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${key}`,
    },
    method: "POST",
  });
  const payload = await readJsonPayload<KieResponse>(response);
  const url = extractKieFileUrl(payload);
  if (isStylizeDebugEnabled()) {
    console.info("[stylize:kie:upload]", {
      fileName,
      ok: response.ok,
      shape: describeKiePayloadShape(payload),
      urlFound: Boolean(url),
    });
  }

  if (!response.ok || payload.success === false || payload.code === 400 || !url) {
    throw new Error(
      `${getKieError(payload, `Kie file upload failed for ${fileName}`)} / No uploaded file URL found (${describeKiePayloadShape(
        payload,
      )})`,
    );
  }

  return url;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stylizeWithKie = async (inputImage: File, reference: ReturnType<typeof getStyleReference>, prompt: string, styleId: string) => {
  const key = process.env.KIE_API_KEY;

  if (!key) {
    throw new Error("Missing KIE_API_KEY");
  }

  const apiBase = process.env.KIE_API_BASE ?? "https://api.kie.ai";
  const filesUrl: string[] = [];

  if (reference) {
    const styleImageBytes = await readFile(reference.path);
    filesUrl.push(
      await uploadToKie(
        new Blob([new Uint8Array(styleImageBytes)], { type: reference.mimeType }),
        reference.fileName,
      ),
    );
  }

  filesUrl.push(await uploadToKie(inputImage, inputImage.name || "input.png"));

  const generateResponse = await fetchWithRetry(`${apiBase.replace(/\/$/, "")}/api/v1/gpt4o-image/generate`, {
    body: JSON.stringify({
      enableFallback: false,
      filesUrl,
      fallbackModel: "FLUX_MAX",
      isEnhance: process.env.KIE_IMAGE_ENHANCE === "true",
      prompt: buildKiePrompt(prompt, styleId),
      size: process.env.KIE_IMAGE_SIZE ?? "1:1",
      upload_method: process.env.KIE_UPLOAD_METHOD ?? "oss",
    }),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const generatePayload = await readJsonPayload<KieResponse>(generateResponse);
  const taskId = extractKieTaskId(generatePayload);
  if (isStylizeDebugEnabled()) {
    console.info("[stylize:kie:generate]", {
      ok: generateResponse.ok,
      shape: describeKiePayloadShape(generatePayload),
      taskIdFound: Boolean(taskId),
    });
  }

  if (!generateResponse.ok || !taskId) {
    throw new Error(getKieError(generatePayload, "Kie image generation did not return taskId"));
  }

  const startedAt = Date.now();
  const timeoutMs = Number(process.env.KIE_POLL_TIMEOUT_MS ?? 105000);
  let loggedRecordShape = false;

  while (Date.now() - startedAt < timeoutMs) {
    await wait(3000);

    const recordResponse = await fetchWithRetry(
      `${apiBase.replace(/\/$/, "")}/api/v1/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        method: "GET",
      },
    );
    const recordPayload = await readJsonPayload<KieResponse>(recordResponse);
    const resultUrl = extractKieResultUrl(recordPayload);

    if (resultUrl) {
      const directUrl = await getDirectKieDownloadUrl(taskId, resultUrl);

      return {
        image: directUrl,
        provider: "kie-gpt4o-image",
        styleId,
        taskId,
      };
    }

    if (!loggedRecordShape && isStylizeDebugEnabled()) {
      console.info("[stylize:kie:record]", {
        ok: recordResponse.ok,
        shape: describeKiePayloadShape(recordPayload),
        resultFound: false,
      });
      loggedRecordShape = true;
    }

    if (!recordResponse.ok) {
      if (isRetryableStatus(recordResponse.status)) {
        if (isStylizeDebugEnabled()) {
          console.info("[stylize:kie:record:retry]", {
            shape: describeKiePayloadShape(recordPayload),
            status: recordResponse.status,
          });
        }
        continue;
      }

      throw new Error(getKieError(recordPayload, "Kie record query failed"));
    }

    const data = recordPayload.data;
    const status = typeof data === "object" ? (data.status ?? data.state ?? data.progress) : null;
    const failed =
      typeof data === "object" &&
      (data.successFlag === 2 ||
        data.successFlag === 3 ||
        status === "CREATE_TASK_FAILED" ||
        status === "GENERATE_FAILED" ||
        status === "fail" ||
        status === "failed" ||
        status === "FAILED");

    if (failed) {
      const message =
        typeof data === "object" ? (data.errorMessage ?? data.failMsg ?? data.errorCode ?? null) : null;

      throw new Error(message ?? getKieError(recordPayload, "Kie image generation failed"));
    }
  }

  throw new Error(`Kie image generation timed out after ${Math.round(timeoutMs / 1000)}s`);
};

export async function GET() {
  return Response.json({
    styles: STYLIZE_STYLES.map((style) => {
      const reference = getStyleReference(style.id);

      return {
        ...style,
        reference: reference?.publicPath ?? null,
      };
    }),
  });
}

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const inputImage = incoming.get("image");
    const styleId = String(incoming.get("styleId") ?? "");
    const quality = String(incoming.get("quality") ?? "high");
    const style = STYLIZE_STYLES.find((item) => item.id === styleId);

    if (!(inputImage instanceof File) || !style) {
      return Response.json({ error: "Invalid image or styleId" }, { status: 400 });
    }

    const promptPath = path.join(styleRoot, style.id, "prompt.txt");
    const reference = getStyleReference(style.id);
    const prompt = await readFile(promptPath, "utf8");

    if (process.env.KIE_API_KEY) {
      return Response.json(await stylizeWithKie(inputImage, reference, prompt, style.id));
    }

    const config = getOpenAIConfig();

    if (!config) {
      return Response.json(
        {
          error:
            "Missing image API credentials. Set KIE_API_KEY, TUZI_API_KEY, OPENAI_API_KEY, or AZURE_OPENAI_API_KEY/AZURE_API_KEY.",
        },
        { status: 503 },
      );
    }

    const formData = new FormData();
    formData.append("model", config.model);
    if (reference) {
      const styleImageBytes = await readFile(reference.path);
      formData.append(
        "image",
        new Blob([new Uint8Array(styleImageBytes)], { type: reference.mimeType }),
        reference.fileName,
      );
    }
    formData.append("image", inputImage, inputImage.name || "input.png");
    formData.append("prompt", `${prompt}\n使用纯白色背景`);
    formData.append("quality", quality === "medium" ? "medium" : "high");
    formData.append("background", "opaque");

    const response = await fetch(config.url, {
      body: formData,
      headers: config.headers,
      method: "POST",
    });
    const result = await readOpenAIImageEditResponse(response);

    if (!response.ok) {
      return Response.json(
        {
          error: result.error?.message ?? "Image edit failed",
        },
        { status: response.status },
      );
    }

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      return Response.json(
        { error: result.error?.message ?? "Image edit did not return b64_json" },
        { status: 502 },
      );
    }

    return Response.json({
      image: `data:image/png;base64,${base64}`,
      provider: config.model,
      styleId: style.id,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
