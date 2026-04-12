import type { ParsedTemplate, SlotDefinition } from '@/types/prompt';

// 이중 중괄호 {{이름}} 으로 플레이스홀더 구분 (일반 {중괄호}와 구별)
const SLOT_REGEX = /\{\{([a-zA-Z_\uAC00-\uD7A3][a-zA-Z0-9_\uAC00-\uD7A3]*)\}\}/g;

export function parsePlaceholders(template: string): string[] {
  const names: string[] = [];
  let match;
  const regex = new RegExp(SLOT_REGEX.source, SLOT_REGEX.flags);
  while ((match = regex.exec(template)) !== null) {
    if (!names.includes(match[1])) {
      names.push(match[1]);
    }
  }
  return names;
}

export function parseTemplate(template: string): ParsedTemplate {
  const slots: SlotDefinition[] = [];
  const segments: string[] = [];
  const seenNames = new Set<string>();

  let lastIndex = 0;
  let match;
  const regex = new RegExp(SLOT_REGEX.source, SLOT_REGEX.flags);

  while ((match = regex.exec(template)) !== null) {
    const name = match[1];
    segments.push(template.slice(lastIndex, match.index));

    if (!seenNames.has(name)) {
      slots.push({
        name,
        position: { start: match.index, end: match.index + match[0].length },
        options: [],
      });
      seenNames.add(name);
    }

    lastIndex = match.index + match[0].length;
  }

  segments.push(template.slice(lastIndex));

  return { raw: template, slots, segments };
}
