const MULTIPLIER_WORDS: Record<number, string> = { 2: "duplicado", 3: "triplicado", 4: "quadruplicado" };

/** "Seu voto VIP foi duplicado (+2 votos)", or undefined when the vote had no VIP bonus. */
export function voteBonusText(votesAdded?: number, vipName?: string | null) {
  if (!vipName || !votesAdded || votesAdded <= 1) return undefined;
  const word = MULTIPLIER_WORDS[votesAdded] ?? `multiplicado por ${votesAdded}`;
  return `Seu voto ${vipName} foi ${word} (+${votesAdded} votos)`;
}
