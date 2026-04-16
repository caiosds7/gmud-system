'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getCurrentUserWithProfile } from '../../../lib/auth'
import { validateTransition } from '../../../lib/workflow'
import { getEditPermission, getStatusManagementPermission } from '../../../lib/permissions'
import AuthGuard from '../../../components/AuthGuard'
import AppShell from '../../../components/AppShell'

const DEFAULT_AFFECTED_SERVICES = [
  'API SIM Transformation',
  'Movit (plataforma / app)',
  'MVNO Credenciada (Plataforma / Serviço)',
  'SMS',
  'IoT rede TIM',
  'IoT rede Vivo (Roaming direto)',
  'IoT rede Claro (Roaming Comfone)',
  'IoT rede Internacional (Roaming Telna)',
  'IoT rede Vivo (Roaming Telna)',
  'IoT Light (Simcards Claro)',
  'IoT Move (Simcards NLT)',
  'Redes Privativas',
  'DAT 0303 / 0800 / 3003',
  'DAT Colocation',
  'DAT Controle',
  'DID Fixo',
  'DID Internacional',
  'DID Móvel',
  'Wholesale Internacional',
  'CLI Nacional',
  'DAT SMP'
]

function formatDateTime(value) {
  if (!value) return 'Não informado'

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

function formatForDatetimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function buildAffectedServicesMap(services) {
  const map = new Map()

  safeArray(services).forEach((item) => {
    if (!item?.name) return
    map.set(item.name, item.impact || 'SEM_AFETACAO')
  })

  return DEFAULT_AFFECTED_SERVICES.map((name) => ({
    name,
    impact: map.get(name) || 'SEM_AFETACAO'
  }))
}

function checkboxMark(checked) {
  return checked ? '☒' : '☐'
}

function getStatusBadgeStyle(status) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em'
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

  if (status === 'EM_EXECUCAO') {
    return {
      ...base,
      background: '#dbeafe',
      color: '#1d4ed8'
    }
  }

  if (status === 'CONCLUIDO') {
    return {
      ...base,
      background: '#ccfbf1',
      color: '#115e59'
    }
  }

  if (status === 'ROLLBACK') {
    return {
      ...base,
      background: '#fce7f3',
      color: '#9d174d'
    }
  }

  return {
    ...base,
    background: '#e5e7eb',
    color: '#374151'
  }
}

function getExecutionStatusBadgeStyle(status) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em'
  }

  if (status === 'PENDENTE_EXECUCAO') {
    return {
      ...base,
      background: '#e5e7eb',
      color: '#374151'
    }
  }

  if (status === 'EM_EXECUCAO') {
    return {
      ...base,
      background: '#dbeafe',
      color: '#1d4ed8'
    }
  }

  if (status === 'AGUARDANDO_ENCERRAMENTO') {
    return {
      ...base,
      background: '#fef3c7',
      color: '#92400e'
    }
  }

  if (status === 'ENCERRADA') {
    return {
      ...base,
      background: '#dcfce7',
      color: '#166534'
    }
  }

  return {
    ...base,
    background: '#e5e7eb',
    color: '#374151'
  }
}

function getOperationalResultBadgeStyle(result) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em'
  }

  if (result === 'SUCESSO_LIMPO') {
    return {
      ...base,
      background: '#dcfce7',
      color: '#166534'
    }
  }

  if (result === 'SUCESSO_PARCIAL') {
    return {
      ...base,
      background: '#dbeafe',
      color: '#1d4ed8'
    }
  }

  if (result === 'ROLLBACK') {
    return {
      ...base,
      background: '#fef3c7',
      color: '#92400e'
    }
  }

  if (result === 'FALHA') {
    return {
      ...base,
      background: '#fee2e2',
      color: '#991b1b'
    }
  }

  if (result === 'NAO_EXECUTADA') {
    return {
      ...base,
      background: '#f3f4f6',
      color: '#374151'
    }
  }

  return {
    ...base,
    background: '#e5e7eb',
    color: '#374151'
  }
}

function translateExecutionStatus(status) {
  const map = {
    PENDENTE_EXECUCAO: 'Pendente de execução',
    EM_EXECUCAO: 'Em execução',
    AGUARDANDO_ENCERRAMENTO: 'Aguardando encerramento',
    ENCERRADA: 'Encerrada'
  }

  return map[status] || 'Não informado'
}

function translateOperationalResult(result) {
  const map = {
    SUCESSO_LIMPO: 'Sucesso limpo',
    SUCESSO_PARCIAL: 'Sucesso parcial',
    ROLLBACK: 'Rollback',
    FALHA: 'Falha',
    NAO_EXECUTADA: 'Não executada'
  }

  return map[result] || 'Não informado'
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
    padding: '24px',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
  }
}

function sectionTitleStyle() {
  return {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '18px'
  }
}

function labelStyle() {
  return {
    fontSize: '13px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '6px'
  }
}

function valueStyle() {
  return {
    fontSize: '16px',
    color: '#111827',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}

function infoItem(label, value) {
  return (
    <div>
      <div style={labelStyle()}>{label}</div>
      <div style={valueStyle()}>{value || 'Não informado'}</div>
    </div>
  )
}

function tableWrapperStyle() {
  return {
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    background: '#ffffff'
  }
}

function tableStyle() {
  return {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '760px'
  }
}

function tableHeaderCellStyle() {
  return {
    padding: '14px',
    textAlign: 'left',
    fontSize: '13px',
    color: '#475569',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 700
  }
}

function tableCellStyle(center = false) {
  return {
    padding: '14px',
    color: '#111827',
    verticalAlign: 'top',
    whiteSpace: 'pre-wrap',
    textAlign: center ? 'center' : 'left',
    borderTop: '1px solid #e5e7eb'
  }
}

function codeBlockStyle() {
  return {
    padding: '16px',
    background: '#0f172a',
    color: '#e2e8f0',
    borderRadius: '12px',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '13px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowX: 'auto'
  }
}

function mutedBoxStyle() {
  return {
    padding: '16px',
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    color: '#6b7280'
  }
}

function inputBaseStyle(disabled = false) {
  return {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '14px',
    background: disabled ? '#f3f4f6' : '#ffffff',
    color: '#111827',
    boxSizing: 'border-box',
    outline: 'none'
  }
}

function TaskDetailContent() {
  const params = useParams()
  const [task, setTask] = useState(null)
  const [logs, setLogs] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [managerCommentInput, setManagerCommentInput] = useState('')

  const [executionStatusInput, setExecutionStatusInput] = useState('PENDENTE_EXECUCAO')
  const [operationalResultInput, setOperationalResultInput] = useState('')
  const [executionStartedAtInput, setExecutionStartedAtInput] = useState('')
  const [executionFinishedAtInput, setExecutionFinishedAtInput] = useState('')
  const [executionNotesInput, setExecutionNotesInput] = useState('')
  const [notExecutedReasonInput, setNotExecutedReasonInput] = useState('')
  const [executionHadImpactInput, setExecutionHadImpactInput] = useState(false)
  const [executionHadRollbackInput, setExecutionHadRollbackInput] = useState(false)
  const [savingExecution, setSavingExecution] = useState(false)

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      alert('Erro ao buscar tarefa: ' + error.message)
      return
    }

    setTask(data)
    setManagerCommentInput(data.manager_comment || '')
    setExecutionStatusInput(data.execution_status || 'PENDENTE_EXECUCAO')
    setOperationalResultInput(data.operational_result || '')
    setExecutionStartedAtInput(formatForDatetimeLocal(data.execution_started_at))
    setExecutionFinishedAtInput(formatForDatetimeLocal(data.execution_finished_at))
    setExecutionNotesInput(data.execution_notes || '')
    setNotExecutedReasonInput(data.not_executed_reason || '')
    setExecutionHadImpactInput(!!data.execution_had_impact)
    setExecutionHadRollbackInput(!!data.execution_had_rollback)
  }

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('change_logs')
      .select('*')
      .eq('change_request_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao buscar histórico: ' + error.message)
      return
    }

    setLogs(data || [])
  }

  const fetchProfile = async () => {
    const { profile } = await getCurrentUserWithProfile()
    setProfile(profile)
  }

  const fetchAll = async () => {
    setLoading(true)
    await fetchProfile()
    await fetchTask()
    await fetchLogs()
    setLoading(false)
  }

  const updateStatus = async (newStatus) => {
    if (!task) {
      alert('Tarefa não carregada.')
      return
    }

    const statusPermission = getStatusManagementPermission(task, profile)

    if (!statusPermission.allowed) {
      alert(statusPermission.reason)
      return
    }

    const oldStatus = task.status || null
    const trimmedComment = managerCommentInput.trim()

    const validation = validateTransition(oldStatus, newStatus)

    if (!validation.valid) {
      alert(validation.message)
      return
    }

    const { error } = await supabase
      .from('change_requests')
      .update({
        status: newStatus,
        manager_comment: trimmedComment || null,
        manager_comment_updated_at: trimmedComment ? new Date().toISOString() : null
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }

    const { error: logError } = await supabase
      .from('change_logs')
      .insert({
        change_request_id: params.id,
        action: 'STATUS_CHANGE',
        old_status: oldStatus,
        new_status: newStatus,
        comment: trimmedComment || null
      })

    if (logError) {
      alert('Status atualizado, mas houve erro ao gravar log: ' + logError.message)
      await fetchAll()
      return
    }

    alert('Status atualizado para: ' + newStatus)
    await fetchAll()
  }

  const saveManagerCommentOnly = async () => {
    if (profile?.role !== 'MANAGER') {
      alert('Apenas usuários com perfil MANAGER podem salvar o parecer.')
      return
    }

    const trimmedComment = managerCommentInput.trim()

    const { error } = await supabase
      .from('change_requests')
      .update({
        manager_comment: trimmedComment || null,
        manager_comment_updated_at: trimmedComment ? new Date().toISOString() : null
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao salvar parecer do manager: ' + error.message)
      return
    }

    alert('Parecer do manager salvo com sucesso')
    await fetchAll()
  }

  const saveExecutionClosure = async () => {
    if (!task) {
      alert('Tarefa não carregada.')
      return
    }

    if (task.status !== 'APROVADO') {
      alert('O encerramento da execução só pode ser registrado quando a MOP estiver APROVADA.')
      return
    }

    if (!(profile?.role === 'ENGINEER' && task.executor_id === profile.id)) {
      alert('Somente o ENGINEER responsável por esta MOP pode registrar o encerramento da execução.')
      return
    }

    if (!executionStatusInput) {
      alert('Selecione o status da execução.')
      return
    }

    if (!operationalResultInput) {
      alert('Selecione o resultado operacional.')
      return
    }

    if (operationalResultInput === 'NAO_EXECUTADA') {
      if (!notExecutedReasonInput.trim()) {
        alert('Informe o motivo da não execução.')
        return
      }
    } else {
      if (!executionStartedAtInput || !executionFinishedAtInput) {
        alert('Informe o horário real de início e de fim da execução.')
        return
      }

      const started = new Date(executionStartedAtInput)
      const finished = new Date(executionFinishedAtInput)

      if (isNaN(started.getTime()) || isNaN(finished.getTime())) {
        alert('Os horários reais informados são inválidos.')
        return
      }

      if (finished < started) {
        alert('O horário real de término não pode ser anterior ao início.')
        return
      }
    }

    if (operationalResultInput === 'ROLLBACK' && !executionHadRollbackInput) {
      alert('Se o resultado operacional for ROLLBACK, o campo "houve rollback" deve estar marcado como Sim.')
      return
    }

    if (operationalResultInput === 'SUCESSO_PARCIAL' && !executionHadImpactInput) {
      alert('Se o resultado operacional for SUCESSO_PARCIAL, o campo "houve impacto" deve estar marcado como Sim.')
      return
    }

    setSavingExecution(true)

    const payload = {
      execution_status: executionStatusInput,
      operational_result: operationalResultInput,
      execution_started_at: operationalResultInput === 'NAO_EXECUTADA' ? null : (executionStartedAtInput || null),
      execution_finished_at: operationalResultInput === 'NAO_EXECUTADA' ? null : (executionFinishedAtInput || null),
      execution_notes: executionNotesInput.trim() || null,
      not_executed_reason: operationalResultInput === 'NAO_EXECUTADA'
        ? (notExecutedReasonInput.trim() || null)
        : null,
      execution_had_impact: operationalResultInput === 'NAO_EXECUTADA' ? false : !!executionHadImpactInput,
      execution_had_rollback: operationalResultInput === 'NAO_EXECUTADA' ? false : !!executionHadRollbackInput,
      execution_closed_by: profile.id,
      execution_closed_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('change_requests')
      .update(payload)
      .eq('id', params.id)

    if (error) {
      alert('Erro ao salvar encerramento da execução: ' + error.message)
      setSavingExecution(false)
      return
    }

    const { error: logError } = await supabase
      .from('change_logs')
      .insert({
        change_request_id: params.id,
        action: 'EXECUTION_CLOSURE',
        old_status: null,
        new_status: null,
        comment: `Encerramento da execução salvo. Status de execução: ${executionStatusInput}. Resultado operacional: ${operationalResultInput}.`
      })

    if (logError) {
      alert('Encerramento salvo, mas houve erro ao gravar log: ' + logError.message)
      setSavingExecution(false)
      await fetchAll()
      return
    }

    alert('Encerramento da execução salvo com sucesso.')
    setSavingExecution(false)
    await fetchAll()
  }

  useEffect(() => {
    if (params?.id) {
      fetchAll()
    }
  }, [params?.id])

  const activityContacts = useMemo(() => safeArray(task?.activity_contacts), [task])
  const responsibilityMatrix = useMemo(() => safeArray(task?.responsibility_matrix), [task])
  const testBook = useMemo(() => safeArray(task?.test_book), [task])
  const affectedServices = useMemo(() => buildAffectedServicesMap(task?.affected_services), [task])
  const executionTimeline = useMemo(() => safeArray(task?.execution_timeline), [task])

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Carregando...</div>
      </AppShell>
    )
  }

  if (!task) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Tarefa não encontrada.</div>
      </AppShell>
    )
  }

  const isManager = profile?.role === 'MANAGER'
  const isApproved = task.status === 'APROVADO'
  const isRejected = task.status === 'REPROVADO'
  const isCorrection = task.status === 'EM_CORRECAO'
  const isDraft = task.status === 'RASCUNHO'

  const statusPermission = getStatusManagementPermission(task, profile)
  const canManageStatus = statusPermission.allowed

  const canApprove = canManageStatus && (isDraft || isCorrection)
  const canReject = canManageStatus && (isDraft || isCorrection)
  const canRequestCorrection = canManageStatus && isDraft
  const canReturnToDraft = canManageStatus && (isCorrection || isRejected)

  const editPermission = getEditPermission(task, profile)
  const canEdit = editPermission.allowed

  const hasExecutionData =
    !!task.execution_status ||
    !!task.operational_result ||
    !!task.execution_started_at ||
    !!task.execution_finished_at ||
    !!task.execution_notes ||
    !!task.not_executed_reason ||
    !!task.execution_closed_at

  const shouldShowExecutionSection = task.status === 'APROVADO' || hasExecutionData
  const canEditExecutionClosure = profile?.role === 'ENGINEER' && task.executor_id === profile.id && task.status === 'APROVADO'

  return (
    <AppShell>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 24px 40px'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={pageTitleStyle()}>Detalhe da Tarefa Programada</h1>
          <div style={pageSubtitleStyle()}>
            Visualização completa da mudança, parecer gerencial, ações, estrutura detalhada e histórico.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '20px'
          }}
        >
          <div style={cardStyle()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '18px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ ...labelStyle(), marginBottom: '8px' }}>Mudança</div>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '8px',
                    lineHeight: 1.2
                  }}
                >
                  {task.title || 'Sem título'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: '#eef2ff',
                      color: '#3730a3',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    {task.change_number || 'Sem número'}
                  </span>

                  <span style={getStatusBadgeStyle(task.status)}>
                    {task.status || 'Sem status'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  minWidth: '240px',
                  display: 'grid',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={labelStyle()}>Responsável</div>
                  <div style={valueStyle()}>{task.responsible_name || 'Não informado'}</div>
                </div>

                <div>
                  <div style={labelStyle()}>Criada em</div>
                  <div style={valueStyle()}>{formatDateTime(task.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Objetivo da Mudança</div>
              {infoItem('Objetivo', task.objective)}
            </div>

            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Dimensões da Mudança</div>
              <div
                style={{
                  display: 'grid',
                  gap: '14px'
                }}
              >
                {infoItem('Complexidade', task.complexity)}
                {infoItem('Risco', task.risk)}
                {infoItem('Prioridade', task.priority)}
              </div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Dados da Atividade</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '18px'
              }}
            >
              {infoItem('Tipo de Atividade', task.activity_type)}
              {infoItem('Impacto no Serviço', task.service_impact ? 'Sim' : 'Não')}
              {infoItem('Hora de Início', formatDateTime(task.start_time))}
              {infoItem('Hora de Término', formatDateTime(task.end_time))}
              {infoItem('Duração do Impacto', task.impact_duration)}
              {infoItem('Tempo de Rollback', task.rollback_duration)}
            </div>
          </div>

          {shouldShowExecutionSection && (
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Encerramento da Execução</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '18px',
                  marginBottom: '18px'
                }}
              >
                <div>
                  <div style={labelStyle()}>Status da execução</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={getExecutionStatusBadgeStyle(task.execution_status || executionStatusInput)}>
                      {translateExecutionStatus(task.execution_status || executionStatusInput)}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={labelStyle()}>Resultado operacional</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {task.operational_result || operationalResultInput ? (
                      <span style={getOperationalResultBadgeStyle(task.operational_result || operationalResultInput)}>
                        {translateOperationalResult(task.operational_result || operationalResultInput)}
                      </span>
                    ) : (
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>Não informado</div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={labelStyle()}>Encerrado em</div>
                  <div style={valueStyle()}>{formatDateTime(task.execution_closed_at)}</div>
                </div>

                <div>
                  <div style={labelStyle()}>Fechado por</div>
                  <div style={valueStyle()}>{task.execution_closed_by || 'Não informado'}</div>
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: canEditExecutionClosure ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${canEditExecutionClosure ? '#bfdbfe' : '#e2e8f0'}`,
                  color: canEditExecutionClosure ? '#1d4ed8' : '#475569',
                  marginBottom: '20px',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}
              >
                {canEditExecutionClosure
                  ? 'Você é o ENGINEER responsável por esta MOP e pode registrar o encerramento operacional da janela.'
                  : isManager
                    ? 'Como MANAGER, você pode visualizar o encerramento operacional, mas o preenchimento é feito pelo ENGINEER responsável.'
                    : 'Somente o ENGINEER responsável por esta MOP pode registrar o encerramento operacional após a aprovação.'}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '18px',
                  marginBottom: '18px'
                }}
              >
                <div>
                  <label style={labelStyle()}>Status da execução</label>
                  <select
                    value={executionStatusInput}
                    onChange={(e) => setExecutionStatusInput(e.target.value)}
                    disabled={!canEditExecutionClosure}
                    style={inputBaseStyle(!canEditExecutionClosure)}
                  >
                    <option value="PENDENTE_EXECUCAO">Pendente de execução</option>
                    <option value="EM_EXECUCAO">Em execução</option>
                    <option value="AGUARDANDO_ENCERRAMENTO">Aguardando encerramento</option>
                    <option value="ENCERRADA">Encerrada</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Resultado operacional</label>
                  <select
                    value={operationalResultInput}
                    onChange={(e) => setOperationalResultInput(e.target.value)}
                    disabled={!canEditExecutionClosure}
                    style={inputBaseStyle(!canEditExecutionClosure)}
                  >
                    <option value="">Selecione</option>
                    <option value="SUCESSO_LIMPO">Sucesso limpo</option>
                    <option value="SUCESSO_PARCIAL">Sucesso parcial</option>
                    <option value="ROLLBACK">Rollback</option>
                    <option value="FALHA">Falha</option>
                    <option value="NAO_EXECUTADA">Não executada</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Início real</label>
                  <input
                    type="datetime-local"
                    value={executionStartedAtInput}
                    onChange={(e) => setExecutionStartedAtInput(e.target.value)}
                    disabled={!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA'}
                    style={inputBaseStyle(!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA')}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Fim real</label>
                  <input
                    type="datetime-local"
                    value={executionFinishedAtInput}
                    onChange={(e) => setExecutionFinishedAtInput(e.target.value)}
                    disabled={!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA'}
                    style={inputBaseStyle(!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA')}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Houve impacto real?</label>
                  <select
                    value={executionHadImpactInput ? 'SIM' : 'NAO'}
                    onChange={(e) => setExecutionHadImpactInput(e.target.value === 'SIM')}
                    disabled={!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA'}
                    style={inputBaseStyle(!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA')}
                  >
                    <option value="NAO">Não</option>
                    <option value="SIM">Sim</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Houve rollback?</label>
                  <select
                    value={executionHadRollbackInput ? 'SIM' : 'NAO'}
                    onChange={(e) => setExecutionHadRollbackInput(e.target.value === 'SIM')}
                    disabled={!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA'}
                    style={inputBaseStyle(!canEditExecutionClosure || operationalResultInput === 'NAO_EXECUTADA')}
                  >
                    <option value="NAO">Não</option>
                    <option value="SIM">Sim</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '18px'
                }}
              >
                <div>
                  <label style={labelStyle()}>Observações finais da execução</label>
                  <textarea
                    value={executionNotesInput}
                    onChange={(e) => setExecutionNotesInput(e.target.value)}
                    rows={5}
                    disabled={!canEditExecutionClosure}
                    style={{
                      ...inputBaseStyle(!canEditExecutionClosure),
                      resize: 'vertical',
                      minHeight: '130px'
                    }}
                    placeholder="Descreva o que ocorreu na execução, desvios, evidências e observações finais."
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Motivo da não execução</label>
                  <textarea
                    value={notExecutedReasonInput}
                    onChange={(e) => setNotExecutedReasonInput(e.target.value)}
                    rows={4}
                    disabled={!canEditExecutionClosure || operationalResultInput !== 'NAO_EXECUTADA'}
                    style={{
                      ...inputBaseStyle(!canEditExecutionClosure || operationalResultInput !== 'NAO_EXECUTADA'),
                      resize: 'vertical',
                      minHeight: '110px'
                    }}
                    placeholder="Obrigatório quando o resultado operacional for Não executada."
                  />
                </div>
              </div>

              {canEditExecutionClosure && (
                <div
                  style={{
                    marginTop: '18px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <button
                    onClick={saveExecutionClosure}
                    disabled={savingExecution}
                    style={{
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 20px',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 10px 24px rgba(79, 70, 229, 0.24)'
                    }}
                  >
                    {savingExecution ? 'Salvando...' : 'Salvar encerramento'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Contatos da Atividade</div>

            {activityContacts.length === 0 ? (
              <div style={mutedBoxStyle()}>Nenhum contato informado.</div>
            ) : (
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCellStyle()}>Nome</th>
                      <th style={tableHeaderCellStyle()}>Empresa</th>
                      <th style={tableHeaderCellStyle()}>Telefone de Contato</th>
                      <th style={tableHeaderCellStyle()}>E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityContacts.map((item, index) => (
                      <tr key={index}>
                        <td style={tableCellStyle()}>{item?.name || '-'}</td>
                        <td style={tableCellStyle()}>{item?.company || '-'}</td>
                        <td style={tableCellStyle()}>{item?.phone || '-'}</td>
                        <td style={tableCellStyle()}>{item?.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Matriz de Responsabilidades</div>

            {responsibilityMatrix.length === 0 ? (
              <div style={mutedBoxStyle()}>Nenhuma responsabilidade informada.</div>
            ) : (
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCellStyle()}>Nome</th>
                      <th style={tableHeaderCellStyle()}>Planejamento (MOP focal)</th>
                      <th style={tableHeaderCellStyle()}>Execução</th>
                      <th style={tableHeaderCellStyle()}>Validação (Testes)</th>
                      <th style={tableHeaderCellStyle()}>Day after (monitoramento)</th>
                      <th style={tableHeaderCellStyle()}>Day after (rollback)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responsibilityMatrix.map((item, index) => (
                      <tr key={index}>
                        <td style={tableCellStyle()}>{item?.name || '-'}</td>
                        <td style={tableCellStyle(true)}>{checkboxMark(!!item?.planning)}</td>
                        <td style={tableCellStyle(true)}>{checkboxMark(!!item?.execution)}</td>
                        <td style={tableCellStyle(true)}>{checkboxMark(!!item?.validation)}</td>
                        <td style={tableCellStyle(true)}>{checkboxMark(!!item?.dayAfterMonitoring)}</td>
                        <td style={tableCellStyle(true)}>{checkboxMark(!!item?.dayAfterRollback)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Caderno de Testes</div>

            {testBook.length === 0 ? (
              <div style={mutedBoxStyle()}>Nenhum teste informado.</div>
            ) : (
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCellStyle()}>Teste</th>
                      <th style={tableHeaderCellStyle()}>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testBook.map((item, index) => (
                      <tr key={index}>
                        <td style={tableCellStyle()}>{item?.test || '-'}</td>
                        <td style={tableCellStyle()}>{item?.responsible || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Serviços Afetados</div>

            <div style={tableWrapperStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={tableHeaderCellStyle()}>Nome</th>
                    <th style={{ ...tableHeaderCellStyle(), textAlign: 'center' }}>Sem afetação</th>
                    <th style={{ ...tableHeaderCellStyle(), textAlign: 'center' }}>Afetação Baixa</th>
                    <th style={{ ...tableHeaderCellStyle(), textAlign: 'center' }}>Afetação Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {affectedServices.map((item, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle()}>{item.name}</td>
                      <td style={tableCellStyle(true)}>{checkboxMark(item.impact === 'SEM_AFETACAO')}</td>
                      <td style={tableCellStyle(true)}>{checkboxMark(item.impact === 'AFETACAO_BAIXA')}</td>
                      <td style={tableCellStyle(true)}>{checkboxMark(item.impact === 'AFETACAO_ALTA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Plataformas / Aplicações / Sites Afetados</div>
            <div style={valueStyle()}>{task.affected_platforms || 'Não informado'}</div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Descrição Técnica da Mudança</div>
              <div style={valueStyle()}>{task.technical_description || 'Não informado'}</div>
            </div>

            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Descrição do Rollback</div>
              <div style={valueStyle()}>{task.rollback_description || 'Não informado'}</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Script de Execução</div>

            {task.execution_script_text ? (
              <div style={codeBlockStyle()}>{task.execution_script_text}</div>
            ) : (
              <div style={mutedBoxStyle()}>Nenhum script de execução informado.</div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Script de Rollback</div>

            {task.rollback_script_text ? (
              <div style={codeBlockStyle()}>{task.rollback_script_text}</div>
            ) : (
              <div style={mutedBoxStyle()}>Nenhum script de rollback informado.</div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Timeline de Execução</div>

            {executionTimeline.length === 0 ? (
              <div style={mutedBoxStyle()}>Nenhuma linha de timeline informada.</div>
            ) : (
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={tableHeaderCellStyle()}>Horário</th>
                      <th style={tableHeaderCellStyle()}>Atividade</th>
                      <th style={tableHeaderCellStyle()}>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionTimeline.map((item, index) => (
                      <tr key={index}>
                        <td style={tableCellStyle()}>{item?.time || '-'}</td>
                        <td style={tableCellStyle()}>{item?.activity || '-'}</td>
                        <td style={tableCellStyle()}>{item?.responsible || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Parecer do Manager</div>

            {task.manager_comment ? (
              <div
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ ...valueStyle(), marginBottom: '10px' }}>
                  {task.manager_comment}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#6b7280'
                  }}
                >
                  Última atualização: {formatDateTime(task.manager_comment_updated_at)}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}
              >
                Nenhum parecer registrado.
              </div>
            )}

            {isManager ? (
              <div>
                <textarea
                  value={managerCommentInput}
                  onChange={(e) => setManagerCommentInput(e.target.value)}
                  rows={5}
                  placeholder="Digite aqui o parecer do manager, justificativa de aprovação, reprovação ou correção..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    resize: 'vertical',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    minHeight: '130px'
                  }}
                />

                <div
                  style={{
                    marginTop: '14px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <button
                    onClick={saveManagerCommentOnly}
                    style={{
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      background: '#374151',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Salvar parecer
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>
                Apenas usuários com perfil MANAGER podem registrar ou editar o parecer.
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Ações</div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '14px'
              }}
            >
              <Link
                href={canEdit ? `/task/${task.id}/edit` : '#'}
                aria-disabled={!canEdit}
                onClick={(e) => {
                  if (!canEdit) e.preventDefault()
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  background: canEdit ? '#2563eb' : '#d1d5db',
                  color: canEdit ? '#ffffff' : '#6b7280',
                  fontWeight: 700,
                  cursor: canEdit ? 'pointer' : 'not-allowed'
                }}
              >
                Editar MOP
              </Link>

              <Link
                href={`/task/${task.id}/print`}
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                Exportar PDF
              </Link>

              {canApprove && (
                <button
                  onClick={() => updateStatus('APROVADO')}
                  style={{
                    border: 'none',
                    minHeight: '44px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Aprovar
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => updateStatus('REPROVADO')}
                  style={{
                    border: 'none',
                    minHeight: '44px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reprovar
                </button>
              )}

              {canRequestCorrection && (
                <button
                  onClick={() => updateStatus('EM_CORRECAO')}
                  style={{
                    border: 'none',
                    minHeight: '44px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: '#f59e0b',
                    color: '#111827',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Solicitar Correção
                </button>
              )}

              {canReturnToDraft && (
                <button
                  onClick={() => updateStatus('RASCUNHO')}
                  style={{
                    border: 'none',
                    minHeight: '44px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: '#6b7280',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Voltar para Rascunho
                </button>
              )}
            </div>

            {!canEdit && (
              <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                {editPermission.reason}
              </div>
            )}

            {!isManager && (
              <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                Você está logado como ENGINEER. Ações de aprovação são restritas ao perfil MANAGER.
              </div>
            )}

            {isApproved && (
              <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                Esta tarefa está aprovada e não pode mais ser editada nem alterada de status.
              </div>
            )}

            {isRejected && (
              <div style={{ color: '#991b1b', marginBottom: '10px' }}>
                Esta tarefa foi reprovada. O único fluxo permitido agora é voltar para rascunho.
              </div>
            )}

            {isCorrection && (
              <div style={{ color: '#92400e', marginBottom: '10px' }}>
                Esta tarefa está em correção. Ela pode voltar para rascunho, ser aprovada ou reprovada.
              </div>
            )}

            {isDraft && (
              <div style={{ color: '#374151' }}>
                Esta tarefa está em rascunho. Ela pode ser aprovada, reprovada ou enviada para correção.
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Histórico da Tarefa</div>

            {logs.length === 0 ? (
              <div style={{ color: '#6b7280' }}>Nenhum histórico encontrado.</div>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '760px'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Data/Hora</th>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Ação</th>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Status Anterior</th>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Novo Status</th>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Comentário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr
                        key={log.id}
                        style={{
                          borderTop: index === 0 ? 'none' : '1px solid #e5e7eb'
                        }}
                      >
                        <td style={{ padding: '14px', color: '#111827', verticalAlign: 'top' }}>
                          {formatDateTime(log.created_at)}
                        </td>
                        <td style={{ padding: '14px', color: '#111827', verticalAlign: 'top' }}>
                          {log.action || 'Não informado'}
                        </td>
                        <td style={{ padding: '14px', color: '#111827', verticalAlign: 'top' }}>
                          {log.old_status || '-'}
                        </td>
                        <td style={{ padding: '14px', color: '#111827', verticalAlign: 'top' }}>
                          {log.new_status || '-'}
                        </td>
                        <td style={{ padding: '14px', color: '#111827', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                          {log.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function TaskDetail() {
  return (
    <AuthGuard>
      <TaskDetailContent />
    </AuthGuard>
  )
}