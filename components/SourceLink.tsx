'use client'

interface Source {
  label: string
  url: string
}

interface Props {
  primary: Source
  secondary?: Source
}

export default function SourceLink({ primary, secondary }: Props) {
  return (
    <div className="flex items-center gap-3 mt-2 flex-wrap">
      <a
        href={primary.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11px] transition-colors"
        style={{ color: 'rgba(240,240,244,0.4)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,240,244,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,244,0.4)')}
      >
        Source: {primary.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
      </a>
      {secondary && (
        <>
          <span className="text-[11px]" style={{ color: 'rgba(240,240,244,0.2)' }}>·</span>
          <a
            href={secondary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] transition-colors"
            style={{ color: 'rgba(240,240,244,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,240,244,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,244,0.4)')}
          >
            {secondary.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
        </>
      )}
    </div>
  )
}
