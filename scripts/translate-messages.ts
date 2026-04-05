import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const client = new Anthropic();
const TARGET_LOCALES = ['fr', 'ar', 'es'];

async function translateMessages(sourceMessages: object, targetLocale: string) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Translate this JSON from English to locale "${targetLocale}".
Return ONLY valid JSON with identical structure and keys — no explanation, no markdown.
Context: women's shelter wellness check-in app. Use warm, plain, accessible language.

${JSON.stringify(sourceMessages, null, 2)}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
}

async function main() {
  const source = JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'messages/en.json'), 'utf-8')
  );

  for (const locale of TARGET_LOCALES) {
    console.log(`Translating → ${locale}...`);
    const translated = await translateMessages(source, locale);
    await fs.writeFile(
      path.join(process.cwd(), `messages/${locale}.json`),
      JSON.stringify(translated, null, 2) + '\n'
    );
    console.log(`  ✓ messages/${locale}.json`);
  }
}

main().catch(console.error);