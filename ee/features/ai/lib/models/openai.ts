import { OpenAI } from "openai";

/**
 * [self-host] Constructed lazily.
 *
 * The SDK throws "Missing credentials" from its constructor when no key is
 * configured. Building that at module scope meant `next build` blew up while
 * collecting page data for every route that transitively imports this — so the
 * whole app could not be built without an OpenAI key, even though the AI
 * features are optional and off by default.
 *
 * Deferring construction to first use keeps the same `openai.foo.bar()` call
 * shape while moving the failure to the point where AI is actually used.
 */
let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

export const openai = new Proxy({} as OpenAI, {
  get: (_target, prop) => {
    const instance = getClient();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
