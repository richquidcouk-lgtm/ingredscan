'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'
import { getDisplayScore } from '@/lib/scoring'
import AuthModal from '@/components/AuthModal'

type StatBucket = {
  total: number
  flagged: number
  avg: number
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<StatBucket>({ total: 0, flagged: 0, avg: 0 })
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [toggles, setToggles] = useState({
    weeklySummary: true,
    additiveAlerts: true,
    tipOfDay: false,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadProfile(data.user.id)
        loadStats(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      const p = data as Profile
      if (!p.display_name && typeof window !== 'undefined') {
        const localName = localStorage.getItem('ingredscan_display_name')
        if (localName) p.display_name = localName
      }
      setProfile(p)
      setNameInput(p.display_name || '')
    }
    setLoading(false)
  }

  async function loadStats(userId: string) {
    const { data } = await supabase
      .from('scans')
      .select('barcode, products(quality_score, additives)')
      .eq('user_id', userId)
    if (!data) return
    const total = data.length
    let flagged = 0
    let scoreSum = 0
    let scored = 0
    for (const row of data as Array<{ products: { quality_score?: number; additives?: unknown[] } | null }>) {
      const p = row.products
      if (Array.isArray(p?.additives) && p!.additives!.length > 0) flagged++
      if (typeof p?.quality_score === 'number') {
        scoreSum += getDisplayScore(p.quality_score)
        scored++
      }
    }
    setStats({ total, flagged, avg: scored > 0 ? Math.round(scoreSum / scored) : 0 })
  }

  async function saveName() {
    if (!user || !nameInput.trim()) return
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: nameInput.trim() })
      .eq('id', user.id)
    if (error && typeof window !== 'undefined') {
      localStorage.setItem('ingredscan_display_name', nameInput.trim())
    }
    setProfile((prev) => (prev ? { ...prev, display_name: nameInput.trim() } : prev))
    setEditingName(false)
    setSavingName(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDelete() {
    if (!user) return
    await supabase.from('scans').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user && !loading) {
    return (
      <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center animate-fadeIn">
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>👤</div>
        <h2 className="heading-display" style={{ fontSize: 22, marginBottom: 8 }}>
          Sign in to your account
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          Sync scans, save favourites, and personalise your alerts.
        </p>
        <button onClick={() => setShowAuth(true)} type="button" className="btn-primary" style={{ maxWidth: 240 }}>
          Sign in
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'You'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 animate-fadeIn">
      {/* Profile header */}
      <div className="flex items-center gap-3.5 px-5 pt-6 pb-5">
        <div
          className="flex items-center justify-center flex-shrink-0 heading-display"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--dark)',
            fontSize: 22,
            color: '#fff',
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 outline-none"
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: 14,
                  color: 'var(--dark)',
                }}
              />
              <button
                onClick={saveName}
                disabled={savingName}
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'var(--green)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {savingName ? '…' : 'Save'}
              </button>
            </div>
          ) : (
            <>
              <div
                className="heading-display"
                style={{ fontSize: 20, letterSpacing: '-0.02em', cursor: 'pointer' }}
                onClick={() => setEditingName(true)}
              >
                {displayName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                Free account · {user?.email}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile stats */}
      <div className="grid grid-cols-3 gap-2.5 mx-5 mb-6">
        <ProfileStat num={stats.total} label="Scans total" color="var(--green)" />
        <ProfileStat num={stats.flagged} label="Flagged adds" color="var(--amber)" />
        <ProfileStat num={stats.avg} label="Avg score" color="var(--dark)" />
      </div>

      {/* Preferences */}
      <SettingsGroup title="Preferences">
        <SettingsRow
          iconBg="var(--green-bg)"
          icon="🥗"
          label="Dietary preferences"
          sublabel="Vegan, gluten-free, halal…"
          right="None set"
          chevron
        />
        <SettingsRow
          iconBg="#fef3c7"
          icon="⚠️"
          label="Allergen alerts"
          sublabel="Nuts, dairy, gluten, soy…"
          right="2 set"
          chevron
        />
        <SettingsRow
          iconBg="var(--red-bg)"
          icon="🚫"
          label="Avoid these additives"
          sublabel="Custom tier 3 overrides"
          right="Default"
          chevron
        />
      </SettingsGroup>

      {/* Notifications */}
      <SettingsGroup title="Notifications">
        <SettingsRow
          iconBg="#ede9fe"
          icon="🔔"
          label="Weekly scan summary"
          sublabel="Every Sunday morning"
          toggle={{ on: toggles.weeklySummary, onChange: (v) => setToggles({ ...toggles, weeklySummary: v }) }}
        />
        <SettingsRow
          iconBg="var(--amber-bg)"
          icon="📰"
          label="Additive news alerts"
          sublabel="New EFSA/FSA rulings"
          toggle={{ on: toggles.additiveAlerts, onChange: (v) => setToggles({ ...toggles, additiveAlerts: v }) }}
        />
        <SettingsRow
          iconBg="var(--green-bg)"
          icon="💡"
          label="Tip of the day"
          toggle={{ on: toggles.tipOfDay, onChange: (v) => setToggles({ ...toggles, tipOfDay: v }) }}
        />
      </SettingsGroup>

      {/* Data & Privacy */}
      <SettingsGroup title="Data & privacy">
        <SettingsRow
          iconBg="#f5f3ee"
          icon="📤"
          label="Export my scan data"
          sublabel="Download as CSV"
          chevron
        />
        <SettingsRow
          iconBg="var(--red-bg)"
          icon="🗑"
          label="Delete all data"
          sublabel="Clears history & preferences"
          chevron
          danger
          onClick={() => setShowDeleteConfirm(true)}
        />
      </SettingsGroup>

      {/* About */}
      <SettingsGroup title="About">
        <SettingsRow iconBg="#f5f3ee" icon="📖" label="How we score" sublabel="Our methodology explained" href="/methodology" chevron />
        <SettingsRow iconBg="#f5f3ee" icon="⚖️" label="Legal & disclaimer" href="/disclaimer" chevron />
        <SettingsRow iconBg="#f5f3ee" icon="ℹ️" label="Version" right="1.0.0" />
      </SettingsGroup>

      {/* Sign out */}
      <div className="px-5 mt-2 mb-8">
        <button onClick={handleSignOut} type="button" className="btn-outline">
          Sign out
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-[480px] p-6"
            style={{ background: 'var(--card)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="heading-display" style={{ fontSize: 20, marginBottom: 8 }}>
              Delete all your data?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              This wipes your scan history, preferences, and account profile. It can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: 'var(--red)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileStat({ num, label, color }: { num: number; label: string; color: string }) {
  return (
    <div className="card text-center" style={{ padding: 12 }}>
      <div className="heading-display" style={{ fontSize: 22, color }}>
        {num}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-5">
      <div
        className="pl-1 mb-2"
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'var(--muted)',
        }}
      >
        {title}
      </div>
      <div className="card overflow-hidden">{children}</div>
    </div>
  )
}

function SettingsRow({
  icon,
  iconBg,
  label,
  sublabel,
  right,
  chevron,
  toggle,
  href,
  onClick,
  danger,
}: {
  icon: string
  iconBg: string
  label: string
  sublabel?: string
  right?: string
  chevron?: boolean
  toggle?: { on: boolean; onChange: (v: boolean) => void }
  href?: string
  onClick?: () => void
  danger?: boolean
}) {
  const content = (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderBottom: '1px solid var(--border)',
        cursor: href || onClick || toggle ? 'pointer' : 'default',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, fontSize: 17 }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 14, color: danger ? 'var(--red)' : 'var(--dark)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sublabel}</div>}
      </div>
      {right && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{right}</div>}
      {chevron && (
        <div style={{ fontSize: 14, color: '#ccc', marginLeft: 4 }}>›</div>
      )}
      {toggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggle.onChange(!toggle.on)
          }}
          aria-pressed={toggle.on}
          style={{
            width: 44,
            height: 24,
            background: toggle.on ? 'var(--green)' : '#ddd',
            borderRadius: 12,
            position: 'relative',
            border: 'none',
            transition: 'background 0.2s',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: toggle.on ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      )}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  if (onClick) {
    return (
      <button onClick={onClick} type="button" className="w-full text-left">
        {content}
      </button>
    )
  }
  return content
}
