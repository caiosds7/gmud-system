'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email.trim()) {
      alert('Preencha o e-mail.')
      return
    }

    if (!password.trim()) {
      alert('Preencha a senha.')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      if (!fullName.trim()) {
        alert('Preencha o nome completo.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        alert('Erro no cadastro: ' + error.message)
        setLoading(false)
        return
      }

      const user = data?.user

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: 'ENGINEER'
          })

        if (profileError) {
          alert('Usuário criado, mas houve erro ao criar perfil: ' + profileError.message)
          setLoading(false)
          return
        }
      }

      alert('Cadastro realizado com sucesso. Agora você já pode usar o sistema.')
      setLoading(false)
      router.push('/create')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert('Erro no login: ' + error.message)
      setLoading(false)
      return
    }

    const user = data?.user

    if (user) {
      const fullNameFromMetadata =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Usuário'

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullNameFromMetadata,
            role: 'ENGINEER'
          })
      }
    }

    setLoading(false)
    router.push('/create')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        background:
          'radial-gradient(circle at 12% 18%, rgba(236, 72, 153, 0.34), transparent 28%), radial-gradient(circle at 82% 10%, rgba(255,255,255,0.12), transparent 18%), radial-gradient(circle at 88% 78%, rgba(59,130,246,0.20), transparent 22%), linear-gradient(135deg, #b2177f 0%, #7c3aed 38%, #4f46e5 68%, #2563eb 100%)'
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '56px 56px 48px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '168px',
                height: '52px'
              }}
            >
<Image
  src="/arqia-logo.png"
  alt="Arqia"
  width={160}
  height={48}
/>
            </div>
          </div>

          <div style={{ marginTop: '52px', maxWidth: '620px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '54px',
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '-0.04em'
              }}
            >
              GMUD System
            </h1>

            <p
              style={{
                marginTop: '18px',
                marginBottom: 0,
                fontSize: '22px',
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.82)',
                maxWidth: '560px'
              }}
            >
              Gestão centralizada de mudanças operacionais com aprovação, comitê,
              encerramento de execução e visão executiva.
            </p>
          </div>

          <div
            style={{
              marginTop: '44px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
              gap: '16px',
              maxWidth: '620px'
            }}
          >
            <div
              style={{
                padding: '18px 20px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '8px'
                }}
              >
                Governança
              </div>
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  lineHeight: 1.4
                }}
              >
                Fluxo estruturado para criação, aprovação e acompanhamento das MOPs.
              </div>
            </div>

            <div
              style={{
                padding: '18px 20px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: '8px'
                }}
              >
                Operação
              </div>
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  lineHeight: 1.4
                }}
              >
                Registro do resultado real da janela e visão executiva da operação.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.70)'
          }}
        >
          Plataforma interna Arqia • GMUD / Gestão de Mudanças
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '470px',
            padding: '34px',
            borderRadius: '28px',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(255,255,255,0.40)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)'
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6366f1',
                marginBottom: '10px'
              }}
            >
              {mode === 'login' ? 'Acesso' : 'Cadastro'}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '32px',
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.03em'
              }}
            >
              {mode === 'login' ? 'Entrar no sistema' : 'Criar conta'}
            </h2>

            <p
              style={{
                marginTop: '12px',
                marginBottom: 0,
                fontSize: '15px',
                lineHeight: 1.5,
                color: '#6b7280'
              }}
            >
              {mode === 'login'
                ? 'Use suas credenciais para acessar o ambiente de gestão de mudanças.'
                : 'Cadastre um novo usuário para começar a utilizar o sistema.'}
            </p>
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#374151'
                }}
              >
                Nome completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
                style={{
                  width: '100%',
                  minHeight: '50px',
                  padding: '0 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '14px',
                  fontSize: '15px',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151'
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '0 14px',
                border: '1px solid #d1d5db',
                borderRadius: '14px',
                fontSize: '15px',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151'
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '0 14px',
                border: '1px solid #d1d5db',
                borderRadius: '14px',
                fontSize: '15px',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '52px',
              border: 'none',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(79, 70, 229, 0.24)'
            }}
          >
            {loading
              ? 'Processando...'
              : mode === 'login'
                ? 'Entrar'
                : 'Cadastrar'}
          </button>

          <div
            style={{
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280'
            }}
          >
            {mode === 'login' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  onClick={() => setMode('signup')}
                  style={{
                    color: '#4f46e5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  style={{
                    color: '#4f46e5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}