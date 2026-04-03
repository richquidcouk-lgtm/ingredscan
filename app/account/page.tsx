'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Profile } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#0b0b0f' }}>
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-clash), system-ui', color: '#f0f0f4' }}>
          Sign in to your account
        </h2>
        <button
          onClick={() => setShowAuth(true)}
          className="mt-4 px-6 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#7c6fff', color: '#fff' }}
        >
          Sign In
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b0f' }}>
      <header className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ backgroundColor: '#13131a' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <h1 className="text-base font-semibold" style={{ color: '#f0f0f4' }}>Account</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#13131a' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Email */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Email</p>
              <p className="text-sm font-medium mt-1" style={{ color: '#f0f0f4' }}>{user?.email}</p>
            </div>

            {/* Plan */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Plan</p>
              <div className="flex items-center gap-2 mt-1">
                {profile?.pro ? (
                  <>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#22c77e20', color: '#22c77e' }}>
                      Pro
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>
                      expires {profile.pro_expires_at ? new Date(profile.pro_expires_at).toLocaleDateString('en-GB') : '—'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#1c1c26', color: 'rgba(240,240,244,0.6)' }}>
                      Free
                    </span>
                    <Link href="/pro" className="text-xs font-medium" style={{ color: '#7c6fff' }}>
                      Upgrade →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Scan count */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Scans today</p>
              <p className="text-sm font-medium mt-1" style={{ color: '#f0f0f4' }}>
                {profile?.scan_count_today || 0}
                {!profile?.pro && <span style={{ color: 'rgba(240,240,244,0.35)' }}> / 10</span>}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#1c1c26', color: '#f0f0f4', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Sign Out
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ color: '#ff5a5a' }}
            >
              Delete Account
            </button>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                <div className="relative rounded-2xl p-6 mx-4 max-w-sm" style={{ backgroundColor: '#13131a' }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#f0f0f4' }}>Delete account?</h3>
                  <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
                    This action is permanent. All your scan history and data will be deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm"
                      style={{ backgroundColor: '#1c1c26', color: '#f0f0f4' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                      style={{ backgroundColor: '#ff5a5a20', color: '#ff5a5a' }}
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
