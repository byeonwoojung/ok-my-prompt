import type { SlotDefinition, Permutation, PermutationStats } from '@/types/prompt';
import { PERMUTATION_WARNING_THRESHOLD, PERMUTATION_CAP } from '@/lib/constants';
import { parsePlaceholders } from './parser';

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** Heap's algorithm - 배열의 모든 순열 생성 */
function* heapPermutations<T>(arr: T[]): Generator<T[]> {
  const a = [...arr];
  const n = a.length;
  const c = new Array(n).fill(0);

  yield [...a];

  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) [a[0], a[i]] = [a[i], a[0]];
      else [a[c[i]], a[i]] = [a[i], a[c[i]]];
      yield [...a];
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

/** 데카르트 곱 Generator */
function* cartesianProduct<T>(arrays: T[][]): Generator<T[]> {
  if (arrays.length === 0) {
    yield [];
    return;
  }
  const [first, ...rest] = arrays;
  for (const item of first) {
    for (const combo of cartesianProduct(rest)) {
      yield [item, ...combo];
    }
  }
}

export function computeStats(
  slots: SlotDefinition[],
  shuffleOrder: boolean
): PermutationStats {
  const n = slots.length;
  const totalPositionOrders = shuffleOrder && n > 1 ? factorial(n) : 1;
  const totalValueCombinations = slots.length === 0
    ? 0
    : slots.reduce((acc, s) => acc * Math.max(s.options.length, 1), 1);
  const totalPermutations = totalPositionOrders * totalValueCombinations;

  return {
    totalPositionOrders,
    totalValueCombinations,
    totalPermutations,
    exceedsWarningThreshold: totalPermutations > PERMUTATION_WARNING_THRESHOLD,
    exceedsCap: totalPermutations > PERMUTATION_CAP,
  };
}

/**
 * 모든 순열을 생성한다.
 *
 * - 전달받는 slots는 이미 유효한 옵션만 필터링된 상태여야 함
 * - 템플릿의 모든 {{$이름}} 중 slots에 없는 것은 그대로 남김
 * - shuffleOrder: slots의 위치를 서로 교환하는 순열도 생성
 */
export function generatePermutations(
  template: string,
  slots: SlotDefinition[],
  shuffleOrder: boolean = false
): Permutation[] {
  const results: Permutation[] = [];

  if (slots.length === 0) {
    return [{
      id: 'perm-0',
      index: 0,
      ordering: [],
      assignment: {},
      resolvedPrompt: template,
    }];
  }

  const slotNames = slots.map(s => s.name);

  // 위치 순열: slotNames의 순서를 섞음
  const orderings = shuffleOrder && slotNames.length > 1
    ? [...heapPermutations(slotNames)]
    : [slotNames];

  // 템플릿에서 슬롯 위치를 순서대로 찾기
  const allTemplateSlots = parsePlaceholders(template);
  // 우리가 다루는 슬롯 이름만 필터 (slots에 있는 것만)
  const targetSlotPositions = allTemplateSlots.filter(n => slotNames.includes(n));

  let index = 0;

  for (const ordering of orderings) {
    // ordering[i] = i번째 슬롯 위치에 값을 제공할 플레이스홀더 이름
    const optionArrays = ordering.map(
      name => slots.find(s => s.name === name)!.options
    );

    for (const combo of cartesianProduct(optionArrays)) {
      const assignment: Record<string, string> = {};
      ordering.forEach((name, i) => {
        assignment[name] = combo[i];
      });

      // 치환: 템플릿의 {{$이름}} 을 순서에 맞게 치환
      let resolved = template;
      // targetSlotPositions 순서대로 하나씩 치환 (같은 이름이 여러번 나올 수 있음)
      targetSlotPositions.forEach((originalName, posIndex) => {
        const valueProviderName = ordering[posIndex];
        const value = assignment[valueProviderName];
        // 첫 번째 매칭만 치환 (순서대로 하나씩)
        resolved = resolved.replace(`{{$${originalName}}}`, value);
      });

      results.push({
        id: `perm-${index}`,
        index,
        ordering,
        assignment,
        resolvedPrompt: resolved,
      });
      index++;
    }
  }

  return results;
}
