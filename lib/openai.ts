import OpenAI from "openai";

/**
 * [self-host] Constructed lazily — see ee/features/ai/lib/models/openai.ts.
 *
 * The SDK rejects an empty-string key from its constructor, so building this at
 * module scope makes `next build` fail for any route that imports it when no
 * OPENAI_API_KEY is set.
 */
let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

// Create an OpenAI API client (that's edge friendly!)
export const openai = new Proxy({} as OpenAI, {
  get: (_target, prop) => {
    const instance = getClient();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
