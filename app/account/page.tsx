'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector from '@/components/MarketSelector'
import Logo from '@/components/Logo'

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
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
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

    if (data) {
      setProfile(data as Profile)
      setNameInput((data as Profile).display_name || '')
    }
    setLoading(false)
  }

  async function saveName() {
    if (!user || !nameInput.trim()) return
    setSavingName(true)
    await supabase
      .from('profiles')
      .update({ display_name: nameInput.trim() })
      .eq('id', user.id)
    setProfile(prev => prev ? { ...prev, display_name: nameInput.trim() } : prev)
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
      <header className="flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto relative z-10">
        <Logo size="small" />
        <h1 className="text-lg font-bold heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <div className="w-10" />
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
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2 mt-2" style={{ color: 'rgba(240,240,244,0.5)' }}>
              Account
            </p>
            {/* Name prompt if not set */}
            {!loading && profile && !profile.display_name && !editingName && (
              <div className="rounded-2xl p-4 mb-4 glass-card animate-fadeUp" style={{ borderColor: 'rgba(124,111,255,0.15)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#f0f0f4' }}>What should we call you?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none glass-input"
                    style={{ color: '#f0f0f4' }}
                  />
                  <button
                    onClick={saveName}
                    disabled={!nameInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 transition-all"
                    style={{ backgroundColor: 'rgba(124,111,255,0.15)', color: '#7c6fff', opacity: nameInput.trim() ? 1 : 0.4 }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden glass-card mb-6">
              <SettingsRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
                label={profile?.display_name || 'Add your name'}
                value={profile?.display_name ? '' : undefined}
                onClick={() => setEditingName(true)}
              />
              {editingName && (
                <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-sm outline-none glass-input"
                      style={{ color: '#f0f0f4' }}
                      autoFocus
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName || !nameInput.trim()}
                      className="px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ backgroundColor: 'rgba(124,111,255,0.15)', color: '#7c6fff' }}
                    >
                      {savingName ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{ color: 'rgba(240,240,244,0.4)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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

            {/* Section: About */}
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(240,240,244,0.5)' }}>
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
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'IngredScan', text: 'Check what\'s really in your food!', url: 'https://www.ingredscan.com' })
                  }
                }}
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
