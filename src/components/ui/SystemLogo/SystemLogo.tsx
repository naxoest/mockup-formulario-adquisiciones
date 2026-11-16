import { useRef, useLayoutEffect, useState } from 'react'
import { cn } from '@/utils/cn'

type SystemLogoVariant = 'full' | 'mini'
type SystemLogoColorMode = 'default' | 'white' | 'custom'

interface SystemLogoProps {
  variant?: SystemLogoVariant
  colorMode?: SystemLogoColorMode
  text?: string
  className?: string
}

const MINI_VIEWBOX = '70 0 40 38'
const FULL_INITIAL_VIEWBOX = '-10 0 320 38'
const INITIAL_TEXT_X = 305

function resolveColor(mode: SystemLogoColorMode, original: string): string {
  if (mode === 'white') return 'white'
  if (mode === 'custom') return 'currentColor'
  return original
}

export function SystemLogo({
  variant = 'full',
  colorMode = 'default',
  text = 'ADQUISICIONES',
  className,
}: SystemLogoProps) {
  const isMini = variant === 'mini'
  const iconRef = useRef<SVGGElement | null>(null)
  const textRef = useRef<SVGTextElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [textX, setTextX] = useState<number>(INITIAL_TEXT_X)
  const [measuredViewBox, setMeasuredViewBox] = useState<string>(FULL_INITIAL_VIEWBOX)

  useLayoutEffect(() => {
    if (isMini) return

    let cancelled = false

    const recalculate = () => {
      if (cancelled) return
      if (!iconRef.current || !textRef.current) return
      const ibb = iconRef.current.getBBox()
      const tbb = textRef.current.getBBox()
      if (tbb.width === 0) return
      const nextTextX = ibb.x - tbb.width - 10
      const left = Math.min(ibb.x, nextTextX) - 8
      const right = Math.max(ibb.x + ibb.width, nextTextX + tbb.width) + 8
      setTextX(nextTextX)
      setMeasuredViewBox(`${left} 0 ${right - left} 38`)
    }

    const rafId = requestAnimationFrame(recalculate)
    const resizeObserver = new ResizeObserver(recalculate)

    if (svgRef.current) {
      resizeObserver.observe(svgRef.current)
    }

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(recalculate).catch(() => undefined)
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [text, isMini])

  const viewBox = isMini ? MINI_VIEWBOX : measuredViewBox

  const baseColor = resolveColor(colorMode, 'black')
  const redColor = resolveColor(colorMode, 'rgb(232,45,66)')
  const tealColor = resolveColor(colorMode, 'rgb(0,106,109)')
  const goldColor = resolveColor(colorMode, 'rgb(221,161,38)')

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={viewBox}
      version="1.1"
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={isMini ? 'Logo del sistema' : `Logo del sistema ${text}`}
    >
      <g ref={iconRef}>
        <g transform="matrix(1,0,0,1,-2108.15,-4163.31)">
          <g transform="matrix(1,0,0,0.923474,1530,4038.27)">
            <g transform="matrix(0.556345,0,0,0.602448,-1925.11,45.0568)">
              <g transform="matrix(1.73125,0,0,1.73125,4457.15,109.153)">
                <g transform="matrix(-0.101225,0.994864,0.994864,0.101225,122.032,14.5953)">
                  <path
                    d="M13.243,-19.991C14.418,-1.916 10.523,6.738 7.906,10.931L13.243,11.474C13.243,11.474 21.277,1.874 18.661,-19.44L13.243,-19.991Z"
                    style={{ fill: redColor, fillRule: 'nonzero' }}
                  />
                </g>
                <g transform="matrix(1,0,0,1,100.804,46.95)">
                  <path
                    d="M0,-4.513C0,-4.513 2.1,-6.472 5.291,-6.472C7.416,-6.472 8.834,-4.013 12.064,-4.013C15.303,-4.013 16.293,-6.472 19.627,-6.472C22.955,-6.472 23.17,-4.013 26.459,-4.013C29.748,-4.013 31.303,-6.472 31.303,-6.472L31.256,0.028C31.256,0.028 29.213,1.959 26.459,1.959C23.709,1.959 22.561,-0.632 19.627,-0.632C16.693,-0.632 14.785,1.959 12.064,1.959C9.35,1.959 7.99,-0.632 5.291,-0.632C2.59,-0.632 0,1.303 0,1.303L0,-4.513Z"
                    style={{ fill: tealColor, fillRule: 'nonzero' }}
                  />
                </g>
                <g transform="matrix(-1,0,0,1,232.909,32.855)">
                  <rect
                    x="100.803"
                    y="23.684"
                    width="31.303"
                    height="5.777"
                    style={{ fill: goldColor }}
                  />
                </g>
                <g transform="matrix(1,0,0,1,284.415,44.7815)">
                  <path
                    d="M0,-2.405C-0.395,3.91 -0.785,10.226 -7.316,10.226C-13.811,10.226 -13.42,3.91 -13.027,-2.405C-12.711,-7.51 -12.4,-12.625 -5.871,-12.625C0.627,-12.625 0.324,-7.51 0,-2.405M-5.707,-19.932C-20.408,-19.932 -20.928,-12.432 -21.465,-2.452L-21.463,-2.452C-22.035,8.707 -22.414,17.511 -7.5,17.519C7.967,17.527 7.877,7.534 8.398,-2.452L8.396,-2.452C8.963,-13.21 8.545,-19.932 -5.707,-19.932"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
                <g transform="matrix(1,0,0,1,320.3,41.8246)">
                  <path
                    d="M0,3.587C-2.018,0.407 -7.775,-1.901 -9.848,-2.694C-14.23,-4.372 -16.244,-5.236 -16.105,-7.79C-15.992,-9.91 -13.773,-10.452 -10.525,-10.261C-5.771,-9.981 -0.863,-7.636 -0.863,-7.636L-0.504,-14.616C-0.504,-14.616 -4.627,-16.975 -10.441,-16.975C-19.102,-16.975 -24.189,-14.282 -24.586,-6.738C-24.879,-1.118 -19.713,1.653 -16.564,3.441L-10.502,6.395C-8.346,7.456 -6.732,8.394 -6.857,10.689C-7.012,13.489 -10.174,13.784 -11.92,13.703C-14.809,13.569 -18.816,12.308 -22.582,10.169L-24.488,10.689L-24.805,16.607C-22.027,18.53 -17.639,20.199 -13.082,20.437C-10.736,20.562 -8.672,20.386 -6.889,19.919C-5.107,19.45 -3.605,18.747 -2.379,17.81C-1.152,16.872 -0.207,15.736 0.461,14.4C1.129,13.066 1.506,11.575 1.592,9.927C1.713,7.614 1.535,6.009 0,3.587"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
                <g transform="matrix(1,0,0,1,162.472,62.3163)">
                  <path
                    d="M0,-37.015L-1.187,-13.914C-1.187,-13.914 -1.531,-7.608 -7.129,-7.608C-12.719,-7.608 -12.395,-13.914 -12.395,-13.914L-11.201,-37.015L-17.76,-37.015L-19.684,-35.934L-20.916,-12.043C-20.916,-12.043 -21.543,0 -7.529,0C6.512,0 7.141,-12.043 7.141,-12.043L8.426,-37.015L0,-37.015Z"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
                <g transform="matrix(1,0,0,1,181.64,32.1581)">
                  <path
                    d="M0,22.857L1.561,-6.857L-4.994,-6.857L-6.922,-5.777L-8.781,29.714L13.363,29.714L13.723,22.849L0,22.857Z"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
                <g transform="matrix(1,0,0,1,210.421,37.4573)">
                  <path
                    d="M0,12.259L4.02,1.808L6.787,12.259L0,12.259ZM10.008,24.415L18.309,24.415L8.715,-12.156L2.248,-12.156L0.324,-11.077L-13.098,24.414L-4.676,24.415L-2.637,19.116L8.604,19.116L10.008,24.415Z"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
                <g transform="matrix(1,0,0,1,259.632,45.3633)">
                  <path
                    d="M0,-3.565L-11.064,-3.565L-11.061,-3.565L-12.988,-2.485L-13.229,2.091L-8.162,2.564L-8.441,7.787C-8.441,7.787 -8.584,8.999 -9.813,9.21C-12.352,9.644 -15.252,9.644 -15.252,9.644L-15.83,9.644C-20.982,9.462 -21.916,5.882 -21.494,-2.065C-21.062,-10.196 -20.385,-13.891 -14.186,-13.891C-11.209,-13.891 -5.279,-11.813 -2.473,-9.771L-2.127,-16.466C-2.127,-16.466 -6.055,-20.506 -14.844,-20.506C-25.297,-20.506 -27.898,-15.582 -28.881,-12.071C-29.506,-9.839 -29.748,-5.602 -29.914,-2.419C-30.066,0.489 -30.236,4.097 -29.916,6.533C-29.604,8.902 -29.174,13.835 -23.146,15.945C-21.146,16.644 -18.545,16.941 -15.406,16.941C-4.637,16.941 -0.775,11.21 -0.775,11.21L-0.361,3.29L-0.361,3.292L0,-3.565Z"
                    style={{ fillRule: 'nonzero' }}
                    fill={baseColor}
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      {!isMini && (
        <text
          ref={textRef}
          x={textX}
          y={36}
          fontFamily="'Open Sans', sans-serif"
          fontWeight="300"
          fontSize="44"
          fill={baseColor}
        >
          {text}
        </text>
      )}
    </svg>
  )
}
