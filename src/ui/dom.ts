type Child = Node | string | null | undefined | false

export interface Props {
  class?: string
  text?: string
  attrs?: Record<string, string>
  on?: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>
  style?: Partial<CSSStyleDeclaration>
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (props.class) el.className = props.class
  if (props.text !== undefined) el.textContent = props.text
  for (const [k, v] of Object.entries(props.attrs ?? {})) el.setAttribute(k, v)
  for (const [k, fn] of Object.entries(props.on ?? {})) el.addEventListener(k, fn as EventListener)
  if (props.style) Object.assign(el.style, props.style)
  for (const c of children) if (c) el.append(c)
  return el
}

export function button(label: string, onClick: () => void, cls = 'btn', attrs: Record<string, string> = {}): HTMLButtonElement {
  return h('button', { class: cls, text: label, attrs: { type: 'button', ...attrs }, on: { click: () => onClick() } })
}

export function roman(n: number): string {
  return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] ?? String(n)
}

export function words(n: number): string {
  return ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][n] ?? String(n)
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
