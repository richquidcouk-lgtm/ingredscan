'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector from '@/components/MarketSelector'

function SettingsRow({
  icon,
  label,
  value,
  href,
  onClick,
  chevron = true,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string | React.ReactNode
  href?: string
  onClick?: () => void
  chevron?: boolean
  danger?: boolean
}) {
  const content = (
    <div
      className="flex items-center gap-3 px-4 py-3.5 transition-all duration-150 active:bg-white/5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: danger ? 'rgba(255,90,90,0.08)' : 'rgba(124,111,255,0.08)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? '#ff5a5a' : '#f0f0f4' }}>{label}</p>
      </div>
      {value && (
        <span className="text-xs shrink-0" style={{ color: 'rgba(240,240,244,0.4)' }}>
          {value}
        </span>
      )}
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.2)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>
  }
  return content
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMarketSelector, setShowMarketSelector] = useState(false)
  const { config } = useMarket()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        loadProfile(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) setProfile(data as Profile)
    setLoading(false)
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

  async function handleShare() {
    const shareData = {
      title: 'IngredScan',
      text: 'Check what\'s really in your food with IngredScan!',
      url: 'https://ingredscan.app',
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url)
      alert('Link copied!')
    }
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative pb-20">
        <div className="text-5xl mb-5">👤</div>
        <h2 className="text-xl font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>
          Sign in to your account
        </h2>
        <button
          onClick={() => setShowAuth(true)}
          className="mt-4 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: '#7c6fff', color: '#fff', boxShadow: '0 0 20px rgba(124,111,255,0.2)' }}
        >
          Sign In
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Header */}
      <header className="px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <h1 className="text-2xl font-bold heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
      </header>

      <div className="px-5 max-w-lg mx-auto relative z-10 mt-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Section: Account */}
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 mt-2" style={{ color: 'rgba(240,240,244,0.35)' }}>
              Account
            </p>
            <div className="rounded-2xl overflow-hidden glass-card mb-6">
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                }
                label="Email"
                value={user?.email}
                chevron={false}
              />
              <SettingsRow
                icon={<span className="text-base leading-none">{config.flag}</span>}
                label={config.name}
                value="Market"
                onClick={() => setShowMarketSelector(true)}
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                }
                label="Scan History"
                href="/history"
              />
            </div>

            {/* Section: Subscription */}
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(240,240,244,0.35)' }}>
              Subscription
            </p>
            <div className="rounded-2xl overflow-hidden glass-card mb-6">
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                }
                label="Plan"
                value={
                  profile?.pro ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#00e5a015', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.15)' }}>
                        Pro
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(28,28,38,0.8)', color: 'rgba(240,240,244,0.5)' }}>
                      Free
                    </span>
                  )
                }
                chevron={false}
              />
              {profile?.pro && profile?.pro_expires_at && (
                <SettingsRow
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  }
                  label="Renews"
                  value={
                    <span className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>
                      {new Date(profile.pro_expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  }
                  chevron={false}
                />
              )}
              {!profile?.pro && (
                <SettingsRow
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  }
                  label="Upgrade to Pro"
                  href="/pro"
                />
              )}
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                  </svg>
                }
                label="Scans today"
                value={`${profile?.scan_count_today || 0}${!profile?.pro ? ' / 10' : ''}`}
                chevron={false}
              />
            </div>

            {/* Section: About */}
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(240,240,244,0.35)' }}>
              About
            </p>
            <div className="rounded-2xl overflow-hidden glass-card mb-6">
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                }
                label="Rate IngredScan"
                onClick={() => {}}
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16,6 12,2 8,6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                }
                label="Share with friends"
                onClick={handleShare}
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                }
                label="Need help?"
                onClick={() => window.location.href = 'mailto:richquidcouk@gmail.com'}
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
                label="Privacy Policy"
                href="/privacy"
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                }
                label="Terms of Service"
                href="/terms"
              />
            </div>

            {/* Section: Danger zone */}
            <div className="rounded-2xl overflow-hidden glass-card mb-6">
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                }
                label="Sign Out"
                onClick={handleSignOut}
                chevron={false}
              />
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff5a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
                label="Delete Account"
                onClick={() => setShowDeleteConfirm(true)}
                chevron={false}
                danger
              />
            </div>
          </>
        )}
      </div>

      {/* Market selector modal */}
      {showMarketSelector && <MarketSelector onClose={() => setShowMarketSelector(false)} />}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative rounded-2xl p-6 mx-4 max-w-sm glass-card" style={{ background: 'rgba(19,19,26,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-lg font-bold heading-display mb-2" style={{ color: '#f0f0f4' }}>Delete account?</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.4)' }}>
              This action is permanent. All your scan history and data will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm glass-input"
                style={{ color: '#f0f0f4' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,90,90,0.1)', color: '#ff5a5a', border: '1px solid rgba(255,90,90,0.15)' }}
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
