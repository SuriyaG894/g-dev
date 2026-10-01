import type { Input } from './game/types'

const LEFT = ['ArrowLeft', 'KeyA']
const RIGHT = ['ArrowRight', 'KeyD']
const UP = ['ArrowUp', 'KeyW']
const DOWN = ['ArrowDown', 'KeyS']
const JUMP = ['Space']

export type Action = 'undo' | 'restart' | 'pause' | 'edit' | 'hint' | 'mute' | 'debug' | 'flip' | 'self'

/** Keyboard + on-screen touch buttons, merged into one Input per step. */
export class Controls {
  private held = new Set<string>()
  private jumpEdge = false
  private upEdge = false
  touch = { left: false, right: false, up: false, down: false, jump: false }
  enabled = true
  onAction: (a: Action, e: KeyboardEvent) => void = () => {}

  private down = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return
    const code = e.code
    // Let focused buttons (menus, the quill panel) handle their own Space / Enter.
    if (e.target instanceof HTMLButtonElement && (code === 'Space' || code === 'Enter')) return
    if ([...LEFT, ...RIGHT, ...UP, ...DOWN, ...JUMP].includes(code)) e.preventDefault()
    if (!e.repeat) {
      if (JUMP.includes(code)) this.jumpEdge = true
      if (UP.includes(code)) this.upEdge = true
      if (code === 'KeyZ') this.onAction('undo', e)
      else if (code === 'KeyR' && !e.ctrlKey && !e.metaKey) this.onAction('restart', e)
      else if (code === 'Escape' || code === 'KeyP') this.onAction('pause', e)
      else if (code === 'KeyE' || code === 'Enter') this.onAction('edit', e)
      else if (code === 'KeyH') this.onAction('hint', e)
      else if (code === 'KeyM') this.onAction('mute', e)
      else if (code === 'KeyF' || code === 'KeyQ') this.onAction('flip', e)
      else if (code === 'KeyY') this.onAction('self', e)
      else if (code === 'Backquote') this.onAction('debug', e)
    }
    this.held.add(code)
  }

  private up = (e: KeyboardEvent) => {
    this.held.delete(e.code)
  }

  private blur = () => {
    this.held.clear()
    this.touch = { left: false, right: false, up: false, down: false, jump: false }
  }

  attach(): void {
    window.addEventListener('keydown', this.down)
    window.addEventListener('keyup', this.up)
    window.addEventListener('blur', this.blur)
  }

  detach(): void {
    window.removeEventListener('keydown', this.down)
    window.removeEventListener('keyup', this.up)
    window.removeEventListener('blur', this.blur)
    this.blur()
  }

  private any(codes: string[]): boolean {
    return codes.some((c) => this.held.has(c))
  }

  pressJump(): void {
    this.jumpEdge = true
  }

  pressUp(): void {
    this.upEdge = true
  }

  /** Clears this frame's presses once the world has stepped with them. */
  consume(): void {
    this.jumpEdge = false
    this.upEdge = false
  }

  /** Reads the current input (presses stay set until consume()). */
  read(): Input {
    if (!this.enabled) {
      this.jumpEdge = this.upEdge = false
      return { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, upPressed: false }
    }
    const t = this.touch
    const input: Input = {
      left: this.any(LEFT) || t.left,
      right: this.any(RIGHT) || t.right,
      up: this.any(UP) || t.up,
      down: this.any(DOWN) || t.down,
      jump: this.any(JUMP) || this.any(UP) || t.jump || t.up,
      jumpPressed: this.jumpEdge,
      upPressed: this.upEdge,
    }
    return input
  }
}
