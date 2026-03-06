/** Theme-aware accent tint helpers.
 *  Light surfaces absorb tint, so we roughly 2× the opacity in light mode. */

function isLight(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('light'));

}

/** Returns a color-mix() string with theme-appropriate percentage.
 *  @param color  CSS color value (e.g. `var(--eqx-coral)` or a hex)
 *  @param darkPct  percentage for dark mode (8–15 typical)
 *  @param lightPct percentage for light mode (18–28 typical)
 *  @param base  the mix-in base color, defaults to `var(--eqx-raised)` */
export function tintBg(
color: string,
darkPct: number,
lightPct: number,
base: string = 'var(--eqx-raised)')
: string {
  const pct = isLight() ? lightPct : darkPct;
  return `color-mix(in srgb, ${color} ${pct}%, ${base})`;
}

/** Returns an rgba() string with theme-appropriate alpha.
 *  @param r, g, b  0–255
 *  @param darkAlpha  alpha for dark mode (0–1)
 *  @param lightAlpha alpha for light mode (0–1) */
export function tintRgba(
r: number,
g: number,
b: number,
darkAlpha: number,
lightAlpha: number)
: string {
  const a = isLight() ? lightAlpha : darkAlpha;
  return `rgba(${r},${g},${b},${a})`;
}