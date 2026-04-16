'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AuthGuard from '../../components/AuthGuard'
import AppShell from '../../components/AppShell'

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

function textareaStyle(minHeight = 120) {
  return {
    ...inputStyle(),
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

function buttonPrimaryStyle() {
  return {
    border: 'none',
    borderRadius: '12px',
    padding: '14px 22px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(79, 70, 229, 0.28)'
  }
}

function buttonSecondaryStyle() {
  return {
    border: '1px solid #c4b5fd',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#faf5ff',
    color: '#5b21b6',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer'
  }
}

function buttonDangerStyle() {
  return {
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#fff1f2',
    color: '#b91c1c',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer'
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

function checkboxInputStyle() {
  return {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  }
}

function CreatePageContent() {
  const [userId, setUserId] = useState(null)
  const [responsibleName, setResponsibleName] = useState('')
  const [loadingUser, setLoadingUser] = useState(true)

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

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user) {
        setLoadingUser(false)
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Usuário'

      setResponsibleName(fullName)
      setLoadingUser(false)
    }

    loadUserProfile()
  }, [])

  const resetForm = () => {
    setTitle('')
    setObjective('')
    setComplexity('Baixo')
    setRisk('Baixo')
    setPriority('Baixo')
    setActivityType('Programada')
    setServiceImpact(false)
    setStartTime('')
    setEndTime('')
    setImpactDuration('')
    setRollbackDuration('')
    setAffectedPlatforms('')
    setTechnicalDescription('')
    setRollbackDescription('')
    setExecutionScriptText('')
    setRollbackScriptText('')

    setActivityContacts([{ name: '', company: '', phone: '', email: '' }])

    setResponsibilityMatrix([
      {
        name: '',
        planning: false,
        execution: false,
        validation: false,
        dayAfterMonitoring: false,
        dayAfterRollback: false
      }
    ])

    setTestBook([{ test: '', responsible: '' }])
    setAffectedServices(buildDefaultAffectedServices())
    setExecutionTimeline([{ time: '', activity: '', responsible: '' }])
  }

  const updateArrayItem = (setter, array, index, field, value) => {
    const updated = [...array]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setter(updated)
  }

  const addArrayItem = (setter, array, newItem) => {
    setter([...array, newItem])
  }

  const removeArrayItem = (setter, array, index) => {
    if (array.length === 1) return
    setter(array.filter((_, i) => i !== index))
  }

  const setAffectedServiceImpact = (index, impact) => {
    const updated = [...affectedServices]
    updated[index] = {
      ...updated[index],
      impact
    }
    setAffectedServices(updated)
  }

  const handleImportTextFile = (event, setter) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setter(String(reader.result || ''))
    }
    reader.readAsText(file)

    event.target.value = ''
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Preencha o título da mudança.')
      return
    }

    if (!responsibleName.trim()) {
      alert('Não foi possível identificar o responsável logado.')
      return
    }

    const cleanContacts = activityContacts.filter(
      (item) => item.name.trim() || item.company.trim() || item.phone.trim() || item.email.trim()
    )

    const cleanResponsibilityMatrix = responsibilityMatrix.filter(
      (item) =>
        item.name.trim() ||
        item.planning ||
        item.execution ||
        item.validation ||
        item.dayAfterMonitoring ||
        item.dayAfterRollback
    )

    const cleanTestBook = testBook.filter(
      (item) => item.test.trim() || item.responsible.trim()
    )

    const cleanExecutionTimeline = executionTimeline.filter(
      (item) => item.time.trim() || item.activity.trim() || item.responsible.trim()
    )

    const { data, error } = await supabase
      .from('change_requests')
      .insert({
        title,
        responsible_name: responsibleName,
        committee_responsible_name: responsibleName,
        requester_id: userId,
        executor_id: userId,
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
        rollback_script_text: rollbackScriptText || null,
        status: 'RASCUNHO'
      })
      .select()
      .single()

    if (error) {
      alert('Erro ao salvar a MOP: ' + error.message)
      return
    }

    alert(`Criado com sucesso: ${data.change_number}`)
    resetForm()
  }

  if (loadingUser) {
    return (
      <AppShell>
        <div style={{ padding: '32px' }}>Carregando usuário...</div>
      </AppShell>
    )
  }

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
            Criar MOP
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}
          >
            Formulário web da MOP com estrutura mais próxima do documento operacional.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={sectionCardStyle()}>
            <div style={sectionHeaderStyle()}>Título da Mudança</div>
            <div style={sectionBodyStyle()}>
              <div style={{ marginBottom: '18px' }}>
                <label style={fieldLabelStyle()}>Responsável identificado pelo login</label>
                <input
                  type="text"
                  value={responsibleName}
                  disabled
                  style={inputStyle(true)}
                />
              </div>

              <div>
                <label style={fieldLabelStyle()}>Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Correção de rota de signaling para ambiente produtivo"
                  style={inputStyle()}
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
                placeholder="Descreva claramente o objetivo da mudança"
                style={textareaStyle(120)}
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
                    style={inputStyle()}
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
                    style={inputStyle()}
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
                    style={inputStyle()}
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
                    style={inputStyle()}
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
                    style={inputStyle()}
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
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={fieldLabelStyle()}>Hora de Término da Atividade</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle()}
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
                    placeholder="Ex.: 00:30"
                    style={inputStyle()}
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
                    placeholder="Ex.: 00:20"
                    style={inputStyle()}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
                            placeholder="email@empresa.com"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setActivityContacts, activityContacts, index)
                            }
                            style={buttonDangerStyle()}
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
                    addArrayItem(setActivityContacts, activityContacts, {
                      name: '',
                      company: '',
                      phone: '',
                      email: ''
                    })
                  }
                  style={buttonSecondaryStyle()}
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
                            style={inputStyle()}
                            placeholder="Nome"
                          />
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem(setResponsibilityMatrix, responsibilityMatrix, index)
                              }
                              style={buttonDangerStyle()}
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
                          />
                        </td>

                        <td style={checkboxCellStyle(item.execution)}>
                          <input
                            type="checkbox"
                            checked={item.execution}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'execution', e.target.checked)
                            }
                          />
                        </td>

                        <td style={checkboxCellStyle(item.validation)}>
                          <input
                            type="checkbox"
                            checked={item.validation}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'validation', e.target.checked)
                            }
                          />
                        </td>

                        <td style={checkboxCellStyle(item.dayAfterMonitoring)}>
                          <input
                            type="checkbox"
                            checked={item.dayAfterMonitoring}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'dayAfterMonitoring', e.target.checked)
                            }
                          />
                        </td>

                        <td style={{ ...checkboxCellStyle(item.dayAfterRollback), borderRight: 'none' }}>
                          <input
                            type="checkbox"
                            checked={item.dayAfterRollback}
                            onChange={(e) =>
                              updateArrayItem(setResponsibilityMatrix, responsibilityMatrix, index, 'dayAfterRollback', e.target.checked)
                            }
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
                    addArrayItem(setResponsibilityMatrix, responsibilityMatrix, {
                      name: '',
                      planning: false,
                      execution: false,
                      validation: false,
                      dayAfterMonitoring: false,
                      dayAfterRollback: false
                    })
                  }
                  style={buttonSecondaryStyle()}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
                            placeholder="Ex.: NOC"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setTestBook, testBook, index)
                            }
                            style={buttonDangerStyle()}
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
                    addArrayItem(setTestBook, testBook, {
                      test: '',
                      responsible: ''
                    })
                  }
                  style={buttonSecondaryStyle()}
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
                            onChange={() => setAffectedServiceImpact(index, 'SEM_AFETACAO')}
                            style={checkboxInputStyle()}
                          />
                        </td>

                        <td style={checkboxCellStyle(item.impact === 'AFETACAO_BAIXA')}>
                          <input
                            type="checkbox"
                            checked={item.impact === 'AFETACAO_BAIXA'}
                            onChange={() => setAffectedServiceImpact(index, 'AFETACAO_BAIXA')}
                            style={checkboxInputStyle()}
                          />
                        </td>

                        <td style={{ ...checkboxCellStyle(item.impact === 'AFETACAO_ALTA'), borderRight: 'none' }}>
                          <input
                            type="checkbox"
                            checked={item.impact === 'AFETACAO_ALTA'}
                            onChange={() => setAffectedServiceImpact(index, 'AFETACAO_ALTA')}
                            style={checkboxInputStyle()}
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
                  placeholder="Liste os sistemas, plataformas, APNs, elementos de rede ou serviços impactados"
                  style={textareaStyle(120)}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={fieldLabelStyle()}>Descrição Técnica da Mudança</label>
                <textarea
                  value={technicalDescription}
                  onChange={(e) => setTechnicalDescription(e.target.value)}
                  rows={10}
                  placeholder="Descreva passo a passo a implementação técnica da mudança"
                  style={textareaStyle(220)}
                />
              </div>

              <div>
                <label style={fieldLabelStyle()}>Descrição do Rollback</label>
                <textarea
                  value={rollbackDescription}
                  onChange={(e) => setRollbackDescription(e.target.value)}
                  rows={6}
                  placeholder="Descreva como a mudança será revertida em caso de falha"
                  style={textareaStyle(160)}
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
                  placeholder="Cole aqui o script de execução"
                  style={textareaStyle(240)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => executionScriptFileRef.current?.click()}
                  style={buttonSecondaryStyle()}
                >
                  Importar script de execução (.txt)
                </button>

                <button
                  type="button"
                  onClick={() => setExecutionScriptText('')}
                  style={buttonDangerStyle()}
                >
                  Limpar script
                </button>

                <input
                  ref={executionScriptFileRef}
                  type="file"
                  accept=".txt,.log,.cfg,.conf,.sh,.sql,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportTextFile(e, setExecutionScriptText)}
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
                  placeholder="Cole aqui o script de rollback"
                  style={textareaStyle(240)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => rollbackScriptFileRef.current?.click()}
                  style={buttonSecondaryStyle()}
                >
                  Importar script de rollback (.txt)
                </button>

                <button
                  type="button"
                  onClick={() => setRollbackScriptText('')}
                  style={buttonDangerStyle()}
                >
                  Limpar script
                </button>

                <input
                  ref={rollbackScriptFileRef}
                  type="file"
                  accept=".txt,.log,.cfg,.conf,.sh,.sql,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportTextFile(e, setRollbackScriptText)}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
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
                            style={inputStyle()}
                            placeholder="Ex.: Rômulo"
                          />
                        </td>
                        <td style={{ ...tdStyle(), borderRight: 'none' }}>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setExecutionTimeline, executionTimeline, index)
                            }
                            style={buttonDangerStyle()}
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
                    addArrayItem(setExecutionTimeline, executionTimeline, {
                      time: '',
                      activity: '',
                      responsible: ''
                    })
                  }
                  style={buttonSecondaryStyle()}
                >
                  Adicionar linha da timeline
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button
              onClick={handleSubmit}
              style={buttonPrimaryStyle()}
            >
              Criar MOP
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function CreatePage() {
  return (
    <AuthGuard>
      <CreatePageContent />
    </AuthGuard>
  )
}