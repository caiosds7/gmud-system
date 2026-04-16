'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

function isSameMonth(dateValue) {
  if (!dateValue) return false

  const date = new Date(dateValue)
  const now = new Date()

  if (Number.isNaN(date.getTime())) return false

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

function getReferenceDate(task) {
  return task.start_time || task.created_at
}

function monthKey(dateValue) {
  if (!dateValue) return null

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function monthLabelFromKey(key) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)

  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit'
  })
}

function pageTitleStyle() {
  return {
    fontSize: '34px',
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

function sectionHeaderStyle() {
  return {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '6px'
  }
}

function sectionSubheaderStyle() {
  return {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '18px'
  }
}

function kpiCardStyle(background, border) {
  return {
    background,
    border,
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  }
}

function StatusDistributionRow({ label, value, total, color, description }) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '8px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{label}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{description}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{percentage.toFixed(1)}%</div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '12px',
          background: '#e5e7eb',
          borderRadius: '999px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '12px',
            background: color,
            borderRadius: '999px'
          }}
        />
      </div>
    </div>
  )
}

function OutcomeStackedChart({ series }) {
  const colors = {
    clean: '#16a34a',
    partial: '#2563eb',
    rollback: '#f59e0b',
    failure: '#dc2626'
  }

  const rows = series.map((item) => {
    const total = item.clean + item.partial + item.rollback + item.failure
    const cleanPct = total > 0 ? (item.clean / total) * 100 : 0
    const partialPct = total > 0 ? (item.partial / total) * 100 : 0
    const rollbackPct = total > 0 ? (item.rollback / total) * 100 : 0
    const failurePct = total > 0 ? (item.failure / total) * 100 : 0

    return {
      ...item,
      total,
      cleanPct,
      partialPct,
      rollbackPct,
      failurePct,
      successPct: cleanPct + partialPct
    }
  })

  return (
    <div style={panelStyle()}>
      <div style={sectionHeaderStyle()}>Qualidade das execuções por mês</div>
      <div style={sectionSubheaderStyle()}>
        Comparação percentual entre sucesso limpo, sucesso parcial, rollback e falha por mês.
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {rows.length === 0 ? (
          <div
            style={{
              padding: '24px',
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              color: '#6b7280',
              background: '#f8fafc'
            }}
          >
            Nenhuma execução encontrada no período filtrado.
          </div>
        ) : (
          rows.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px minmax(320px, 1fr) 90px',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '4px'
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}
                >
                  {item.total} exec.
                </div>
              </div>

              <div>
                <div
                  title={`${item.label}
Total: ${item.total}
Sucesso limpo: ${item.clean} (${item.cleanPct.toFixed(1)}%)
Sucesso parcial: ${item.partial} (${item.partialPct.toFixed(1)}%)
Rollback: ${item.rollback} (${item.rollbackPct.toFixed(1)}%)
Falha: ${item.failure} (${item.failurePct.toFixed(1)}%)`}
                  style={{
                    width: '100%',
                    height: '26px',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '999px',
                    background: '#e5e7eb',
                    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)'
                  }}
                >
                  {item.cleanPct > 0 && (
                    <div
                      style={{
                        width: `${item.cleanPct}%`,
                        background: colors.clean
                      }}
                    />
                  )}

                  {item.partialPct > 0 && (
                    <div
                      style={{
                        width: `${item.partialPct}%`,
                        background: colors.partial
                      }}
                    />
                  )}

                  {item.rollbackPct > 0 && (
                    <div
                      style={{
                        width: `${item.rollbackPct}%`,
                        background: colors.rollback
                      }}
                    />
                  )}

                  {item.failurePct > 0 && (
                    <div
                      style={{
                        width: `${item.failurePct}%`,
                        background: colors.failure
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                    Limpo {item.cleanPct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>
                    Parcial {item.partialPct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>
                    Rollback {item.rollbackPct.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700 }}>
                    Falha {item.failurePct.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: item.successPct >= 90
                      ? '#166534'
                      : item.successPct >= 75
                        ? '#1d4ed8'
                        : item.successPct >= 60
                          ? '#b45309'
                          : '#b91c1c'
                  }}
                >
                  {item.successPct.toFixed(0)}%
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: 700
                  }}
                >
                  sucesso
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '18px',
          flexWrap: 'wrap',
          marginTop: '18px'
        }}
      >
        {[
          { label: 'Concluída sem falha', color: colors.clean },
          { label: 'Concluída parcialmente', color: colors.partial },
          { label: 'Rollback', color: colors.rollback },
          { label: 'Falha', color: colors.failure }
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '999px',
                background: item.color,
                display: 'inline-block'
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardPageContent() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('180')

  useEffect(() => {
    const loadAll = async () => {
      const { profile } = await getCurrentUserWithProfile()
      setProfile(profile)
      setProfileLoading(false)

      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert('Erro ao carregar dashboard: ' + error.message)
        setLoadingTasks(false)
        return
      }

      setTasks(data || [])
      setLoadingTasks(false)
    }

    loadAll()
  }, [])

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase()

    let list = [...tasks]

    if (period !== 'all') {
      const days = Number(period)
      const limitDate = new Date()
      limitDate.setDate(limitDate.getDate() - days)

      list = list.filter((task) => {
        const ref = getReferenceDate(task)
        if (!ref) return false
        const refDate = new Date(ref)
        return !Number.isNaN(refDate.getTime()) && refDate >= limitDate
      })
    }

    if (!term) return list

    return list.filter((task) => {
      return (
        task.change_number?.toLowerCase().includes(term) ||
        task.title?.toLowerCase().includes(term) ||
        task.status?.toLowerCase().includes(term) ||
        task.activity_type?.toLowerCase().includes(term) ||
        task.responsible_name?.toLowerCase().includes(term) ||
        task.committee_responsible_name?.toLowerCase().includes(term)
      )
    })
  }, [tasks, search, period])

  const metrics = useMemo(() => {
    const total = filteredTasks.length
    const approved = filteredTasks.filter((t) => t.status === 'APROVADO').length
    const rejected = filteredTasks.filter((t) => t.status === 'REPROVADO').length
    const correction = filteredTasks.filter((t) => t.status === 'EM_CORRECAO').length
    const draft = filteredTasks.filter((t) => t.status === 'RASCUNHO').length
    const createdThisMonth = filteredTasks.filter((t) => isSameMonth(t.created_at)).length
    const approvedThisMonth = filteredTasks.filter(
      (t) => t.status === 'APROVADO' && isSameMonth(t.created_at)
    ).length
    const pendingManagerAction = draft + correction

    const successCount = filteredTasks.filter(
      (t) =>
        t.operational_result === 'SUCESSO_LIMPO' ||
        t.operational_result === 'SUCESSO_PARCIAL'
    ).length

    const rollbackCount = filteredTasks.filter(
      (t) => t.operational_result === 'ROLLBACK'
    ).length

    const failureCount = filteredTasks.filter(
      (t) => t.operational_result === 'FALHA'
    ).length

    const totalExecuted = successCount + rollbackCount + failureCount

    const successRate = totalExecuted > 0 ? (successCount / totalExecuted) * 100 : 0
    const rollbackRate = totalExecuted > 0 ? (rollbackCount / totalExecuted) * 100 : 0
    const failureRate = totalExecuted > 0 ? (failureCount / totalExecuted) * 100 : 0

    return {
      total,
      approved,
      rejected,
      correction,
      draft,
      createdThisMonth,
      approvedThisMonth,
      pendingManagerAction,
      successCount,
      rollbackCount,
      failureCount,
      totalExecuted,
      successRate,
      rollbackRate,
      failureRate
    }
  }, [filteredTasks])

  const trendSeries = useMemo(() => {
    const grouped = {}

    filteredTasks.forEach((task) => {
      const key = monthKey(getReferenceDate(task))
      if (!key) return

      if (!grouped[key]) {
        grouped[key] = {
          key,
          label: monthLabelFromKey(key),
          clean: 0,
          partial: 0,
          rollback: 0,
          failure: 0
        }
      }

      const result = task.operational_result

      if (result === 'SUCESSO_LIMPO') grouped[key].clean += 1
      if (result === 'SUCESSO_PARCIAL') grouped[key].partial += 1
      if (result === 'ROLLBACK') grouped[key].rollback += 1
      if (result === 'FALHA') grouped[key].failure += 1
    })

    return Object.values(grouped)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
  }, [filteredTasks])

  const statusDistribution = useMemo(() => {
    const total = filteredTasks.length

    return {
      total,
      rows: [
        {
          label: 'Rascunho',
          value: filteredTasks.filter((task) => task.status === 'RASCUNHO').length,
          color: '#6b7280',
          description: 'Ainda não concluídas / aguardando avanço.'
        },
        {
          label: 'Em correção',
          value: filteredTasks.filter((task) => task.status === 'EM_CORRECAO').length,
          color: '#f59e0b',
          description: 'Demandaram ajuste após análise ou execução.'
        },
        {
          label: 'Aprovadas',
          value: filteredTasks.filter((task) => task.status === 'APROVADO').length,
          color: '#16a34a',
          description: 'Encerradas com aprovação formal.'
        },
        {
          label: 'Reprovadas',
          value: filteredTasks.filter((task) => task.status === 'REPROVADO').length,
          color: '#dc2626',
          description: 'Encerradas com falha ou negativa formal.'
        }
      ]
    }
  }, [filteredTasks])

  const rankingByResponsible = useMemo(() => {
    const grouped = {}

    filteredTasks.forEach((task) => {
      const key = task.responsible_name || task.committee_responsible_name || 'Não informado'
      grouped[key] = (grouped[key] || 0) + 1
    })

    const rows = Object.entries(grouped)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const max = Math.max(...rows.map((row) => row.count), 1)

    return { rows, max }
  }, [filteredTasks])

  const latestTasks = useMemo(() => {
    return filteredTasks.slice(0, 8)
  }, [filteredTasks])

  const pendingTasks = useMemo(() => {
    return filteredTasks
      .filter((task) => task.status === 'RASCUNHO' || task.status === 'EM_CORRECAO')
      .sort((a, b) => {
        const aDate = new Date(getReferenceDate(a) || 0).getTime()
        const bDate = new Date(getReferenceDate(b) || 0).getTime()
        return aDate - bDate
      })
      .slice(0, 6)
  }, [filteredTasks])

  if (profileLoading || loadingTasks) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Carregando dashboard...</div>
      </AppShell>
    )
  }

  if (!profile || profile.role !== 'MANAGER') {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            Acesso negado
          </h1>
          <p style={{ color: '#6b7280' }}>
            Somente usuários com perfil MANAGER podem acessar o dashboard.
          </p>
        </div>
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
          <h1 style={pageTitleStyle()}>Dashboard Executivo GMUD</h1>
          <div style={pageSubtitleStyle()}>
            Painel executivo com foco em volume, status, produtividade e execução operacional.
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: '20px' }}>
          <div style={sectionHeaderStyle()}>Filtros executivos</div>
          <div style={sectionSubheaderStyle()}>
            Filtre por período e pesquise rapidamente qualquer mudança.
          </div>

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
              placeholder="Buscar por número, título, tipo, status ou responsável"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1 1 420px',
                minWidth: '280px',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              {[
                { value: '30', label: '30 dias' },
                { value: '90', label: '90 dias' },
                { value: '180', label: '180 dias' },
                { value: 'all', label: 'Tudo' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPeriod(item.value)}
                  style={{
                    border: period === item.value ? 'none' : '1px solid #d1d5db',
                    borderRadius: '999px',
                    minHeight: '42px',
                    padding: '0 16px',
                    background: period === item.value ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : '#ffffff',
                    color: period === item.value ? '#ffffff' : '#374151',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}
        >
          <div style={kpiCardStyle('#ffffff', '1px solid #e5e7eb')}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 700 }}>Total de TPs</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#111827', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.total}
            </div>
          </div>

          <div style={kpiCardStyle('#ecfdf5', '1px solid #bbf7d0')}>
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>Aprovadas</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#166534', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.approved}
            </div>
          </div>

          <div style={kpiCardStyle('#fef2f2', '1px solid #fecaca')}>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 700 }}>Reprovadas</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#991b1b', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.rejected}
            </div>
          </div>

          <div style={kpiCardStyle('#fffbeb', '1px solid #fde68a')}>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 700 }}>Em correção</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#92400e', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.correction}
            </div>
          </div>

          <div style={kpiCardStyle('#f3f4f6', '1px solid #e5e7eb')}>
            <div style={{ fontSize: '13px', color: '#374151', fontWeight: 700 }}>Rascunho</div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#374151', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.draft}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={kpiCardStyle('#eff6ff', '1px solid #bfdbfe')}>
            <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: 700 }}>Criadas no mês</div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#1d4ed8', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.createdThisMonth}
            </div>
          </div>

          <div style={kpiCardStyle('#ecfeff', '1px solid #a5f3fc')}>
            <div style={{ fontSize: '13px', color: '#155e75', fontWeight: 700 }}>Aprovadas no mês</div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#155e75', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.approvedThisMonth}
            </div>
          </div>

          <div style={kpiCardStyle('#eef2ff', '1px solid #c7d2fe')}>
            <div style={{ fontSize: '13px', color: '#4338ca', fontWeight: 700 }}>
              Taxa de sucesso operacional
            </div>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 800,
                color: '#16a34a',
                marginTop: '10px',
                lineHeight: 1,
                letterSpacing: '-0.5px'
              }}
            >
              {metrics.successRate.toFixed(1)}%
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280',
                lineHeight: 1.4
              }}
            >
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                {metrics.rollbackRate.toFixed(1)}% rollback
              </span>
              {' • '}
              <span style={{ color: '#dc2626', fontWeight: 700 }}>
                {metrics.failureRate.toFixed(1)}% falha
              </span>
            </div>
          </div>

          <div style={kpiCardStyle('#fff7ed', '1px solid #fed7aa')}>
            <div style={{ fontSize: '13px', color: '#9a3412', fontWeight: 700 }}>Pendentes de ação</div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#9a3412', marginTop: '10px', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {metrics.pendingManagerAction}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          <OutcomeStackedChart series={trendSeries} />

          <div style={panelStyle()}>
            <div style={sectionHeaderStyle()}>Distribuição por status</div>
            <div style={sectionSubheaderStyle()}>
              Leitura visual do pipeline atual das GMUDs.
            </div>

            {statusDistribution.rows.map((row) => (
              <StatusDistributionRow
                key={row.label}
                label={row.label}
                value={row.value}
                total={statusDistribution.total}
                color={row.color}
                description={row.description}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          <div style={panelStyle()}>
            <div style={sectionHeaderStyle()}>Pendências de ação do gerente</div>
            <div style={sectionSubheaderStyle()}>
              Itens que exigem decisão ou acompanhamento imediato.
            </div>

            {pendingTasks.length === 0 ? (
              <div style={{ color: '#6b7280' }}>Nenhuma pendência identificada.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      background: '#fff7ed',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '18px'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: '#9a3412', fontWeight: 700, marginBottom: '6px' }}>
                        {task.change_number}
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        {task.title}
                      </div>

                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {task.responsible_name || task.committee_responsible_name || 'Não informado'}
                      </div>
                    </div>

                    <Link
                      href={`/task/${task.id}`}
                      style={{
                        minHeight: '40px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        background: '#dc2626',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      Resolver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={panelStyle()}>
            <div style={sectionHeaderStyle()}>Ranking por responsável</div>
            <div style={sectionSubheaderStyle()}>
              Volume de mudanças por responsável no período filtrado.
            </div>

            {rankingByResponsible.rows.length === 0 ? (
              <div style={{ color: '#6b7280' }}>Nenhum dado encontrado.</div>
            ) : (
              rankingByResponsible.rows.map((row) => {
                const percentage = rankingByResponsible.max > 0 ? (row.count / rankingByResponsible.max) * 100 : 0

                return (
                  <div key={row.label} style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{row.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{row.count}</div>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '12px',
                        background: '#e5e7eb',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '12px',
                          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                          borderRadius: '999px'
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div style={panelStyle()}>
          <div style={sectionHeaderStyle()}>Últimas tarefas programadas</div>
          <div style={sectionSubheaderStyle()}>
            Mudanças mais recentes cadastradas no período filtrado.
          </div>

          {latestTasks.length === 0 ? (
            <div style={{ color: '#6b7280' }}>Nenhuma tarefa encontrada.</div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {latestTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '18px'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 700, marginBottom: '6px' }}>
                      {task.change_number}
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                      {task.title}
                    </div>

                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>
                      {task.responsible_name || task.committee_responsible_name || 'Não informado'}
                    </div>

                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {formatDateTime(task.created_at)}
                    </div>
                  </div>

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
                      fontWeight: 700,
                      textDecoration: 'none',
                      flexShrink: 0
                    }}
                  >
                    Abrir
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardPageContent />
    </AuthGuard>
  )
}