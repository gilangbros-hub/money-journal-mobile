/**
 * Fanta Black — Unified dark theme for Money Journal
 *
 * Palette anchors:
 *   Pitch Black  #0A0A0A  (page & deepest background)
 *   Dark Yellow  #F5B233  (primary accent / CTA)
 *   Broken White #F2F0EB  (primary text on dark)
 */

const theme = {
    // ── backgrounds ──────────────────────────────────────────
    pageBg:         '#0A0A0A',   // pitch black
    cardBg:         '#141414',   // card surface
    cardBorder:     '#1F1F1F',   // subtle card border
    inputBg:        '#1A1A1A',   // text-input / chip bg
    inputBorder:    '#262626',   // text-input border
    surfaceHover:   '#1E1E1E',   // hover / pressed state

    // ── text ─────────────────────────────────────────────────
    textPrimary:    '#F2F0EB',   // broken white
    textSecondary:  '#A8A29E',   // muted label
    textMuted:      '#6B6560',   // very muted / hint
    textOnAccent:   '#0A0A0A',   // text on yellow buttons

    // ── accent (Dark Yellow) ─────────────────────────────────
    accent:         '#F5B233',   // primary CTA / FAB
    accentStrong:   '#D99A1E',   // darker accent for emphasis
    accentSoft:     '#2A1F0A',   // accent tint on dark bg
    accentSurface:  '#FBE8B8',   // light accent surface (chips)

    // ── semantic ─────────────────────────────────────────────
    success:        '#22C55E',
    danger:         '#EF4444',
    warning:        '#F59E0B',
    info:           '#06B6D4',

    // ── overlay / modal ──────────────────────────────────────
    overlay:        'rgba(0,0,0,0.65)',

    // ── bottom sheet (cream tinted) ──────────────────────────
    sheetBg:        '#F8F1E2',
    sheetHandle:    '#D2C29B',
    sheetText:      '#17120B',
    sheetSelected:  '#F6E6B8',

    // ── tab bar ──────────────────────────────────────────────
    tabBarBg:       '#0F0F0F',
    tabBarBorder:   '#1C1C1C',
    tabInactive:    '#6B6560',
    tabActive:      '#F5B233',
};

export default theme;
