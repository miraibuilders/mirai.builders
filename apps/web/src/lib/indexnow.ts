import { siteOrigin } from "./site";

export type IndexNowResult = {
  skipped: boolean;
  status?: number;
  error?: string;
};

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (process.env.INDEXNOW_ENABLED !== "true") {
    console.log("indexnow: disabled");
    return { skipped: true };
  }

  const origin = siteOrigin();
  const key = process.env.INDEXNOW_KEY ?? "";
  const endpoint = process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";
  const body = {
    host: new URL(origin).host,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList: urls,
  };

  console.log(`indexnow: request ${JSON.stringify(body)}`);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log(`indexnow: response status=${response.status}`);
    return { skipped: false, status: response.status };
  } catch (error) {
    console.log(`indexnow: error ${String(error)}`);
    return { skipped: false, error: String(error) };
  }
}
