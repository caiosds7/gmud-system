'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { getCurrentUserWithProfile } from '../../../../lib/auth'
import { getEditPermission } from '../../../../lib/permissions'
import AuthGuard from '../../../../components/AuthGuard'
import AppShell from '../../../../components/AppShell'

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

function buildDefaultAffectedServices() {
  return DEFAULT_AFFECTED_SERVICES.map((name) => ({
    name,
    impact: 'SEM_AFETACAO'
  }))
}

function mergeAffectedServicesWithDefaults(services) {
  const defaults = buildDefaultAffectedServices()
  const map = new Map()

  if (Array.isArray(services)) {
    services.forEach((item) => {
      if (item?.name) {
        map.set(item.name, item.impact || 'SEM_AFETACAO')
      }
    })
  }

  return defaults.map((item) => ({
    ...item,
    impact: map.get(item.name) || 'SEM_AFETACAO'
  }))
}

function formatForDatetimeLocal(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    return value.replace(' ', 'T').slice(0, 16)
  }
  return ''
}

function pageWrapperStyle() {
  return {
    padding: '32px 24px 56px',
    maxWidth: '1200px',
    margin: '0 auto'
  }
}

function sectionCardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #d9dce3',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)'
  }
}

function sectionHeaderStyle() {
  return {
    background: 'linear-gradient(135deg, #6b21a8, #7c3aed)',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 800,
    padding: '14px 20px',
    letterSpacing: '0.2px'
  }
}

function sectionBodyStyle() {
  return {
    padding: '22px'
  }
}

function fieldLabelStyle() {
  return {
    display: 'block',
    fontSize: '14px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '8px'
  }
}

function inputStyle(disabled = false) {
  return {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #cfd5df',
    borderRadius: '10px',
    fontSize: '15px',
    background: disabled ? '#f3f4f6' : '#ffffff',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box'
  }
}

function textareaStyle(minHeight = 120, disabled = false) {
  return {
    ...inputStyle(disabled),
    resize: 'vertical',
    minHeight: `${minHeight}px`
  }
}

function gridStyle(columns = 'repeat(auto-fit, minmax(220px, 1fr))') {
  return {
    display: 'grid',
    gridTemplateColumns: columns,
    gap: '18px'
  }
}

function smallMutedTextStyle() {
  return {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px'
  }
}

function tableWrapperStyle() {
  return {
    border: '1px solid #d9dce3',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff'
  }
}

function tableStyle() {
  return {
    width: '100%',
    borderCollapse: 'collapse'
  }
}

function thStyle() {
  return {
    background: '#f3e8ff',
    color: '#4c1d95',
    fontSize: '13px',
    fontWeight: 800,
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #ddd6fe',
    borderRight: '1px solid #e5e7eb'
  }
}

function tdStyle() {
  return {
    padding: '10px',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    verticalAlign: 'top'
  }
}

function buttonPrimaryStyle(disabled = false) {
  return {
    border: 'none',
    borderRadius: '12px',
    padding: '14px 22px',
    background: disabled ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 10px 24px rgba(79, 70, 229, 0.28)',
    opacity: disabled ? 0.7 : 1
  }
}

function buttonSecondaryStyle(disabled = false) {
  return {
    border: '1px solid #c4b5fd',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#faf5ff',
    color: '#5b21b6',
    fontSize: '14px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  }
}

function buttonDangerStyle(disabled = false) {
  return {
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#fff1f2',
    color: '#b91c1c',
    fontSize: '14px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  }
}

function checkboxCellStyle(active = false) {
  return {
    textAlign: 'center',
    padding: '10px',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    background: active ? '#faf5ff' : '#ffffff'
  }
}

function checkboxInputStyle(disabled = false) {
  return {
    width: '18px',
    height: '18px',
    cursor: disabled ? 'not-allowed' : 'pointer'
  }
}

function EditTaskPageContent() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [task, setTask] = useState(null)
  const [profile, setProfile] = useState(null)

  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [complexity, setComplexity] = useState('Baixo')
  const [risk, setRisk] = useState('Baixo')
  const [priority, setPriority] = useState('Baixo')
  const [activityType, setActivityType] = useState('Programada')
  const [serviceImpact, setServiceImpact] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [impactDuration, setImpactDuration] = useState('')
  const [rollbackDuration, setRollbackDuration] = useState('')
  const [affectedPlatforms, setAffectedPlatforms] = useState('')
  const [technicalDescription, setTechnicalDescription] = useState('')
  const [rollbackDescription, setRollbackDescription] = useState('')
  const [executionScriptText, setExecutionScriptText] = useState('')
  const [rollbackScriptText, setRollbackScriptText] = useState('')

  const [activityContacts, setActivityContacts] = useState([
    { name: '', company: '', phone: '', email: '' }
  ])

  const [responsibilityMatrix, setResponsibilityMatrix] = useState([
    {
      name: '',
      planning: false,
      execution: false,
      validation: false,
      dayAfterMonitoring: false,
      dayAfterRollback: false
    }
  ])

  const [testBook, setTestBook] = useState([
    { test: '', responsible: '' }
  ])

  const [affectedServices, setAffectedServices] = useState(buildDefaultAffectedServices())

  const [executionTimeline, setExecutionTimeline] = useState([
    { time: '', activity: '', responsible: '' }
  ])

  const executionScriptFileRef = useRef(null)
  const rollbackScriptFileRef = useRef(null)

  const fetchProfile = async () => {
    const { profile } = await getCurrentUserWithProfile()
    setProfile(profile)
    return profile
  }

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      throw new Error('Erro ao buscar tarefa: ' + error.message)
    }

    setTask(data)

    setTitle(data.title || '')
    setObjective(data.objective || '')
    setComplexity(data.complexity || 'Baixo')
    setRisk(data.risk || 'Baixo')
    setPriority(data.priority || 'Baixo')
    setActivityType(data.activity_type || 'Programada')
    setServiceImpact(!!data.service_impact)
    setStartTime(formatForDatetimeLocal(data.start_time))
    setEndTime(formatForDatetimeLocal(data.end_time))
    setImpactDuration(data.impact_duration || '')
    setRollbackDuration(data.rollback_duration || '')
    setAffectedPlatforms(data.affected_platforms || '')
    setTechnicalDescription(data.technical_description || '')
    setRollbackDescription(data.rollback_description || '')
    setExecutionScriptText(data.execution_script_text || '')
    setRollbackScriptText(data.rollback_script_text || '')

    setActivityContacts(
      Array.isArray(data.activity_contacts) && data.activity_contacts.length > 0
        ? data.activity_contacts
        : [{ name: '', company: '', phone: '', email: '' }]
    )

    setResponsibilityMatrix(
      Array.isArray(data.responsibility_matrix) && data.responsibility_matrix.length > 0
        ? data.responsibility_matrix
        : [
            {
              name: '',
              planning: false,
              execution: false,
              validation: false,
              dayAfterMonitoring: false,
              dayAfterRollback: false
            }
          ]
    )

    setTestBook(
      Array.isArray(data.test_book) && data.test_book.length > 0
        ? data.test_book
        : [{ test: '', responsible: '' }]
    )

    setAffectedServices(mergeAffectedServicesWithDefaults(data.affected_services))

    setExecutionTimeline(
      Array.isArray(data.execution_timeline) && data.execution_timeline.length > 0
        ? data.execution_timeline
        : [{ time: '', activity: '', responsible: '' }]
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      await fetchProfile()
      await fetchTask()
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao carregar dados da tarefa.')
    } finally {
      setLoading(false)
    }
  }

  const updateArrayItem = (setter, array, index, field, value) => {
    const updated = [...array]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setter(updated)
  }

  const addArrayItem = (setter, array, newItem, isBlocked) => {
    if (isBlocked) return
    setter([...array, newItem])
  }

  const removeArrayItem = (setter, array, index, isBlocked) => {
    if (isBlocked || array.length === 1) return
    setter(array.filter((_, i) => i !== index))
  }

  const setAffectedServiceImpact = (index, impact, isBlocked) => {
    if (isBlocked) return

    const updated = [...affectedServices]
    updated[index] = {
      ...updated[index],
      impact
    }
    setAffectedServices(updated)
  }

  const handleImportTextFile = (event, setter, isBlocked) => {
    if (isBlocked) return

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setter(String(reader.result || ''))
    }
    reader.readAsText(file)

    event.target.value = ''
  }

  const handleUpdate = async () => {
    const permission = getEditPermission(task, profile)

    if (!permission.allowed) {
      alert(permission.reason)
      return
    }

    const cleanContacts = activityContacts.filter(
      (item) => item.name?.trim() || item.company?.trim() || item.phone?.trim() || item.email?.trim()
    )

    const cleanResponsibilityMatrix = responsibilityMatrix.filter(
      (item) =>
        item.name?.trim() ||
        item.planning ||
        item.execution ||
        item.validation ||
        item.dayAfterMonitoring ||
        item.dayAfterRollback
    )

    const cleanTestBook = testBook.filter(
      (item) => item.test?.trim() || item.responsible?.trim()
    )

    const cleanExecutionTimeline = executionTimeline.filter(
      (item) => item.time?.trim() || item.activity?.trim() || item.responsible?.trim()
    )

    const { error } = await supabase
      .from('change_requests')
      .update({
        title,
        objective,
        complexity,
        risk,
        priority,
        activity_type: activityType,
        service_impact: serviceImpact,
        start_time: startTime || null,
        end_time: endTime || null,
        impact_duration: impactDuration || null,
        rollback_duration: rollbackDuration || null,
        affected_platforms: affectedPlatforms,
        technical_description: technicalDescription,
        rollback_description: rollbackDescription,
        activity_contacts: cleanContacts,
        responsibility_matrix: cleanResponsibilityMatrix,
        test_book: cleanTestBook,
        affected_services: affectedServices,
        execution_timeline: cleanExecutionTimeline,
        execution_script_text: executionScriptText || null,
        rollback_script_text: rollbackScriptText || null
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar tarefa: ' + error.message)
      return
    }

    alert('Tarefa atualizada com sucesso')
    router.push(`/task/${params.id}`)
  }

  useEffect(() => {
    if (params?.id) {
      fetchAll()
    }
  }, [params?.id])

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '40px' }}>Carregando...</div>
      </AppShell>
    )
  }

  if (errorMessage) {
    return (
      <AppShell>
        <div style={{ padding: '40px', color: 'red' }}>{errorMessage}</div>
      </AppShell>
    )
  }

  if (!task) {
    return (
      <AppShell>
        <div style={{ padding: '40px' }}>Tarefa não encontrada.</div>
      </AppShell>
    )
  }

  const permission = getEditPermission(task, profile)
  const isBlocked = !permission.allowed

  return (
    <AppShell>
      <div style={pageWrapperStyle()}>
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#111827',
              marginBottom: '8px',
              lineHeight: 1.1
            }}
          >
            Editar MOP
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}
          >
            Atualização completa da MOP com a mesma estrutura rica da criação.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div style={{ display: 'grid', gap: '10px' }}>
              <div><strong>Número:</strong> {task.change_number}</div>
              <div><strong>Status atual:</strong> {task.status}</div>
              <div><strong>Responsável:</strong> {task.responsible_name || 'Não informado'}</div>
              <div><strong>Seu perfil:</strong> {profile?.role || 'Não informado'}</div>
            </div>
          </div>
        </div>

        {isBlocked && (
          <div
            style={{
              background: '#ffe5e5',
              color: '#900',
              padding: '12px 16px',
              marginBottom: '20px',
              border: '1px solid #d99',
              borderRadius: '10px'
            }}
          >
            {permission.reason}
          </div>
        )}

        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Título da Mudança</div>
            <div style={sectionBodyStyle()}>
              <div>
                <label style={fieldLabelStyle()}>Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isBlocked}
                  style={inputStyle(isBlocked)}
                />
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Objetivo da Mudança</div>
            <div style={sectionBodyStyle()}>
              <label style={fieldLabelStyle()}>Objetivo</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                disabled={isBlocked}
                style={textareaStyle(120, isBlocked)}
              />
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Dimensões da Mudança</div>
            <div style={sectionBodyStyle()}>
              <div style={gridStyle()}>
                <div>
                  <label style={fieldLabelStyle()}>Complexidade</label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  >
                    <option>Baixo</option>
                    <option>Médio</option>
                    <option>Alto</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Risco</label>
                  <select
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  >
                    <option>Baixo</option>
                    <option>Médio</option>
                    <option>Alto</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  >
                    <option>Baixo</option>
                    <option>Médio</option>
                    <option>Alto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Dados da Atividade</div>
            <div style={sectionBodyStyle()}>
              <div style={{ ...gridStyle(), marginBottom: '18px' }}>
                <div>
                  <label style={fieldLabelStyle()}>Tipo de Atividade</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  >
                    <option>Padrão</option>
                    <option>Programada</option>
                    <option>Emergencial</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Impacto no Serviço</label>
                  <select
                    value={serviceImpact ? 'Sim' : 'Não'}
                    onChange={(e) => setServiceImpact(e.target.value === 'Sim')}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  >
                    <option>Não</option>
                    <option>Sim</option>
                  </select>
                </div>
              </div>

              <div style={{ ...gridStyle('repeat(auto-fit, minmax(250px, 1fr))'), marginBottom: '18px' }}>
                <div>
                  <label style={fieldLabelStyle()}>Hora de Início da Atividade</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  />
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Hora de Término da Atividade</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                  />
                </div>
              </div>

              <div style={gridStyle('repeat(auto-fit, minmax(250px, 1fr))')}>
                <div>
                  <label style={fieldLabelStyle()}>Tempo estimado de duração do impacto</label>
                  <input
                    type="text"
                    value={impactDuration}
                    onChange={(e) => setImpactDuration(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                    placeholder="Ex.: 00:30"
                  />
                  <div style={smallMutedTextStyle()}>
                    Você pode usar hh:mm ou qualquer padrão operacional que sua equipe adote.
                  </div>
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Tempo estimado para execução do rollback</label>
                  <input
                    type="text"
                    value={rollbackDuration}
                    onChange={(e) => setRollbackDuration(e.target.value)}
                    disabled={isBlocked}
                    style={inputStyle(isBlocked)}
                    placeholder="Ex.: 00:20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Contatos da Atividade</div>
            <div style={sectionBodyStyle()}>
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thStyle()}>Nome</th>
                      <th style={thStyle()}>Empresa</th>
                      <th style={thStyle()}>Telefone de Contato</th>
                      <th style={thStyle()}>E-mail</th>
                      <th style={{ ...thStyle(), borderRight: 'none', width: '120px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityContacts.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateArrayItem(setActivityContacts, activityContacts, index, 'name', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Nome"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) =>
                              updateArrayItem(setActivityContacts, activityContacts, index, 'company', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Empresa"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.phone}
                            onChange={(e) =>
                              updateArrayItem(setActivityContacts, activityContacts, index, 'phone', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Telefone"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="email"
                            value={item.email}
                            onChange={(e) =>
                              updateArrayItem(setActivityContacts, activityContacts, index, 'email', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="email@empresa.com"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setActivityContacts, activityContacts, index, isBlocked)
                            }
                            disabled={isBlocked}
                            style={buttonDangerStyle(isBlocked)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(
                      setActivityContacts,
                      activityContacts,
                      { name: '', company: '', phone: '', email: '' },
                      isBlocked
                    )
                  }
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Adicionar contato
                </button>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Matriz de Responsabilidades</div>
            <div style={sectionBodyStyle()}>
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thStyle()}>Nome</th>
                      <th style={thStyle()}>Planejamento (MOP focal)</th>
                      <th style={thStyle()}>Execução</th>
                      <th style={thStyle()}>Validação (Testes)</th>
                      <th style={thStyle()}>Day after (monitoramento)</th>
                      <th style={{ ...thStyle(), borderRight: 'none' }}>Day after (rollback)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responsibilityMatrix.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'name', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Nome"
                          />
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, isBlocked)
                              }
                              disabled={isBlocked}
                              style={buttonDangerStyle(isBlocked)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>

                        <td style={checkboxCellStyle(item.planning)}>
                          <input
                            type="checkbox"
                            checked={item.planning}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'planning', e.target.checked)
                            }
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={checkboxCellStyle(item.execution)}>
                          <input
                            type="checkbox"
                            checked={item.execution}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'execution', e.target.checked)
                            }
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={checkboxCellStyle(item.validation)}>
                          <input
                            type="checkbox"
                            checked={item.validation}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'validation', e.target.checked)
                            }
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={checkboxCellStyle(item.dayAfterMonitoring)}>
                          <input
                            type="checkbox"
                            checked={item.dayAfterMonitoring}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'dayAfterMonitoring', e.target.checked)
                            }
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={{ ...checkboxCellStyle(item.dayAfterRollback), borderRight: 'none' }}>
                          <input
                            type="checkbox"
                            checked={item.dayAfterRollback}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'dayAfterRollback', e.target.checked)
                            }
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(
                      setResponsibilityMatrix,
                      responsibilityMatrix,
                      {
                        name: '',
                        planning: false,
                        execution: false,
                        validation: false,
                        dayAfterMonitoring: false,
                        dayAfterRollback: false
                      },
                      isBlocked
                    )
                  }
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Adicionar responsável
                </button>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Caderno de Testes</div>
            <div style={sectionBodyStyle()}>
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thStyle()}>Teste</th>
                      <th style={thStyle()}>Responsável</th>
                      <th style={{ ...thStyle(), borderRight: 'none', width: '120px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testBook.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.test}
                            onChange={(e) =>
                              updateArrayItem(setTestBook, testBook, index, 'test', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Ex.: Validar alarmes e estatísticas"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.responsible}
                            onChange={(e) =>
                              updateArrayItem(setTestBook, testBook, index, 'responsible', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Ex.: NOC"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setTestBook, testBook, index, isBlocked)
                            }
                            disabled={isBlocked}
                            style={buttonDangerStyle(isBlocked)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(
                      setTestBook,
                      testBook,
                      { test: '', responsible: '' },
                      isBlocked
                    )
                  }
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Adicionar teste
                </button>
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Serviços Afetados</div>
            <div style={sectionBodyStyle()}>
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thStyle()}>Nome</th>
                      <th style={{ ...thStyle(), textAlign: 'center' }}>Sem afetação</th>
                      <th style={{ ...thStyle(), textAlign: 'center' }}>Afetação Baixa</th>
                      <th style={{ ...thStyle(), textAlign: 'center', borderRight: 'none' }}>Afetação Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affectedServices.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>{item.name}</td>

                        <td style={checkboxCellStyle(item.impact === 'SEM_AFETACAO')}>
                          <input
                            type="checkbox"
                            checked={item.impact === 'SEM_AFETACAO'}
                            onChange={() => setAffectedServiceImpact(index, 'SEM_AFETACAO', isBlocked)}
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={checkboxCellStyle(item.impact === 'AFETACAO_BAIXA')}>
                          <input
                            type="checkbox"
                            checked={item.impact === 'AFETACAO_BAIXA'}
                            onChange={() => setAffectedServiceImpact(index, 'AFETACAO_BAIXA', isBlocked)}
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>

                        <td style={{ ...checkboxCellStyle(item.impact === 'AFETACAO_ALTA'), borderRight: 'none' }}>
                          <input
                            type="checkbox"
                            checked={item.impact === 'AFETACAO_ALTA'}
                            onChange={() => setAffectedServiceImpact(index, 'AFETACAO_ALTA', isBlocked)}
                            disabled={isBlocked}
                            style={checkboxInputStyle(isBlocked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={smallMutedTextStyle()}>
                Esta seção segue o mesmo conceito da MOP do Word: cada serviço padrão já vem listado e você marca apenas o nível de afetação.
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Detalhes Técnicos</div>
            <div style={sectionBodyStyle()}>
              <div style={{ marginBottom: '18px' }}>
                <label style={fieldLabelStyle()}>Plataformas / Aplicações / Sites Afetados</label>
                <textarea
                  value={affectedPlatforms}
                  onChange={(e) => setAffectedPlatforms(e.target.value)}
                  rows={4}
                  disabled={isBlocked}
                  style={textareaStyle(120, isBlocked)}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={fieldLabelStyle()}>Descrição Técnica da Mudança</label>
                <textarea
                  value={technicalDescription}
                  onChange={(e) => setTechnicalDescription(e.target.value)}
                  rows={10}
                  disabled={isBlocked}
                  style={textareaStyle(220, isBlocked)}
                />
              </div>

              <div>
                <label style={fieldLabelStyle()}>Descrição do Rollback</label>
                <textarea
                  value={rollbackDescription}
                  onChange={(e) => setRollbackDescription(e.target.value)}
                  rows={6}
                  disabled={isBlocked}
                  style={textareaStyle(160, isBlocked)}
                />
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Script de Execução</div>
            <div style={sectionBodyStyle()}>
              <div style={{ marginBottom: '12px' }}>
                <label style={fieldLabelStyle()}>Cole o script ou importe um arquivo .txt</label>
                <textarea
                  value={executionScriptText}
                  onChange={(e) => setExecutionScriptText(e.target.value)}
                  rows={12}
                  disabled={isBlocked}
                  placeholder="Cole aqui o script de execução"
                  style={textareaStyle(240, isBlocked)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isBlocked) executionScriptFileRef.current?.click()
                  }}
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Importar script de execução (.txt)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isBlocked) setExecutionScriptText('')
                  }}
                  disabled={isBlocked}
                  style={buttonDangerStyle(isBlocked)}
                >
                  Limpar script
                </button>

                <input
                  ref={executionScriptFileRef}
                  type="file"
                  accept=".txt,.log,.cfg,.conf,.sh,.sql,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportTextFile(e, setExecutionScriptText, isBlocked)}
                />
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Script de Rollback</div>
            <div style={sectionBodyStyle()}>
              <div style={{ marginBottom: '12px' }}>
                <label style={fieldLabelStyle()}>Cole o script ou importe um arquivo .txt</label>
                <textarea
                  value={rollbackScriptText}
                  onChange={(e) => setRollbackScriptText(e.target.value)}
                  rows={12}
                  disabled={isBlocked}
                  placeholder="Cole aqui o script de rollback"
                  style={textareaStyle(240, isBlocked)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isBlocked) rollbackScriptFileRef.current?.click()
                  }}
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Importar script de rollback (.txt)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isBlocked) setRollbackScriptText('')
                  }}
                  disabled={isBlocked}
                  style={buttonDangerStyle(isBlocked)}
                >
                  Limpar script
                </button>

                <input
                  ref={rollbackScriptFileRef}
                  type="file"
                  accept=".txt,.log,.cfg,.conf,.sh,.sql,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportTextFile(e, setRollbackScriptText, isBlocked)}
                />
              </div>
            </div>
          </div>

          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Timeline de Execução</div>
            <div style={sectionBodyStyle()}>
              <div style={tableWrapperStyle()}>
                <table style={tableStyle()}>
                  <thead>
                    <tr>
                      <th style={thStyle()}>Horário</th>
                      <th style={thStyle()}>Atividade</th>
                      <th style={thStyle()}>Responsável</th>
                      <th style={{ ...thStyle(), borderRight: 'none', width: '120px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionTimeline.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) =>
                              updateArrayItem(setExecutionTimeline, executionTimeline, index, 'time', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Ex.: 10:00"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.activity}
                            onChange={(e) =>
                              updateArrayItem(setExecutionTimeline, executionTimeline, index, 'activity', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Ex.: Início da atividade"
                          />
                        </td>
                        <td style={tdStyle()}>
                          <input
                            type="text"
                            value={item.responsible}
                            onChange={(e) =>
                              updateArrayItem(setExecutionTimeline, executionTimeline, index, 'responsible', e.target.value)
                            }
                            disabled={isBlocked}
                            style={inputStyle(isBlocked)}
                            placeholder="Ex.: Rômulo"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setExecutionTimeline, executionTimeline, index, isBlocked)
                            }
                            disabled={isBlocked}
                            style={buttonDangerStyle(isBlocked)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(
                      setExecutionTimeline,
                      executionTimeline,
                      { time: '', activity: '', responsible: '' },
                      isBlocked
                    )
                  }
                  disabled={isBlocked}
                  style={buttonSecondaryStyle(isBlocked)}
                >
                  Adicionar linha da timeline
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            <button
              onClick={handleUpdate}
              disabled={isBlocked}
              style={buttonPrimaryStyle(isBlocked)}
            >
              Salvar Alterações
            </button>

            <button
              type="button"
              onClick={() => router.push(`/task/${params.id}`)}
              style={{
                ...buttonSecondaryStyle(false),
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#111827'
              }}
            >
              Voltar para Detalhe
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function EditTaskPage() {
  return (
    <AuthGuard>
      <EditTaskPageContent />
    </AuthGuard>
  )
}