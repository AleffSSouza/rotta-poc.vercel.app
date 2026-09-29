export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#3B4EE6" />
      <circle cx="9.5" cy="22.5" r="3" fill="#fff" />
      <path
        d="M9.5 19.5V15a4.5 4.5 0 0 1 4.5-4.5h4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0.1 4.4"
      />
      <circle cx="22.5" cy="10.5" r="3.7" fill="#fff" />
      <circle cx="22.5" cy="10.5" r="1.4" fill="#3B4EE6" />
    </svg>
  )
}

export function Logo({ dark = false, size = 'md' }: { dark?: boolean; size?: 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={size === 'lg' ? 'size-11' : 'size-8'} />
      <span className={`font-extrabold tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-xl'} ${dark ? 'text-white' : 'text-ink-900'}`}>
        Rotta
      </span>
    </div>
  )
}
