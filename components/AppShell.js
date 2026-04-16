'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { getCurrentUserWithProfile } from '../lib/auth'

export default function AppShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { profile } = await getCurrentUserWithProfile()
      setProfile(profile)
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Erro ao sair: ' + error.message)
      return
    }

    router.replace('/login')
  }

  const isManager = profile?.role === 'MANAGER'

  const linkStyle = (href) => {
    const active = pathname === href

    return {
      padding: '10px 16px',
      borderRadius: '14px',
      textDecoration: 'none',
      color: '#ffffff',
      background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
      border: active
        ? '1px solid rgba(255,255,255,0.18)'
        : '1px solid transparent',
      fontWeight: active ? 800 : 700,
      boxShadow: active ? '0 8px 18px rgba(255,255,255,0.08)' : 'none',
      transition: 'all 0.2s ease'
    }
  }

  if (loading) {
    return <div style={{ padding: '40px' }}>Carregando interface...</div>
  }

  return (
    <div>
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background:
            'radial-gradient(circle at 12% 18%, rgba(236, 72, 153, 0.34), transparent 26%), radial-gradient(circle at 82% 10%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 88% 78%, rgba(59,130,246,0.10), transparent 20%), linear-gradient(135deg, #c2187a 0%, #a21caf 32%, #7c3aed 62%, #5b21b6 100%)',
          padding: '18px 24px',
          boxShadow: '0 8px 24px rgba(76, 29, 149, 0.16)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1680px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
            >
              GMUD System
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.78)',
                marginTop: '4px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Gestão de Mudanças
            </div>
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {isManager && (
              <Link href="/dashboard" style={linkStyle('/dashboard')}>
                Dashboard
              </Link>
            )}

            <Link href="/create" style={linkStyle('/create')}>
              Criar MOP
            </Link>

            <Link href="/my-mops" style={linkStyle('/my-mops')}>
              Minhas MOPs
            </Link>

            <Link href="/list" style={linkStyle('/list')}>
              Lista
            </Link>

            {isManager && (
              <Link href="/committee" style={linkStyle('/committee')}>
                Comitê
              </Link>
            )}

            {isManager && (
              <Link href="/committee-pending" style={linkStyle('/committee-pending')}>
                Pendências
              </Link>
            )}
          </nav>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '10px 12px 10px 14px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#ffffff',
              minHeight: '64px'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: '0'
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px'
                }}
              >
                {profile?.full_name || 'Não informado'}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.76)',
                  marginTop: '4px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                {profile?.role || 'Não informado'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                minHeight: '42px',
                padding: '0 16px',
                border: 'none',
                background: '#ef4444',
                color: '#ffffff',
                cursor: 'pointer',
                borderRadius: '12px',
                fontWeight: 800,
                boxShadow: '0 8px 18px rgba(239, 68, 68, 0.28)',
                flexShrink: 0
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          width: '100%'
        }}
      >
        {children}
      </main>
    </div>
  )
}