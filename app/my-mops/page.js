'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCurrentUserWithProfile } from '../../lib/auth'
import AuthGuard from '../../components/AuthGuard'
import AppShell from '../../components/AppShell'

function formatDateTime(value) {
  if (!value) return 'Não informado'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusBadgeStyle(status) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '32px',
    padding: '0 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap'
  }

  if (status === 'APROVADO') {
    return {
      ...base,
      background: '#dcfce7',
      color: '#166534'
    }
  }

  if (status === 'REPROVADO') {
    return {
      ...base,
      background: '#fee2e2',
      color: '#991b1b'
    }
  }

  if (status === 'EM_CORRECAO') {
    return {
      ...base,
      background: '#fef3c7',
      color: '#92400e'
    }
  }

  return {
    ...base,
    background: '#e5e7eb',
    color: '#374151'
  }
}

function pageTitleStyle() {
  return {
    fontSize: '30px',
    fontWeight: 800,
    color: '#111827',
    margin: 0,
    lineHeight: 1.1
  }
}

function pageSubtitleStyle() {
  return {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '15px'
  }
}

function panelStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '22px',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
  }
}

function summaryCardStyle(background, border) {
  return {
    background,
    border,
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  }
}

function MyMopsPageContent() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [typeFilter, setTypeFilter] = useState('TODOS')

  useEffect(() => {
    const loadAll = async () => {
      const { profile } = await getCurrentUserWithProfile()
      setProfile(profile)
      setProfileLoading(false)

      if (!profile?.id) {
        setTasks([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .eq('executor_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        alert('Erro ao carregar Minhas MOPs: ' + error.message)
        setTasks([])
        setLoading(false)
        return
      }

      setTasks(data || [])
      setLoading(false)
    }

    loadAll()
  }, [])

  const availableTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        tasks
          .map((task) => task.activity_type)
          .filter(Boolean)
      )
    )

    return uniqueTypes.sort((a, b) => a.localeCompare(b))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const term = search.trim().toLowerCase()

      const matchesSearch =
        !term ||
        task.change_number?.toLowerCase().includes(term) ||
        task.title?.toLowerCase().includes(term) ||
        task.status?.toLowerCase().includes(term) ||
        task.activity_type?.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'TODOS' || task.status === statusFilter

      const matchesType =
        typeFilter === 'TODOS' || task.activity_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [tasks, search, statusFilter, typeFilter])

  const metrics = useMemo(() => {
    const total = filteredTasks.length
    const approved = filteredTasks.filter((task) => task.status === 'APROVADO').length
    const rejected = filteredTasks.filter((task) => task.status === 'REPROVADO').length
    const correction = filteredTasks.filter((task) => task.status === 'EM_CORRECAO').length
    const draft = filteredTasks.filter((task) => task.status === 'RASCUNHO').length

    return {
      total,
      approved,
      rejected,
      correction,
      draft
    }
  }, [filteredTasks])

  if (profileLoading || loading) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Carregando Minhas MOPs...</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '24px 24px 40px'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={pageTitleStyle()}>Minhas MOPs</h1>
          <div style={pageSubtitleStyle()}>
            Acompanhe as mudanças criadas por você, filtre rapidamente e entre direto nas que exigem ação.
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <input
              type="text"
              placeholder="Buscar por número, título, status ou tipo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1 1 320px',
                minWidth: '280px',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                minWidth: '190px',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#ffffff'
              }}
            >
              <option value="TODOS">Todos os status</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="EM_CORRECAO">Em correção</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REPROVADO">Reprovado</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                minWidth: '190px',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#ffffff'
              }}
            >
              <option value="TODOS">Todos os tipos</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={summaryCardStyle('#ffffff', '1px solid #e5e7eb')}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 700 }}>Total</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#111827', marginTop: '10px', lineHeight: 1 }}>
              {metrics.total}
            </div>
          </div>

          <div style={summaryCardStyle('#ecfdf5', '1px solid #bbf7d0')}>
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>Aprovadas</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#166534', marginTop: '10px', lineHeight: 1 }}>
              {metrics.approved}
            </div>
          </div>

          <div style={summaryCardStyle('#fef2f2', '1px solid #fecaca')}>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 700 }}>Reprovadas</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#991b1b', marginTop: '10px', lineHeight: 1 }}>
              {metrics.rejected}
            </div>
          </div>

          <div style={summaryCardStyle('#fffbeb', '1px solid #fde68a')}>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 700 }}>Em correção</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#92400e', marginTop: '10px', lineHeight: 1 }}>
              {metrics.correction}
            </div>
          </div>

          <div style={summaryCardStyle('#f3f4f6', '1px solid #e5e7eb')}>
            <div style={{ fontSize: '13px', color: '#374151', fontWeight: 700 }}>Rascunho</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#374151', marginTop: '10px', lineHeight: 1 }}>
              {metrics.draft}
            </div>
          </div>
        </div>

        <div style={panelStyle()}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '18px'
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                Lista de mudanças
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>
                Visualização operacional das suas MOPs no filtro atual.
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 700 }}>
              {filteredTasks.length} item(ns)
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div
              style={{
                border: '1px dashed #cbd5e1',
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Nenhuma MOP encontrada
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Ajuste os filtros ou crie uma nova mudança para começar.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredTasks.map((task) => {
                const status = task.status || 'RASCUNHO'
                const isCorrection = status === 'EM_CORRECAO'
                const isRejected = status === 'REPROVADO'
                const isDraft = status === 'RASCUNHO'

                let background = '#fafafa'
                let borderLeft = '6px solid #e5e7eb'

                if (status === 'APROVADO') {
                  background = '#f9fffb'
                  borderLeft = '6px solid #16a34a'
                }

                if (isCorrection) {
                  background = '#fffdf5'
                  borderLeft = '6px solid #f59e0b'
                }

                if (isRejected) {
                  background = '#fffafa'
                  borderLeft = '6px solid #dc2626'
                }

                if (isDraft) {
                  background = '#fafafa'
                  borderLeft = '6px solid #9ca3af'
                }

                return (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderLeft,
                      borderRadius: '16px',
                      padding: '18px 20px',
                      background,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '18px',
                      boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: '8px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#6b7280',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {task.change_number}
                        </span>

                        <span style={getStatusBadgeStyle(status)}>
                          {status}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: '#111827',
                          lineHeight: 1.35,
                          marginBottom: '8px',
                          wordBreak: 'break-word'
                        }}
                      >
                        {task.title || 'Sem título'}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '18px',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ fontSize: '14px', color: '#475569' }}>
                          <strong>Tipo:</strong> {task.activity_type || 'Não informado'}
                        </div>

                        <div style={{ fontSize: '14px', color: '#475569' }}>
                          <strong>Criada em:</strong> {formatDateTime(task.created_at)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexShrink: 0
                      }}
                    >
                      <Link
                        href={`/task/${task.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '42px',
                          padding: '0 16px',
                          borderRadius: '10px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#2563eb',
                          fontWeight: 800,
                          textDecoration: 'none'
                        }}
                      >
                        Abrir
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function MyMopsPage() {
  return (
    <AuthGuard>
      <MyMopsPageContent />
    </AuthGuard>
  )
}