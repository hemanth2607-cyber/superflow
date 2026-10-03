import React from 'react'

export type IconName =
  | 'folder'
  | 'file'
  | 'clone'
  | 'website'
  | 'webapp'
  | 'mobile'
  | 'desktop'
  | 'game'
  | 'dashboard'
  | 'api'
  | 'other'
  | 'sun'
  | 'moon'
  | 'volume'
  | 'volume-x'
  | 'sparkles'
  | 'arrow-right'
  | 'check'
  | 'refresh'
  | 'external-link'
  | 'info'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number | string
  className?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  ...props
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: `inline-block shrink-0 transition-transform duration-300 ${className}`,
    ...props,
  }

  switch (name) {
    // 📁 Folder: Wooden folder tied with bamboo and a sakura blossom
    case 'folder':
      return (
        <svg {...commonProps}>
          {/* Wooden folder body */}
          <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2a1.5 1.5 0 0 1 1.1.47l1.7 1.74a1.5 1.5 0 0 0 1.1.49H19.5A1.5 1.5 0 0 1 21 9.2v9.3a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-12z" />
          {/* Bamboo tie strip */}
          <line x1="3" y1="12" x2="21" y2="12" stroke="var(--bamboo, #3d8050)" strokeWidth="1.8" />
          <line x1="8.5" y1="10.8" x2="8.5" y2="13.2" stroke="var(--gold, #c89532)" strokeWidth="1.4" />
          <line x1="15.5" y1="10.8" x2="15.5" y2="13.2" stroke="var(--gold, #c89532)" strokeWidth="1.4" />
          {/* Sakura knot ornament */}
          <circle cx="12" cy="12" r="1.4" fill="var(--sakura, #ea7a99)" stroke="var(--sakura, #ea7a99)" />
          <circle cx="12" cy="9.6" r="0.8" fill="var(--sakura, #ea7a99)" opacity="0.85" />
          <circle cx="14" cy="11" r="0.8" fill="var(--sakura, #ea7a99)" opacity="0.85" />
          <circle cx="13.2" cy="13.6" r="0.8" fill="var(--sakura, #ea7a99)" opacity="0.85" />
          <circle cx="10.8" cy="13.6" r="0.8" fill="var(--sakura, #ea7a99)" opacity="0.85" />
          <circle cx="10" cy="11" r="0.8" fill="var(--sakura, #ea7a99)" opacity="0.85" />
        </svg>
      )

    // 📜 File: Paper scroll with a bamboo leaf
    case 'file':
      return (
        <svg {...commonProps}>
          {/* Rolled washi scroll */}
          <path d="M6 3.5h11a2.5 2.5 0 0 1 2.5 2.5v11.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 17.5v-11A3 3 0 0 1 7 3.5h10" />
          <path d="M4 7c0-1.7 1.3-3 3-3h10" />
          <path d="M4 17.5c0 1.4 1.1 2.5 2.5 2.5H17" />
          {/* Bamboo leaf laying on scroll */}
          <path
            d="M8.5 14c2-4 5.5-5 8-5.5-1 3-3 6.5-6.5 7.5-1 .3-1.5-.5-1.5-2z"
            fill="var(--bamboo, #3d8050)"
            opacity="0.35"
            stroke="var(--bamboo, #3d8050)"
            strokeWidth="1.2"
          />
          <line x1="9" y1="13.5" x2="15" y2="9.5" stroke="var(--bamboo, #3d8050)" strokeWidth="1" />
        </svg>
      )

    // 🪢 Clone: Two blossoms joined by a red thread
    case 'clone':
      return (
        <svg {...commonProps}>
          {/* Left blossom */}
          <g transform="translate(6, 8)">
            <circle cx="0" cy="0" r="1.8" fill="var(--gold, #c89532)" stroke="var(--gold, #c89532)" />
            <path d="M0 -3.5 C1.5 -3 2 -1 0 0 C-2 -1 -1.5 -3 0 -3.5" fill="var(--sakura, #ea7a99)" opacity="0.8" />
            <path d="M3.5 0 C3 1.5 1 2 0 0 C1 -2 3 -1.5 3.5 0" fill="var(--sakura, #ea7a99)" opacity="0.8" />
            <path d="M0 3.5 C-1.5 3 -2 1 0 0 C2 1 1.5 3 0 3.5" fill="var(--sakura, #ea7a99)" opacity="0.8" />
            <path d="M-3.5 0 C-3 -1.5 -1 -2 0 0 C-1 2 -3 1.5 -3.5 0" fill="var(--sakura, #ea7a99)" opacity="0.8" />
          </g>
          {/* Right blossom */}
          <g transform="translate(18, 16)">
            <circle cx="0" cy="0" r="1.8" fill="var(--gold, #c89532)" stroke="var(--gold, #c89532)" />
            <path d="M0 -3.5 C1.5 -3 2 -1 0 0 C-2 -1 -1.5 -3 0 -3.5" fill="var(--wisteria, #7d5ea3)" opacity="0.8" />
            <path d="M3.5 0 C3 1.5 1 2 0 0 C1 -2 3 -1.5 3.5 0" fill="var(--wisteria, #7d5ea3)" opacity="0.8" />
            <path d="M0 3.5 C-1.5 3 -2 1 0 0 C2 1 1.5 3 0 3.5" fill="var(--wisteria, #7d5ea3)" opacity="0.8" />
            <path d="M-3.5 0 C-3 -1.5 -1 -2 0 0 C-1 2 -3 1.5 -3.5 0" fill="var(--wisteria, #7d5ea3)" opacity="0.8" />
          </g>
          {/* Crimson silk thread joining them */}
          <path
            d="M6 8 C10 16, 14 8, 18 16"
            stroke="var(--vermilion, #d33828)"
            strokeWidth="2"
            strokeDasharray="1 0.5"
          />
        </svg>
      )

    // 🪷 Website: Blooming Lotus (Purity, floating, open water)
    case 'website':
      return (
        <svg {...commonProps}>
          {/* Lotus central petal */}
          <path
            d="M12 4.5 C10.5 8.5 10 11.5 12 16.5 C14 11.5 13.5 8.5 12 4.5 Z"
            fill="var(--sakura, #ea7a99)"
            opacity="0.3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Inner left petal */}
          <path
            d="M12 16.5 C9 13.5 7.5 9.5 8.8 6.8 C10.5 9.5 11.2 12.8 12 16.5 Z"
            fill="var(--sakura, #ea7a99)"
            opacity="0.2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Inner right petal */}
          <path
            d="M12 16.5 C15 13.5 16.5 9.5 15.2 6.8 C13.5 9.5 12.8 12.8 12 16.5 Z"
            fill="var(--sakura, #ea7a99)"
            opacity="0.2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Outer wide spread petals */}
          <path d="M12 16.5 C6.5 15 4 11.5 4.5 9 C7.5 12 9.8 14.8 12 16.5 Z" stroke="currentColor" strokeWidth="1.3" />
          <path d="M12 16.5 C17.5 15 20 11.5 19.5 9 C16.5 12 14.2 14.8 12 16.5 Z" stroke="currentColor" strokeWidth="1.3" />
          {/* Water rippling base */}
          <path d="M2.5 19.5 C7 18 17 18 21.5 19.5" stroke="var(--bamboo, #3d8050)" strokeWidth="1.6" />
        </svg>
      )

    // 🏵️ Web App: Radiant Chrysanthemum (Kiku imperial sunburst)
    case 'webapp':
      return (
        <svg {...commonProps}>
          {/* Central sun medallion */}
          <circle cx="12" cy="12" r="2.8" fill="var(--gold, #c89532)" stroke="var(--gold, #c89532)" />
          {/* Radiant layered petals */}
          <path d="M12 2.5 v4 M12 17.5 v4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2.5 12 h4 M17.5 12 h4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.3 5.3 l2.8 2.8 M15.9 15.9 l2.8 2.8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18.7 5.3 l-2.8 2.8 M8.1 15.9 l-2.8 2.8" stroke="currentColor" strokeWidth="1.5" />
          {/* Secondary curved crown petals */}
          <path d="M8.5 3.5 C10 5.5 14 5.5 15.5 3.5" stroke="var(--gold, #c89532)" strokeWidth="1.2" />
          <path d="M8.5 20.5 C10 18.5 14 18.5 15.5 20.5" stroke="var(--gold, #c89532)" strokeWidth="1.2" />
          <path d="M3.5 8.5 C5.5 10 5.5 14 3.5 15.5" stroke="var(--gold, #c89532)" strokeWidth="1.2" />
          <path d="M20.5 8.5 C18.5 10 18.5 14 20.5 15.5" stroke="var(--gold, #c89532)" strokeWidth="1.2" />
        </svg>
      )

    // 🌸 Mobile App: Plum Blossom (Ume five-fold rounded petals)
    case 'mobile':
      return (
        <svg {...commonProps}>
          {/* Slender mobile screen frame with ume flower inside */}
          <rect x="5.5" y="2.5" width="13" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
          {/* Five rounded plum petals inside */}
          <g transform="translate(12, 10)">
            <circle cx="0" cy="0" r="1.4" fill="var(--gold, #c89532)" />
            <circle cx="0" cy="-3.6" r="2.1" fill="var(--vermilion, #d33828)" opacity="0.75" />
            <circle cx="3.4" cy="-1.1" r="2.1" fill="var(--vermilion, #d33828)" opacity="0.75" />
            <circle cx="2.1" cy="2.9" r="2.1" fill="var(--vermilion, #d33828)" opacity="0.75" />
            <circle cx="-2.1" cy="2.9" r="2.1" fill="var(--vermilion, #d33828)" opacity="0.75" />
            <circle cx="-3.4" cy="-1.1" r="2.1" fill="var(--vermilion, #d33828)" opacity="0.75" />
          </g>
        </svg>
      )

    // 🌺 Desktop Software: Imperial Peony (Botan rich layered petals)
    case 'desktop':
      return (
        <svg {...commonProps}>
          {/* Peony lush multi-tiered bud */}
          <circle cx="12" cy="11.5" r="3.2" fill="var(--sakura, #ea7a99)" opacity="0.4" stroke="currentColor" />
          <path d="M7 11.5 C7 6.5 11 4.5 12 4.5 C13 4.5 17 6.5 17 11.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 12.5 C4.5 7.5 9 7 12 7 C15 7 19.5 7.5 19.5 12.5" stroke="var(--sakura, #ea7a99)" strokeWidth="1.4" />
          <path d="M5 14 C7.5 17.5 16.5 17.5 19 14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7.5 16.5 C9.5 19 14.5 19 16.5 16.5" stroke="currentColor" strokeWidth="1.4" />
          {/* Stem & leaf */}
          <path d="M12 18.5 v3.5" stroke="var(--bamboo, #3d8050)" strokeWidth="1.8" />
          <path d="M12 20.5 C14.5 20.5 16.5 19 17 17.5" stroke="var(--bamboo, #3d8050)" strokeWidth="1.3" />
        </svg>
      )

    // 🌺 Game: Wild Camellia (Tsubaki bold spiral petals with golden stamens)
    case 'game':
      return (
        <svg {...commonProps}>
          {/* Golden stamens at center */}
          <circle cx="12" cy="12" r="2" fill="var(--gold, #c89532)" stroke="var(--gold, #c89532)" />
          {/* Thick camellia spiraling petals */}
          <path
            d="M12 4.5 C15.5 4.5 18.5 7 18.5 10.5 C18.5 13 16.5 15 14 15 C11.5 15 9.5 13 9.5 10.5 C9.5 7 12 4.5 12 4.5 Z"
            fill="var(--vermilion, #d33828)"
            opacity="0.3"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M5.5 11 C5.5 8 8 6 10.5 6 C13 6 15 8 15 10.5 C15 13.5 12 16.5 9.5 16.5 C7 16.5 5.5 14 5.5 11 Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 18.5 C7.5 18 6.5 15.5 7 13.5 C9 15 13 16 16.5 14.5 C17.5 17 15 19 12 19 Z" stroke="currentColor" strokeWidth="1.4" />
          {/* Shiny camellia leaf */}
          <path d="M16 16 C19.5 17 21 20 21 20 C21 20 18.5 20.5 16 19" stroke="var(--bamboo, #3d8050)" strokeWidth="1.5" />
        </svg>
      )

    // 🎋 Dashboard: Bamboo Grove (Take vertical stalks and segments)
    case 'dashboard':
      return (
        <svg {...commonProps}>
          {/* Main bamboo stalk */}
          <line x1="8" y1="2" x2="8" y2="22" stroke="var(--bamboo, #3d8050)" strokeWidth="2.2" />
          <line x1="6.5" y1="8" x2="9.5" y2="8" stroke="var(--gold, #c89532)" strokeWidth="1.8" />
          <line x1="6.5" y1="15" x2="9.5" y2="15" stroke="var(--gold, #c89532)" strokeWidth="1.8" />

          {/* Secondary bamboo stalk */}
          <line x1="16" y1="4" x2="16" y2="22" stroke="var(--bamboo, #3d8050)" strokeWidth="1.8" />
          <line x1="14.8" y1="11" x2="17.2" y2="11" stroke="var(--gold, #c89532)" strokeWidth="1.6" />
          <line x1="14.8" y1="18" x2="17.2" y2="18" stroke="var(--gold, #c89532)" strokeWidth="1.6" />

          {/* Bamboo leaves */}
          <path d="M8 8 C11 7 13 5 14 3.5 C13 6 11 8.5 8 9" fill="var(--bamboo, #3d8050)" stroke="var(--bamboo, #3d8050)" strokeWidth="1" />
          <path d="M8 8 C10 9 12 10.5 13 12 C11 11 9.5 9.5 8 9" fill="var(--bamboo, #3d8050)" stroke="var(--bamboo, #3d8050)" strokeWidth="1" />
          <path d="M16 11 C18.5 10 20 8.5 21 7 C20 9.5 18.5 11.5 16 12" fill="var(--bamboo, #3d8050)" stroke="var(--bamboo, #3d8050)" strokeWidth="1" />
        </svg>
      )

    // 🌸 API: Forest Orchid (Ran graceful three petals & slender stalk)
    case 'api':
      return (
        <svg {...commonProps}>
          {/* Slender rising curved stem */}
          <path d="M7 21 C8 15 11 10 12 8" stroke="var(--bamboo, #3d8050)" strokeWidth="1.5" />
          {/* Upper arching petal */}
          <path
            d="M12 8 C11 4.5 12 3 13 3 C14 3 15 4.5 14 8 Z"
            fill="var(--wisteria, #7d5ea3)"
            opacity="0.3"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Left lateral petal */}
          <path d="M12 8 C9 6.5 6.5 8 6.5 9.5 C6.5 10.8 8.5 10.5 12 9 Z" stroke="currentColor" strokeWidth="1.4" />
          {/* Right lateral petal */}
          <path d="M12 8 C15 6.5 17.5 8 17.5 9.5 C17.5 10.8 15.5 10.5 12 9 Z" stroke="currentColor" strokeWidth="1.4" />
          {/* Orchid lip / pouch (labellum) */}
          <path
            d="M11 9 C9.5 11 10 13.5 12 14.5 C14 13.5 14.5 11 13 9 Z"
            fill="var(--gold, #c89532)"
            stroke="var(--gold, #c89532)"
            strokeWidth="1.2"
          />
        </svg>
      )

    // 🍇 Other: Cascading Wisteria (Fuji hanging blossom clusters)
    case 'other':
      return (
        <svg {...commonProps}>
          {/* Overhead trellis bar */}
          <line x1="3" y1="3.5" x2="21" y2="3.5" stroke="currentColor" strokeWidth="1.8" />
          {/* Cascading hanging raceme */}
          <path d="M12 3.5 v3" stroke="var(--bamboo, #3d8050)" strokeWidth="1.4" />
          {/* Cluster droplets */}
          <circle cx="12" cy="7.5" r="2.2" fill="var(--wisteria, #7d5ea3)" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="9.5" cy="10.5" r="1.9" fill="var(--wisteria, #7d5ea3)" opacity="0.85" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="14.5" cy="10.5" r="1.9" fill="var(--wisteria, #7d5ea3)" opacity="0.85" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="13.5" r="1.7" fill="var(--wisteria, #7d5ea3)" opacity="0.85" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="10" cy="16" r="1.4" fill="var(--wisteria, #7d5ea3)" opacity="0.7" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="14" cy="16" r="1.4" fill="var(--wisteria, #7d5ea3)" opacity="0.7" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="18.5" r="1.2" fill="var(--wisteria, #7d5ea3)" opacity="0.6" stroke="currentColor" strokeWidth="1" />
          <circle cx="12" cy="20.8" r="0.9" fill="var(--wisteria, #7d5ea3)" opacity="0.45" stroke="currentColor" strokeWidth="1" />
        </svg>
      )

    // ☀️ Sun (Washi Light theme)
    case 'sun':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12h2.5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
        </svg>
      )

    // 🌙 Moon (Lacquer Dark theme)
    case 'moon':
      return (
        <svg {...commonProps}>
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 7.26 5.403 5.403 0 0 1-3.14-9.8A9 9 0 0 0 12 3z" />
          {/* Subtle star blossom */}
          <circle cx="18" cy="6" r="1" fill="var(--gold, #c89532)" />
        </svg>
      )

    // 🔊 Audio enabled
    case 'volume':
      return (
        <svg {...commonProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )

    // 🔇 Audio muted
    case 'volume-x':
      return (
        <svg {...commonProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" stroke="var(--vermilion, #d33828)" />
          <line x1="16" y1="9" x2="22" y2="15" stroke="var(--vermilion, #d33828)" />
        </svg>
      )

    // ✨ Sparkles
    case 'sparkles':
      return (
        <svg {...commonProps}>
          <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z" fill="var(--gold, #c89532)" opacity="0.3" stroke="currentColor" />
          <path d="m5 19 1-2.5 2.5-1-2.5-1L5 12l-1 2.5L1.5 15.5l2.5 1z" />
          <path d="m19 19 .8-1.8 1.8-.8-1.8-.8-.8-1.8-.8 1.8-1.8.8 1.8.8z" />
        </svg>
      )

    // ➡️ Arrow right
    case 'arrow-right':
      return (
        <svg {...commonProps}>
          <line x1="4" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      )

    // ✓ Check
    case 'check':
      return (
        <svg {...commonProps}>
          <polyline points="20 6 9 17 4 12" stroke="var(--bamboo, #3d8050)" strokeWidth="2" />
        </svg>
      )

    // 🔄 Refresh
    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M21.5 2v6h-6M2.5 22v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L21.5 8M2.5 16l3.14 2.36A9 9 0 0 0 20.49 15" />
        </svg>
      )

    // 🔗 External Link
    case 'external-link':
      return (
        <svg {...commonProps}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )

    // ℹ️ Info
    case 'info':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
        </svg>
      )

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}
