/**
 * AP-style title case for headings.
 *
 * Deliberately non-destructive: a word that already carries a capital is left
 * exactly as written, so acronyms (ZIP, GA, SAT, STEM), place names (DeKalb,
 * LaGrange, McDonough) and headings that were already title cased survive
 * untouched. Only lowercase words are considered for capitalisation.
 */
const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "if", "in", "nor", "of",
  "on", "or", "per", "so", "the", "to", "up", "via", "vs", "yet",
]);

const WORD = /[A-Za-z0-9][A-Za-z0-9'’]*(?:&[a-z]+;[A-Za-z0-9'’]*)*|&[a-z]+;/g;

function capitalise(word: string): string {
  return word.replace(/[a-z]/, (letter) => letter.toUpperCase());
}

export function titleCase(input: string): string {
  if (!input) return input;

  // Split on hyphens too, so "one-to-one" becomes "One-to-One".
  const tokens: { text: string; start: number; end: number }[] = [];
  for (const match of input.matchAll(WORD)) {
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  if (!tokens.length) return input;

  let out = "";
  let cursor = 0;

  tokens.forEach((token, index) => {
    out += input.slice(cursor, token.start);
    cursor = token.end;

    const isFirst = index === 0;
    const isLast = index === tokens.length - 1;
    // A word opening a clause after ":" or "|" is treated as a first word.
    const preceding = input.slice(0, token.start);
    const startsClause = /[:|—–]\s*$/.test(preceding);
    const bare = token.text.toLowerCase();

    if (/[A-Z]/.test(token.text)) {
      out += token.text; // already capitalised somewhere: leave alone
    } else if (!isFirst && !isLast && !startsClause && SMALL_WORDS.has(bare)) {
      out += token.text;
    } else {
      out += capitalise(token.text);
    }
  });

  return out + input.slice(cursor);
}
