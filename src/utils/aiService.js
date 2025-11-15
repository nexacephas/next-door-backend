import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const createFallbackDraft = (title, keywords) => {
  const kw = Array.isArray(keywords) ? keywords.join(', ') : String(keywords || '');
  return `# ${title}\n\n` +
    `Keywords: ${kw}\n\n` +
    `Introduction:\nThis is a starter draft for "${title}". Use this as a scaffold and expand sections as needed.\n\n` +
    `Body:\n- Section 1: Introduce the topic and why it matters.\n- Section 2: Explain main ideas and include the keywords where natural.\n- Section 3: Provide examples, tips, and actionable steps.\n\n` +
    `Conclusion:\nSummarize the key takeaways and suggest next steps for the reader.`;
};

export const generateBlogDraft = async (title, keywords) => {
  // Enhanced prompt: instruct model to use Windows `cmd` syntax when showing commands
  const prompt = `Write a detailed blog post titled "${title}". Include these keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}.
When the content requires shell/command examples, use Windows cmd (cmd.exe) syntax. Provide a clear structure with an introduction, multiple body sections, and a short conclusion.`;

  const maxRetries = 2;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response?.choices?.[0]?.message?.content || response?.choices?.[0]?.text;
      if (content) return content;
      throw new Error('Empty response from OpenAI');
    } catch (err) {
      const isRateLimit = err?.code === 'insufficient_quota' || err?.status === 429 || err?.message?.toLowerCase?.().includes('quota') || err?.type === 'rate_limit_error' || err?.name === 'RateLimitError';
      attempt += 1;
      if (isRateLimit && attempt <= maxRetries) {
        const backoff = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
        console.warn(`OpenAI rate limit detected, retrying in ${backoff}ms (attempt ${attempt}/${maxRetries})`);
        await sleep(backoff);
        continue;
      }

      if (isRateLimit) {
        console.error('OpenAI quota exceeded or rate limited — returning fallback draft. Error:', err?.message || err);
        return createFallbackDraft(title, keywords);
      }

      throw err;
    }
  }

  return createFallbackDraft(title, keywords);
};
