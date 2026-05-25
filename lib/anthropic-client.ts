import Constants from 'expo-constants';

// TODO: Em produção, trocar por chamada a backend proxy. NUNCA expor chave em app público.
const API_KEY = Constants.expoConfig?.extra?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? '';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-5';

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

export async function callAnthropicWithDocument(params: {
  base64Data: string;
  mediaType: string;
  prompt: string;
}): Promise<string> {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Veja .env e app.json extra.');
  }

  const isPdf = params.mediaType === 'application/pdf';

  const content: ContentBlock[] = [
    isPdf
      ? {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: params.base64Data,
          },
        }
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: params.mediaType,
            data: params.base64Data,
          },
        },
    { type: 'text', text: params.prompt },
  ];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  if (!textBlock) throw new Error('Resposta vazia da API Anthropic');
  return textBlock.text as string;
}
