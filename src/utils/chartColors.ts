import type { HTMLAttributes } from 'react'

export type ChartPalette =
  | 'primary'
  | 'jade'
  | 'saffron'
  | 'scarlet'
  | 'amethyst'
  | 'plum'
  | 'magenta'
  | 'mercury'
  | 'espresso'
  | 'crimson'
  | 'abyss'

export type ChartTone = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export interface ChartBaseProps extends HTMLAttributes<HTMLDivElement> {
  height?: number
  ariaLabel: string
  accessibleData?: boolean
  loading?: boolean
  emptyMessage?: string
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
}

const PALETTES: Record<ChartPalette, Record<ChartTone, string>> = {
  primary: {
    50: '#eef4ff',
    100: '#dbe8ff',
    200: '#bdd3ff',
    300: '#94b5ff',
    400: '#6992f5',
    500: '#3f6fe3',
    600: '#1f56c5',
    700: '#003ca6',
    800: '#00338d',
    900: '#00276b',
    950: '#00133a',
  },
  jade: {
    50: '#f0faf0',
    100: '#d4ebd5',
    200: '#b1deb4',
    300: '#8ad291',
    400: '#62c46f',
    500: '#3bb452',
    600: '#0f9335',
    700: '#047025',
    800: '#005017',
    900: '#01310b',
    950: '#001503',
  },
  saffron: {
    50: '#fbf6ed',
    100: '#efe3d0',
    200: '#e6cfab',
    300: '#debb81',
    400: '#d5a757',
    500: '#c8942e',
    600: '#a67604',
    700: '#825b00',
    800: '#5f4201',
    900: '#3e2a01',
    950: '#201300',
  },
  scarlet: {
    50: '#fff4f3',
    100: '#fed8d3',
    200: '#ffbab3',
    300: '#ff9a92',
    400: '#ff756e',
    500: '#fe4446',
    600: '#ea212f',
    700: '#ba011c',
    800: '#880112',
    900: '#590108',
    950: '#2e0002',
  },
  amethyst: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#6d58bd',
    700: '#5b46a1',
    800: '#4a3a82',
    900: '#3a2e63',
    950: '#241c3e',
  },
  plum: {
    50: '#faf4ff',
    100: '#e8daf1',
    200: '#d9bee9',
    300: '#cba1e3',
    400: '#bb84da',
    500: '#aa6acc',
    600: '#9356b3',
    700: '#7c4698',
    800: '#582c6f',
    900: '#361546',
    950: '#16041f',
  },
  magenta: {
    50: '#fff0f9',
    100: '#ffe0f3',
    200: '#ffc0e8',
    300: '#ff8fd4',
    400: '#ff4db8',
    500: '#ef008d',
    600: '#cc0078',
    700: '#a30060',
    800: '#7a0048',
    900: '#500030',
    950: '#2e001b',
  },
  mercury: {
    50: '#fafafa',
    100: '#f4f4f4',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  espresso: {
    50: '#fbf9f9',
    100: '#f6f3f2',
    200: '#ebe6e4',
    300: '#d6cecb',
    400: '#a89c98',
    500: '#7d6f6a',
    600: '#5e514d',
    700: '#4a3e3b',
    800: '#362c2a',
    900: '#25201f',
    950: '#141110',
  },
  crimson: {
    50: '#fef4f3',
    100: '#fbd6d2',
    200: '#fab5af',
    300: '#fa9189',
    400: '#f46d66',
    500: '#e54a48',
    600: '#ca3436',
    700: '#a31b22',
    800: '#7b0411',
    900: '#510006',
    950: '#2a0002',
  },
  abyss: {
    50: '#f0f9f9',
    100: '#d2e5e6',
    200: '#afd3d5',
    300: '#88c2c5',
    400: '#60b1b5',
    500: '#3a9ea3',
    600: '#25898e',
    700: '#197479',
    800: '#145f63',
    900: '#003437',
    950: '#000e0f',
  },
}

const BASE_TONE: Record<ChartPalette, ChartTone> = {
  primary: 700,
  jade: 500,
  saffron: 500,
  scarlet: 600,
  amethyst: 600,
  plum: 700,
  magenta: 500,
  mercury: 100,
  espresso: 900,
  crimson: 600,
  abyss: 800,
}

const DEFAULT_PALETTE_ORDER: ChartPalette[] = [
  'primary',
  'jade',
  'saffron',
  'scarlet',
  'amethyst',
  'plum',
  'magenta',
  'espresso',
]

export function getPaletteColor(palette: ChartPalette, tone?: ChartTone): string {
  const resolvedTone = tone ?? BASE_TONE[palette]
  return PALETTES[palette][resolvedTone]
}

export function getDefaultColors(count: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    const palette = DEFAULT_PALETTE_ORDER[i % DEFAULT_PALETTE_ORDER.length]
    colors.push(getPaletteColor(palette))
  }
  return colors
}

export function resolveSeriesColor(
  declared: ChartPalette | undefined,
  fallbackIndex: number,
  tone?: ChartTone,
): string {
  if (declared) return getPaletteColor(declared, tone)
  const palette = DEFAULT_PALETTE_ORDER[fallbackIndex % DEFAULT_PALETTE_ORDER.length]
  return getPaletteColor(palette, tone)
}
