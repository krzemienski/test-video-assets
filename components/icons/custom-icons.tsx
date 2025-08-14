// Custom main logo for Video Test Assets Portal
export const VideoTestAssetsLogo = ({ className = "size-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle with gradient */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" />
        <stop offset="100%" stopColor="oklch(0.541 0.281 293.009)" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#logoGradient)" stroke="oklch(0.969 0.016 293.756)" strokeWidth="2" />

    {/* Play button with test pattern */}
    <path d="M12 10L12 22L22 16L12 10Z" fill="oklch(0.969 0.016 293.756)" stroke="none" />

    {/* Test pattern lines */}
    <line x1="8" y1="8" x2="10" y2="8" stroke="oklch(0.969 0.016 293.756)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="11" x2="9" y2="11" stroke="oklch(0.969 0.016 293.756)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="24" x2="24" y2="24" stroke="oklch(0.969 0.016 293.756)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="23" y1="21" x2="24" y2="21" stroke="oklch(0.969 0.016 293.756)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// HLS Protocol Icon
export const HLSIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7V17L9 12L3 7Z" fill="currentColor" opacity="0.8" />
    <path d="M9 9V15L15 12L9 9Z" fill="currentColor" opacity="0.6" />
    <path d="M15 11V13L21 12L15 11Z" fill="currentColor" opacity="0.4" />
    <circle cx="21" cy="12" r="1" fill="oklch(0.606 0.25 292.717)" />
  </svg>
)

// DASH Protocol Icon
export const DASHIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="4" height="8" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="7" y="6" width="4" height="12" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="12" y="10" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="17" y="7" width="4" height="10" rx="1" fill="oklch(0.606 0.25 292.717)" />
    <path
      d="M2 4L22 4"
      stroke="oklch(0.606 0.25 292.717)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
  </svg>
)

// CMAF Protocol Icon
export const CMAFIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
    <path d="M8 10H16V14H8V10Z" fill="oklch(0.606 0.25 292.717)" opacity="0.6" />
    <circle cx="6" cy="8" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="6" cy="12" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="6" cy="16" r="1" fill="oklch(0.606 0.25 292.717)" />
  </svg>
)

// 4K Resolution Icon
export const Resolution4KIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <text x="12" y="15" textAnchor="middle" className="text-xs font-bold" fill="oklch(0.606 0.25 292.717)">
      4K
    </text>
    <path d="M2 18L6 18" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 18L22 18" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// 8K Resolution Icon
export const Resolution8KIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <text x="12" y="15" textAnchor="middle" className="text-xs font-bold" fill="oklch(0.606 0.25 292.717)">
      8K
    </text>
    <path d="M2 18L8 18" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 18L22 18" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="4" cy="8" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="20" cy="8" r="1" fill="oklch(0.606 0.25 292.717)" />
  </svg>
)

// HDR10 Icon
export const HDR10Icon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="hdrGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" />
        <stop offset="100%" stopColor="oklch(0.541 0.281 293.009)" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="8" fill="url(#hdrGradient)" opacity="0.2" />
    <path d="M8 8L16 8L16 16L8 16L8 8Z" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" fill="none" />
    <text x="12" y="14" textAnchor="middle" className="text-xs font-bold" fill="oklch(0.606 0.25 292.717)">
      HDR
    </text>
    <circle cx="12" cy="6" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="18" cy="12" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="12" cy="18" r="1" fill="oklch(0.606 0.25 292.717)" />
    <circle cx="6" cy="12" r="1" fill="oklch(0.606 0.25 292.717)" />
  </svg>
)

// AV1 Codec Icon
export const AV1Icon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
    <text x="12" y="15" textAnchor="middle" className="text-xs font-bold" fill="oklch(0.606 0.25 292.717)">
      AV1
    </text>
    <path d="M6 10L8 10" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 10L18 10" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="oklch(0.606 0.25 292.717)" />
  </svg>
)

// HEVC/H.265 Codec Icon
export const HEVCIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
    <text x="12" y="14" textAnchor="middle" className="text-[10px] font-bold" fill="oklch(0.606 0.25 292.717)">
      H.265
    </text>
    <path
      d="M6 8L10 12L6 16"
      stroke="oklch(0.606 0.25 292.717)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M18 8L14 12L18 16"
      stroke="oklch(0.606 0.25 292.717)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

// Dolby Vision Icon
export const DolbyVisionIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dolbyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" />
        <stop offset="50%" stopColor="oklch(0.769 0.188 70.08)" />
        <stop offset="100%" stopColor="oklch(0.541 0.281 293.009)" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#dolbyGradient)" opacity="0.1" />
    <path d="M8 8L16 8C18 8 18 16 16 16L8 16L8 8Z" stroke="oklch(0.606 0.25 292.717)" strokeWidth="2" fill="none" />
    <text x="12" y="14" textAnchor="middle" className="text-[10px] font-bold" fill="oklch(0.606 0.25 292.717)">
      DV
    </text>
    <path d="M4 4L8 8" stroke="oklch(0.769 0.188 70.08)" strokeWidth="1" strokeLinecap="round" />
    <path d="M20 4L16 8" stroke="oklch(0.769 0.188 70.08)" strokeWidth="1" strokeLinecap="round" />
    <path d="M4 20L8 16" stroke="oklch(0.769 0.188 70.08)" strokeWidth="1" strokeLinecap="round" />
    <path d="M20 20L16 16" stroke="oklch(0.769 0.188 70.08)" strokeWidth="1" strokeLinecap="round" />
  </svg>
)
