// Bigram Dice coefficient. Fast, no dependencies, sufficient for short
// commercial names. Returns a value in [0, 1]. We avoid Levenshtein here
// because it punishes length differences ("Apap" vs "Apap forte") harder
// than is appropriate for brand families.

function bigrams(s: string): Map<string, number> {
  const out = new Map<string, number>();
  if (s.length < 2) {
    if (s.length === 1) out.set(s, 1);
    return out;
  }
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

export function diceSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigrams(a);
  const B = bigrams(b);
  let intersection = 0;
  let totalA = 0;
  let totalB = 0;
  for (const v of A.values()) totalA += v;
  for (const v of B.values()) totalB += v;
  for (const [k, va] of A) {
    const vb = B.get(k);
    if (vb) intersection += Math.min(va, vb);
  }
  return (2 * intersection) / (totalA + totalB);
}
