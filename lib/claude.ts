import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ViolationInput {
  index: number
  wcag_criterion_title: string
  description: string
  suggested_fix: string
  html_snippet: string
}

export interface FixResult {
  fix: string
  plainDesc: string
}

export async function generateCodeFixes(violations: ViolationInput[]): Promise<FixResult[]> {
  if (violations.length === 0) return []

  const empty = (): FixResult => ({ fix: '', plainDesc: '' })

  const violationList = violations
    .map(
      v => `### ${v.index + 1}. ${v.wcag_criterion_title}
Issue: ${v.description}
Fix guidance: ${v.suggested_fix}
Failing HTML:
\`\`\`html
${v.html_snippet}
\`\`\``
    )
    .join('\n\n')

  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 6000,
    thinking: { type: 'adaptive' },
    system: `You are an accessibility engineer. For each violation return two things:
1. "fix" — the corrected HTML snippet
2. "plainDesc" — one sentence (max 18 words) in plain English: what a real user experiences because of this issue. No jargon. No "this element" or "this violation". Write from the user's perspective.

Good example: "Screen readers can't tell blind users what this button does."
Bad example: "The button element is missing an accessible name attribute."

Respond ONLY with a valid JSON array. Each element must have "fix" and "plainDesc" keys.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: violationList,
            cache_control: { type: 'ephemeral' },
          },
        ],
      },
    ],
  })

  const response = await stream.finalMessage()
  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return violations.map(empty)

  try {
    const raw = textBlock.text.trim()
    // Strip markdown code fences if present
    const jsonStr = raw.startsWith('[') ? raw : raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '')
    const results = JSON.parse(jsonStr)
    if (Array.isArray(results)) {
      return violations.map((_, i) => ({
        fix: results[i]?.fix || '',
        plainDesc: results[i]?.plainDesc || '',
      }))
    }
  } catch {
    // Parse failed — return empty rather than crash
  }

  return violations.map(empty)
}
