'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AuthGuard from '../../components/AuthGuard'
import AppShell from '../../components/AppShell'
import { getCurrentUserWithProfile } from '../../lib/auth'

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getExecutionLabel(status) {
  switch (status) {
    case 'CONCLUIDO':
      return 'OK'
    case 'ROLLBACK':
      return 'ROLLBACK'
    case 'REPROVADO':
      return 'NOK'
    default:
      return '-'
  }
}

function getApprovalLabel(statusOrDecision) {
  switch (statusOrDecision) {
    case 'APROVADO':
      return 'OK'
    case 'REPROVADO':
      return 'NOK'
    case 'EM_CORRECAO':
      return 'CORREÇÃO'
    case 'CONCLUIDO':
      return 'OK'
    case 'ROLLBACK':
      return 'OK'
    case 'RASCUNHO':
    default:
      return 'PENDENTE'
  }
}

function getDecisionBadgeStyle(decision) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    background: decision
      ? decision === 'APROVADO'
        ? '#dcfce7'
        : decision === 'REPROVADO'
          ? '#fee2e2'
          : '#fef3c7'
      : '#e5e7eb',
    color: decision
      ? decision === 'APROVADO'
        ? '#166534'
        : decision === 'REPROVADO'
          ? '#991b1b'
          : '#92400e'
      : '#374151'
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

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
  }
}

function sectionTitleStyle() {
  return {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '16px'
  }
}

function fieldLabelStyle() {
  return {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '8px'
  }
}

function inputStyle() {
  return {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#111827',
    boxSizing: 'border-box',
    outline: 'none'
  }
}

function smallStatCardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)'
  }
}

function smallStatLabelStyle() {
  return {
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px'
  }
}

function smallStatValueStyle() {
  return {
    fontSize: '22px',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.1
  }
}

function tableHeaderStyle() {
  return {
    background: '#4b74c2',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    padding: '10px 8px',
    border: '1px solid #dbe4f5',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
}

function tableCellStyle(extra = {}) {
  return {
    border: '1px solid #e5e7eb',
    padding: '8px',
    fontSize: '13px',
    color: '#111827',
    verticalAlign: 'middle',
    background: '#edf3ff',
    ...extra
  }
}

function actionButtonStyle(background, color = '#ffffff') {
  return {
    border: 'none',
    borderRadius: '8px',
    height: '30px',
    padding: '0 10px',
    background,
    color,
    fontWeight: 700,
    fontSize: '11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }
}

function PreAgendaTable({ tasks }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid #dbe4f5',
        borderRadius: '14px',
        width: '100%'
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '1100px',
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          <col style={{ width: '120px' }} />
          <col style={{ width: '420px' }} />
          <col style={{ width: '180px' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '220px' }} />
        </colgroup>

        <thead>
          <tr>
            <th style={tableHeaderStyle()}>Tipo</th>
            <th style={tableHeaderStyle()}>Descrição</th>
            <th style={tableHeaderStyle()}>Responsável</th>
            <th style={tableHeaderStyle()}>Data</th>
            <th style={tableHeaderStyle()}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  ...tableCellStyle({
                    textAlign: 'center',
                    background: '#ffffff',
                    padding: '24px',
                    color: '#6b7280'
                  })
                }}
              >
                Nenhuma GMUD pronta para comitê.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id}>
                <td style={tableCellStyle({ textAlign: 'center' })}>
                  {task.activity_type || '-'}
                </td>

                <td style={tableCellStyle()}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', wordBreak: 'break-word', lineHeight: 1.35 }}>
                    {task.title || 'Sem título'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {task.change_number || '-'}
                  </div>
                </td>

                <td style={tableCellStyle({ textAlign: 'center' })}>
                  {task.responsible_name || '-'}
                </td>

                <td style={tableCellStyle({ textAlign: 'center' })}>
                  {formatDateTime(task.start_time || task.created_at)}
                </td>

                <td style={tableCellStyle()}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link
                      href={`/task/${task.id}`}
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '30px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        fontSize: '11px',
                        border: '1px solid #93c5fd',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Abrir
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function CommitteeRoundTable({
  items,
  processingId,
  updateItemField,
  registerDecision,
  readOnly = false
}) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid #dbe4f5',
        borderRadius: '14px',
        width: '100%'
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '1500px',
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          <col style={{ width: '110px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '360px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '140px' }} />
          <col style={{ width: '260px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '260px' }} />
        </colgroup>

        <thead>
          <tr>
            <th style={tableHeaderStyle()}>Tipo</th>
            <th style={tableHeaderStyle()}>Aprovação</th>
            <th style={tableHeaderStyle()}>Descrição</th>
            <th style={tableHeaderStyle()}>Responsável</th>
            <th style={tableHeaderStyle()}>Data</th>
            <th style={tableHeaderStyle()}>Observações</th>
            <th style={tableHeaderStyle()}>Impacto cliente</th>
            <th style={tableHeaderStyle()}>Rollback</th>
            <th style={tableHeaderStyle()}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  ...tableCellStyle({
                    textAlign: 'center',
                    background: '#ffffff',
                    padding: '24px',
                    color: '#6b7280'
                  })
                }}
              >
                Nenhuma GMUD encontrada.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const task = item.change_requests
              const isProcessing = processingId === item.id

              return (
                <tr key={item.id}>
                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {task?.activity_type || '-'}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    <span style={getDecisionBadgeStyle(item.decision)}>
                      {item.decision ? getApprovalLabel(item.decision) : 'PENDENTE'}
                    </span>
                  </td>

                  <td style={tableCellStyle()}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', wordBreak: 'break-word', lineHeight: 1.35 }}>
                      {task?.title || 'Sem título'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {task?.change_number || '-'}
                    </div>
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    <div style={{ wordBreak: 'break-word', lineHeight: 1.35 }}>
                      {task?.responsible_name || '-'}
                    </div>
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    <div style={{ lineHeight: 1.35 }}>
                      {formatDateTime(task?.start_time || task?.created_at)}
                    </div>
                  </td>

                  <td style={tableCellStyle()}>
                    {readOnly ? (
                      <div
                        style={{
                          minHeight: '72px',
                          padding: '10px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          fontSize: '13px',
                          lineHeight: 1.35,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.notes || '-'}
                      </div>
                    ) : (
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => updateItemField(item.id, 'notes', e.target.value)}
                        rows={3}
                        placeholder="Observação curta do comitê"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          resize: 'vertical',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          minHeight: '72px'
                        }}
                      />
                    )}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {readOnly ? (
                      <div
                        style={{
                          padding: '9px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          background: '#ffffff',
                          fontSize: '13px'
                        }}
                      >
                        {item.client_impact_flag === 'S'
                          ? 'Sim'
                          : item.client_impact_flag === 'NA'
                            ? 'N/A'
                            : 'Não'}
                      </div>
                    ) : (
                      <select
                        value={item.client_impact_flag || 'N'}
                        onChange={(e) => updateItemField(item.id, 'client_impact_flag', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          background: '#ffffff',
                          fontSize: '13px'
                        }}
                      >
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                        <option value="NA">N/A</option>
                      </select>
                    )}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {readOnly ? (
                      <div
                        style={{
                          padding: '9px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          background: '#ffffff',
                          fontSize: '13px'
                        }}
                      >
                        {item.rollback_flag === 'S'
                          ? 'Sim'
                          : item.rollback_flag === 'NA'
                            ? 'N/A'
                            : 'Não'}
                      </div>
                    ) : (
                      <select
                        value={item.rollback_flag || 'N'}
                        onChange={(e) => updateItemField(item.id, 'rollback_flag', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          background: '#ffffff',
                          fontSize: '13px'
                        }}
                      >
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                        <option value="NA">N/A</option>
                      </select>
                    )}
                  </td>

                  <td style={tableCellStyle()}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Link
                        href={`/task/${task?.id}`}
                        target="_blank"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '30px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          fontSize: '11px',
                          border: '1px solid #93c5fd',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Abrir
                      </Link>

                      {readOnly ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '30px',
                            padding: '0 10px',
                            borderRadius: '8px',
                            background: '#e5e7eb',
                            color: '#374151',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}
                        >
                          Decidida
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => registerDecision(item, 'APROVADO')}
                            style={actionButtonStyle('#16a34a')}
                          >
                            Aprovar
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => registerDecision(item, 'REPROVADO')}
                            style={actionButtonStyle('#dc2626')}
                          >
                            Reprovar
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => registerDecision(item, 'EM_CORRECAO')}
                            style={actionButtonStyle('#f59e0b', '#111827')}
                          >
                            Correção
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function PreviousItemsTable({ items }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid #dbe4f5',
        borderRadius: '14px',
        width: '100%'
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '1600px',
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          <col style={{ width: '90px' }} />
          <col style={{ width: '110px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '420px' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '220px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '100px' }} />
        </colgroup>

        <thead>
          <tr>
            <th style={tableHeaderStyle()}>Execução</th>
            <th style={tableHeaderStyle()}>Tipo</th>
            <th style={tableHeaderStyle()}>Aprovação</th>
            <th style={tableHeaderStyle()}>Descrição</th>
            <th style={tableHeaderStyle()}>Responsável</th>
            <th style={tableHeaderStyle()}>Data da análise</th>
            <th style={tableHeaderStyle()}>Observações</th>
            <th style={tableHeaderStyle()}>Impacto cliente</th>
            <th style={tableHeaderStyle()}>Rollback</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  ...tableCellStyle({
                    textAlign: 'center',
                    background: '#ffffff',
                    padding: '24px',
                    color: '#6b7280'
                  })
                }}
              >
                Nenhuma GMUD anterior nos últimos 15 dias.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const task = item.change_requests

              return (
                <tr key={item.id}>
                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {getExecutionLabel(task?.status)}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {task?.activity_type || '-'}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {getApprovalLabel(item.decision)}
                  </td>

                  <td style={tableCellStyle()}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', wordBreak: 'break-word', lineHeight: 1.35 }}>
                      {task?.title || 'Sem título'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {task?.change_number || '-'}
                    </div>
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {task?.responsible_name || '-'}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {formatDateTime(item.decided_at)}
                  </td>

                  <td style={tableCellStyle()}>
                    <div
                      style={{
                        minHeight: '72px',
                        padding: '10px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '13px',
                        lineHeight: 1.35,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {item.notes || '-'}
                    </div>
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {item.client_impact_flag === 'S'
                      ? 'Sim'
                      : item.client_impact_flag === 'NA'
                        ? 'N/A'
                        : 'Não'}
                  </td>

                  <td style={tableCellStyle({ textAlign: 'center' })}>
                    {item.rollback_flag === 'S'
                      ? 'Sim'
                      : item.rollback_flag === 'NA'
                        ? 'N/A'
                        : 'Não'}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function CommitteePageContent() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const [activeRound, setActiveRound] = useState(null)
  const [roundItems, setRoundItems] = useState([])
  const [draftMops, setDraftMops] = useState([])
  const [previousItems, setPreviousItems] = useState([])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [typeFilter, setTypeFilter] = useState('TODOS')

  const loadProfile = async () => {
    const { profile } = await getCurrentUserWithProfile()
    setProfile(profile)
    setProfileLoading(false)
  }

  const fetchActiveRound = async () => {
    const { data, error } = await supabase
      .from('committee_rounds')
      .select('*')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      alert('Erro ao carregar rodada ativa: ' + error.message)
      setActiveRound(null)
      return null
    }

    const round = data?.[0] || null
    setActiveRound(round)
    return round
  }

  const fetchRoundItems = async (roundId) => {
    if (!roundId) {
      setRoundItems([])
      return
    }

    const { data, error } = await supabase
      .from('committee_round_items')
      .select(`
        *,
        change_requests (*)
      `)
      .eq('round_id', roundId)
      .order('created_at', { ascending: true })

    if (error) {
      alert('Erro ao carregar itens da rodada: ' + error.message)
      setRoundItems([])
      return
    }

    setRoundItems(data || [])
  }

  const fetchDraftMops = async () => {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('status', 'RASCUNHO')
      .order('created_at', { ascending: true })

    if (error) {
      alert('Erro ao carregar pré-pauta: ' + error.message)
      setDraftMops([])
      return
    }

    setDraftMops(data || [])
  }

  const fetchPreviousItems = async (currentRoundId = null) => {
    const now = new Date()
    const limitDate = new Date(now)
    limitDate.setDate(limitDate.getDate() - 15)

    const { data, error } = await supabase
      .from('committee_round_items')
      .select(`
        *,
        change_requests (*),
        committee_rounds (*)
      `)
      .not('decision', 'is', null)
      .gte('decided_at', limitDate.toISOString())
      .order('decided_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar histórico anterior: ' + error.message)
      setPreviousItems([])
      return
    }

    setPreviousItems((data || []).filter((item) => item.round_id !== currentRoundId))
  }

  const loadAll = async () => {
    setLoading(true)
    await loadProfile()
    const round = await fetchActiveRound()
    await fetchRoundItems(round?.id || null)
    await fetchDraftMops()
    await fetchPreviousItems(round?.id || null)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const createRound = async () => {
    if (activeRound) {
      alert('Já existe uma rodada aberta. Encerre a rodada atual antes de criar outra.')
      return
    }

    if (draftMops.length === 0) {
      alert('Não há GMUDs em rascunho para formar uma rodada.')
      return
    }

    const now = new Date()
    const label = `Comitê GMUD - ${now.toLocaleDateString('pt-BR')}`

    const { data: roundData, error: roundError } = await supabase
      .from('committee_rounds')
      .insert({
        label,
        status: 'OPEN'
      })
      .select()
      .single()

    if (roundError) {
      alert('Erro ao criar rodada: ' + roundError.message)
      return
    }

    const items = draftMops.map((mop) => ({
      round_id: roundData.id,
      change_request_id: mop.id,
      client_impact_flag: 'N',
      rollback_flag: 'N'
    }))

    const { error: itemsError } = await supabase
      .from('committee_round_items')
      .insert(items)

    if (itemsError) {
      alert('Rodada criada, mas houve erro ao gerar itens da pauta: ' + itemsError.message)
    }

    await loadAll()
  }

  const closeRound = async () => {
    if (!activeRound) {
      alert('Não existe rodada aberta.')
      return
    }

    const { error } = await supabase
      .from('committee_rounds')
      .update({
        status: 'CLOSED',
        closed_at: new Date().toISOString()
      })
      .eq('id', activeRound.id)

    if (error) {
      alert('Erro ao encerrar rodada: ' + error.message)
      return
    }

    await loadAll()
  }

  const updateItemField = (itemId, field, value) => {
    setRoundItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('TODOS')
    setTypeFilter('TODOS')
  }

  const availableTypes = useMemo(() => {
    const source = activeRound ? roundItems : draftMops
    const values = Array.from(
      new Set(
        source
          .map((item) => (activeRound ? item.change_requests?.activity_type : item.activity_type))
          .filter(Boolean)
      )
    )
    return values.sort()
  }, [roundItems, draftMops, activeRound])

  const visibleRoundItems = useMemo(() => {
    return roundItems.filter((item) => {
      const task = item.change_requests
      const term = search.toLowerCase().trim()

      const matchesSearch =
        !term ||
        task?.change_number?.toLowerCase().includes(term) ||
        task?.title?.toLowerCase().includes(term) ||
        task?.activity_type?.toLowerCase().includes(term) ||
        task?.responsible_name?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)

      const effectiveStatus = item.decision || 'RASCUNHO'

      const matchesStatus =
        statusFilter === 'TODOS' ? true : effectiveStatus === statusFilter

      const matchesType =
        typeFilter === 'TODOS' ? true : task?.activity_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [roundItems, search, statusFilter, typeFilter])

  const visibleDraftMops = useMemo(() => {
    return draftMops.filter((task) => {
      const term = search.toLowerCase().trim()

      const matchesSearch =
        !term ||
        task.change_number?.toLowerCase().includes(term) ||
        task.title?.toLowerCase().includes(term) ||
        task.activity_type?.toLowerCase().includes(term) ||
        task.responsible_name?.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'TODOS' ? true : statusFilter === 'RASCUNHO'

      const matchesType =
        typeFilter === 'TODOS' ? true : task.activity_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [draftMops, search, statusFilter, typeFilter])

  const pendingItems = useMemo(() => {
    return visibleRoundItems.filter((item) => !item.decision)
  }, [visibleRoundItems])

  const analyzedItems = useMemo(() => {
    return visibleRoundItems
      .filter((item) => !!item.decision)
      .sort((a, b) => {
        const aDate = a.decided_at ? new Date(a.decided_at).getTime() : 0
        const bDate = b.decided_at ? new Date(b.decided_at).getTime() : 0
        return bDate - aDate
      })
  }, [visibleRoundItems])

  const summary = useMemo(() => {
    if (!activeRound) {
      return {
        ready: visibleDraftMops.length,
        previous: previousItems.length
      }
    }

    return {
      analyzed: analyzedItems.length,
      correction: analyzedItems.filter((item) => item.decision === 'EM_CORRECAO').length,
      approved: analyzedItems.filter((item) => item.decision === 'APROVADO').length,
      rejected: analyzedItems.filter((item) => item.decision === 'REPROVADO').length
    }
  }, [activeRound, visibleDraftMops, previousItems, analyzedItems])

  const exportResult = async () => {
    const analyzedRows = analyzedItems.map((item) => {
      const task = item.change_requests
      return `
        <tr>
          <td>${escapeHtml(task?.activity_type || '-')}</td>
          <td>${escapeHtml(getApprovalLabel(item.decision))}</td>
          <td style="text-align:left;">${escapeHtml(task?.title || '-')}</td>
          <td>${escapeHtml(task?.responsible_name || '-')}</td>
          <td>${escapeHtml(formatDateTime(task?.start_time || task?.created_at))}</td>
          <td style="text-align:left;">${escapeHtml(item.notes || '-')}</td>
        </tr>
      `
    }).join('')

    const previousRows = previousItems.map((item) => {
      const task = item.change_requests
      return `
        <tr>
          <td>${escapeHtml(getExecutionLabel(task?.status))}</td>
          <td>${escapeHtml(task?.activity_type || '-')}</td>
          <td>${escapeHtml(getApprovalLabel(item.decision))}</td>
          <td style="text-align:left;">${escapeHtml(task?.title || '-')}</td>
          <td>${escapeHtml(task?.responsible_name || '-')}</td>
          <td>${escapeHtml(formatDateTime(item.decided_at))}</td>
          <td style="text-align:left;">${escapeHtml(item.notes || '-')}</td>
          <td>${escapeHtml(item.client_impact_flag || 'N')}</td>
          <td>${escapeHtml(item.rollback_flag || 'N')}</td>
        </tr>
      `
    }).join('')

    const html = `
      <html>
        <head>
          <title>Resultado do Comitê GMUD</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 24px;
              color: #111827;
            }
            h1 {
              color: #1f4e79;
              font-size: 32px;
              margin-bottom: 8px;
            }
            h2 {
              color: #1f4e79;
              font-size: 18px;
              margin-top: 28px;
              margin-bottom: 10px;
            }
            .meta {
              color: #6b7280;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .summary {
              display: flex;
              gap: 12px;
              margin-bottom: 18px;
              flex-wrap: wrap;
            }
            .summary-box {
              border: 1px solid #d1d5db;
              border-radius: 12px;
              padding: 10px 14px;
              min-width: 140px;
            }
            .summary-label {
              color: #6b7280;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 800;
              margin-bottom: 6px;
            }
            .summary-value {
              color: #111827;
              font-size: 24px;
              font-weight: 800;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 24px;
            }
            th {
              background: #4b74c2;
              color: #ffffff;
              font-size: 13px;
              font-weight: 700;
              border: 1px solid #d8e3f8;
              padding: 8px 6px;
              text-align: center;
            }
            td {
              background: #dfe8f8;
              border: 1px solid #ffffff;
              padding: 8px 6px;
              font-size: 13px;
              text-align: center;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <h1>Resultado do Comitê GMUD</h1>
          <div class="meta">
            Rodada atual: ${escapeHtml(activeRound?.label || 'Sem rodada aberta')}<br />
            Gerado em: ${escapeHtml(formatDateTime(new Date().toISOString()))}
          </div>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-label">GMUDs analisadas</div>
              <div class="summary-value">${activeRound ? analyzedItems.length : 0}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Correções</div>
              <div class="summary-value">${activeRound ? analyzedItems.filter((item) => item.decision === 'EM_CORRECAO').length : 0}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Aprovadas</div>
              <div class="summary-value">${activeRound ? analyzedItems.filter((item) => item.decision === 'APROVADO').length : 0}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Reprovadas</div>
              <div class="summary-value">${activeRound ? analyzedItems.filter((item) => item.decision === 'REPROVADO').length : 0}</div>
            </div>
          </div>

          <h2>GMUDs analisadas</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Aprovação</th>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${analyzedRows || `<tr><td colspan="6">Nenhuma GMUD analisada nesta rodada.</td></tr>`}
            </tbody>
          </table>

          <h2>GMUDs anteriores</h2>
          <table>
            <thead>
              <tr>
                <th>Execução</th>
                <th>Tipo</th>
                <th>Aprovação</th>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Data da análise</th>
                <th>Observações</th>
                <th>Impacto cliente</th>
                <th>Rollback</th>
              </tr>
            </thead>
            <tbody>
              ${previousRows || `<tr><td colspan="9">Nenhuma GMUD anterior nos últimos 15 dias.</td></tr>`}
            </tbody>
          </table>
        </body>
      </html>
    `

    const exportWindow = window.open('', '_blank')
    if (!exportWindow) {
      alert('Não foi possível abrir a janela de exportação. Verifique se o navegador bloqueou pop-up.')
      return
    }

    exportWindow.document.open()
    exportWindow.document.write(html)
    exportWindow.document.close()
  }

  const registerDecision = async (item, decision) => {
    setProcessingId(item.id)

    const { error: itemError } = await supabase
      .from('committee_round_items')
      .update({
        decision,
        notes: item.notes || null,
        client_impact_flag: item.client_impact_flag || 'N',
        rollback_flag: item.rollback_flag || 'N',
        decided_at: new Date().toISOString()
      })
      .eq('id', item.id)

    if (itemError) {
      alert('Erro ao registrar decisão do item: ' + itemError.message)
      setProcessingId(null)
      return
    }

    const { error: taskError } = await supabase
      .from('change_requests')
      .update({
        status: decision,
        manager_comment: item.notes || null,
        manager_comment_updated_at: item.notes ? new Date().toISOString() : null,
        committee_notes: item.notes || null,
        client_impact_flag: item.client_impact_flag || 'N',
        rollback_flag: item.rollback_flag || 'N',
        committee_decided_at: new Date().toISOString()
      })
      .eq('id', item.change_request_id)

    if (taskError) {
      alert('Decisão do item salva, mas houve erro ao atualizar a MOP: ' + taskError.message)
      setProcessingId(null)
      await loadAll()
      return
    }

    const { error: logError } = await supabase
      .from('change_logs')
      .insert({
        change_request_id: item.change_request_id,
        action: 'COMMITTEE_DECISION',
        old_status: item.change_requests?.status || null,
        new_status: decision,
        comment: item.notes || null
      })

    if (logError) {
      alert('Decisão registrada, mas houve erro ao gravar log: ' + logError.message)
    }

    await loadAll()
    setProcessingId(null)
  }

  if (profileLoading || loading) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Carregando...</div>
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
            Somente usuários com perfil MANAGER podem acessar o comitê.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div
        style={{
          width: '100%',
          maxWidth: '1920px',
          margin: '0 auto',
          padding: '24px 32px 40px'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h1 style={pageTitleStyle()}>Comitê GMUD</h1>
          <div style={pageSubtitleStyle()}>
            Rodada formal de comitê com pré-pauta automática, pauta congelada, decisões e histórico.
          </div>
        </div>

        <div
          style={{
            ...cardStyle(),
            marginBottom: '20px',
            width: '100%'
          }}
        >
          <div style={sectionTitleStyle()}>Rodada do comitê</div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                minWidth: '260px'
              }}
            >
              <strong>Rodada ativa:</strong> {activeRound?.label || 'Nenhuma'}
            </div>

            {!activeRound ? (
              <button
                type="button"
                onClick={createRound}
                style={actionButtonStyle('#2563eb')}
              >
                Criar rodada com {draftMops.length} GMUD(s)
              </button>
            ) : (
              <button
                type="button"
                onClick={closeRound}
                style={actionButtonStyle('#dc2626')}
              >
                Encerrar rodada
              </button>
            )}

            <button
              type="button"
              onClick={exportResult}
              style={{
                ...actionButtonStyle('#16a34a'),
                marginLeft: 'auto'
              }}
            >
              Exportar resultado do comitê
            </button>
          </div>
        </div>

        {!activeRound ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>GMUDs prontas para comitê</div>
                <div style={smallStatValueStyle()}>{summary.ready}</div>
              </div>

              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>GMUDs anteriores (15 dias)</div>
                <div style={smallStatValueStyle()}>{summary.previous}</div>
              </div>
            </div>

            <div
              style={{
                ...cardStyle(),
                marginBottom: '20px',
                width: '100%'
              }}
            >
              <div style={sectionTitleStyle()}>Filtros</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <label style={fieldLabelStyle()}>Busca</label>
                  <input
                    type="text"
                    placeholder="Número, descrição, responsável"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="RASCUNHO">Rascunho</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="TODOS">Todos</option>
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
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  style={actionButtonStyle('#e5e7eb', '#111827')}
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div
              style={{
                ...cardStyle(),
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <div style={{ ...sectionTitleStyle(), marginBottom: '14px' }}>
                Pré-pauta disponível
              </div>

              <PreAgendaTable tasks={visibleDraftMops} />
            </div>

            <div
              style={{
                ...cardStyle(),
                width: '100%'
              }}
            >
              <div style={{ ...sectionTitleStyle(), marginBottom: '14px' }}>
                GMUDs anteriores
              </div>

              <PreviousItemsTable items={previousItems} />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>GMUDs analisadas</div>
                <div style={smallStatValueStyle()}>{summary.analyzed}</div>
              </div>

              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>Correções</div>
                <div style={smallStatValueStyle()}>{summary.correction}</div>
              </div>

              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>Aprovadas</div>
                <div style={smallStatValueStyle()}>{summary.approved}</div>
              </div>

              <div style={smallStatCardStyle()}>
                <div style={smallStatLabelStyle()}>Reprovadas</div>
                <div style={smallStatValueStyle()}>{summary.rejected}</div>
              </div>
            </div>

            <div
              style={{
                ...cardStyle(),
                marginBottom: '20px',
                width: '100%'
              }}
            >
              <div style={sectionTitleStyle()}>Filtros</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <label style={fieldLabelStyle()}>Busca</label>
                  <input
                    type="text"
                    placeholder="Número, descrição, responsável ou observação"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="REPROVADO">Reprovado</option>
                    <option value="EM_CORRECAO">Em correção</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="TODOS">Todos</option>
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
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  style={actionButtonStyle('#e5e7eb', '#111827')}
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div
              style={{
                ...cardStyle(),
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <div style={{ ...sectionTitleStyle(), marginBottom: '14px' }}>
                Pauta da reunião
              </div>

              <CommitteeRoundTable
                items={pendingItems}
                processingId={processingId}
                updateItemField={updateItemField}
                registerDecision={registerDecision}
                readOnly={false}
              />
            </div>

            <div
              style={{
                ...cardStyle(),
                width: '100%'
              }}
            >
              <div style={{ ...sectionTitleStyle(), marginBottom: '14px' }}>
                GMUDs analisadas
              </div>

              <CommitteeRoundTable
                items={analyzedItems}
                processingId={processingId}
                updateItemField={updateItemField}
                registerDecision={registerDecision}
                readOnly={true}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

export default function CommitteePage() {
  return (
    <AuthGuard>
      <CommitteePageContent />
    </AuthGuard>
  )
}