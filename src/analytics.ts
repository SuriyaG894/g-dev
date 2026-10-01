/**
 * Visitor counts, through Vercel Web Analytics: cookieless, and free on the Hobby plan.
 * Custom events are a paid feature there, so instead each page of the book is counted as a
 * page view of its own (/page/3-2, /ending/hope…). That shows how far readers get, and where
 * they stop, without spending anything.
 *
 * Nothing is sent unless the site was built by Vercel, or if the reader has asked not to be tracked.
 */
import { inject, pageview } from '@vercel/analytics'

let on = false

export function startAnalytics(): void {
  if (!__ON_VERCEL__ || !import.meta.env.PROD) return
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return
  inject({ disableAutoTrack: true })
  on = true
  track('/')
}

/** Counts a visit to one place in the book. */
export function track(path: string): void {
  if (on) pageview({ route: path, path })
}
