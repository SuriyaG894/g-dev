/** Pure spelling operations. The World decides whether they are allowed. */

export function pluck(text: string, index: number): { text: string; letter: string } {
  if (index < 0 || index >= text.length) throw new RangeError(`no letter ${index} in ${text}`)
  return { text: text.slice(0, index) + text.slice(index + 1), letter: text[index] }
}

/** The word held up to a mirror. */
export function mirror(text: string): string {
  return [...text].reverse().join('')
}

/** Trades the letters at i and j. */
export function swap(text: string, i: number, j: number): string {
  if (i < 0 || j < 0 || i >= text.length || j >= text.length) throw new RangeError(`no letters ${i}, ${j} in ${text}`)
  const a = [...text]
  ;[a[i], a[j]] = [a[j], a[i]]
  return a.join('')
}

/** Writes `letter` into gap `index` (0 = before the first letter, text.length = after the last). */
export function place(text: string, index: number, letter: string): string {
  if (index < 0 || index > text.length) throw new RangeError(`no gap ${index} in ${text}`)
  if (!/^[A-Z]$/.test(letter)) throw new Error(`not a letter: ${letter}`)
  return text.slice(0, index) + letter + text.slice(index)
}
