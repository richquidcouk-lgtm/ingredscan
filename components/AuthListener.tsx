'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthListener() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Listen for auth state changes (handles OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const name = session.user.user_metadata?.full_name || session.user.email
        setToast({ message: `Welcome, ${name}!`, type: 'success' })
        setTimeout(() => setToast(null), 3000)
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        setToast({ message: 'Signed out successfully', type: 'success' })
        setTimeout(() => setToast(null), 3000)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (!toast) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-fadeUp">
      <div
        className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium"
        style={{
          backgroundColor: toast.type === 'success' ? 'rgba(0,229,160,0.15)' : 'rgba(255,90,90,0.15)',
          color: toast.type === 'success' ? '#00e5a0' : '#ff5a5a',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,229,160,0.25)' : 'rgba(255,90,90,0.25)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <span>{toast.type === 'success' ? '✓' : '✗'}</span>
        {toast.message}
      </div>
    </div>
  )
}
