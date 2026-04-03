'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'
import { useMarket } from '@/components/MarketProvider'
import MarketSelector from '@/components/MarketSelector'

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

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
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
    <div className="min-h-screen relative">
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <button onClick={() => router.back()} className="p-2.5 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold" style={{ color: '#f0f0f4', letterSpacing: '-0.02em' }}>Account</h1>
        <div className="w-10" />
      </header>

      <div className="px-5 max-w-lg mx-auto space-y-3 relative z-10">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(19,19,26,0.6)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Email */}
            <div className="rounded-2xl p-5 glass-card">
              <p className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>Email</p>
              <p className="text-sm font-medium mt-1.5" style={{ color: '#f0f0f4' }}>{user?.email}</p>
            </div>

            {/* Plan */}
            <div className="rounded-2xl p-5 glass-card">
              <p className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>Plan</p>
              <div className="flex items-center gap-2.5 mt-1.5">
                {profile?.pro ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#00e5a015', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.15)' }}>
                      Pro
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>
                      expires {profile.pro_expires_at ? new Date(profile.pro_expires_at).toLocaleDateString('en-GB') : '—'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(28,28,38,0.8)', color: 'rgba(240,240,244,0.5)' }}>
                      Free
                    </span>
                    <Link href="/pro" className="text-xs font-medium transition-colors hover:brightness-125" style={{ color: '#7c6fff' }}>
                      Upgrade →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Scan count */}
            <div className="rounded-2xl p-5 glass-card">
              <p className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>Scans today</p>
              <p className="text-sm font-medium mt-1.5" style={{ color: '#f0f0f4' }}>
                {profile?.scan_count_today || 0}
                {!profile?.pro && <span style={{ color: 'rgba(240,240,244,0.3)' }}> / 10</span>}
              </p>
            </div>

            {/* Your market */}
            <div className="rounded-2xl p-5 glass-card">
              <p className="text-xs font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>Your market</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{config.flag}</span>
                  <span className="text-sm font-medium" style={{ color: '#f0f0f4' }}>{config.name}</span>
                </div>
                <button
                  onClick={() => setShowMarketSelector(true)}
                  className="text-xs font-medium transition-colors hover:brightness-125"
                  style={{ color: '#7c6fff' }}
                >
                  Change
                </button>
              </div>
              <p className="text-xs mt-2.5" style={{ color: 'rgba(240,240,244,0.3)' }}>
                Your market affects swap suggestions and regulatory references.
              </p>
            </div>

            {/* Scan History */}
            <Link
              href="/history"
              className="flex items-center justify-between rounded-2xl p-5 glass-card card-hover-glow transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(124,111,255,0.1)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>Scan History</p>
                  <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>View all your past scans</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </Link>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 glass-input hover:bg-white/5"
                style={{ color: '#f0f0f4' }}
              >
                Sign Out
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-colors hover:bg-red-500/5"
                style={{ color: '#ff5a5a' }}
              >
                Delete Account
              </button>
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
          </>
        )}
      </div>
    </div>
  )
}
