'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import AuthGuard from '../../../../components/AuthGuard'

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

function pageStyle() {
  return {
    background: '#eef1f5',
    minHeight: '100vh',
    padding: '24px'
  }
}

function containerStyle() {
  return {
    maxWidth: '1100px',
    margin: '0 auto'
  }
}

function toolbarStyle() {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  }
}

function buttonPrimaryStyle() {
  return {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(79, 70, 229, 0.28)'
  }
}

function buttonSecondaryStyle() {
  return {
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer'
  }
}

function sheetStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #d9dce3',
    boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)',
    padding: '28px'
  }
}

function titleBlockStyle() {
  return {
    textAlign: 'center',
    marginBottom: '24px'
  }
}

function mainTitleStyle() {
  return {
    fontSize: '34px',
    fontWeight: 900,
    color: '#111827',
    margin: 0
  }
}

function subtitleStyle() {
  return {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px'
  }
}

function sectionStyle() {
  return {
    marginBottom: '18px',
    border: '1px solid #1f2937'
  }
}

function sectionHeaderStyle() {
  return {
    background: '#6b21a8',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '18px',
    textAlign: 'center',
    padding: '6px 10px',
    lineHeight: 1.1
  }
}

function sectionBodyStyle() {
  return {
    background: '#ffffff'
  }
}

function simpleValueStyle() {
  return {
    padding: '10px 12px',
    textAlign: 'center',
    fontSize: '15px',
    color: '#111827',
    borderTop: '1px solid #1f2937',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}

function tableStyle() {
  return {
    width: '100%',
    borderCollapse: 'collapse'
  }
}

function thStyle(extra = {}) {
  return {
    border: '1px solid #1f2937',
    background: '#f3f4f6',
    color: '#111827',
    fontSize: '14px',
    fontWeight: 800,
    padding: '7px 8px',
    textAlign: 'center',
    ...extra
  }
}

function tdStyle(extra = {}) {
  return {
    border: '1px solid #1f2937',
    color: '#111827',
    fontSize: '14px',
    padding: '7px 8px',
    verticalAlign: 'top',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    ...extra
  }
}

function centerTdStyle(extra = {}) {
  return tdStyle({
    textAlign: 'center',
    ...extra
  })
}

function monospacedBoxStyle() {
  return {
    borderTop: '1px solid #1f2937',
    padding: '14px',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '13px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: '#fafafa'
  }
}

function infoCardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '14px',
    padding: '20px'
  }
}

function checkboxMark(checked) {
  return checked ? '☒' : '☐'
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
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

function PrintPageContent() {
  const params = useParams()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [change, setChange] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadChange = async () => {
      if (!id) return

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('change_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setErrorMessage(error.message || 'Não foi possível carregar a MOP.')
        setLoading(false)
        return
      }

      setChange(data)
      setLoading(false)
    }

    loadChange()
  }, [id])

  const contacts = useMemo(() => safeArray(change?.activity_contacts), [change])
  const matrix = useMemo(() => safeArray(change?.responsibility_matrix), [change])
  const tests = useMemo(() => safeArray(change?.test_book), [change])
  const services = useMemo(() => buildAffectedServicesMap(change?.affected_services), [change])
  const timeline = useMemo(() => safeArray(change?.execution_timeline), [change])

  if (loading) {
    return (
      <div style={pageStyle()}>
        <div style={containerStyle()}>
          <div style={infoCardStyle()}>Carregando MOP para impressão...</div>
        </div>
      </div>
    )
  }

  if (errorMessage || !change) {
    return (
      <div style={pageStyle()}>
        <div style={containerStyle()}>
          <div style={infoCardStyle()}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Erro ao carregar impressão
            </div>
            <div style={{ color: '#b91c1c' }}>{errorMessage || 'Registro não encontrado.'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle()}>
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          .print-toolbar {
            display: none !important;
          }

          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div style={containerStyle()}>
        <div className="print-toolbar" style={toolbarStyle()}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#111827' }}>
              MOP para impressão
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Revise o documento e use o botão abaixo para imprimir ou salvar em PDF.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={buttonSecondaryStyle()}
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={buttonPrimaryStyle()}
            >
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        <div className="print-sheet" style={sheetStyle()}>
          <div style={titleBlockStyle()}>
            <h1 style={mainTitleStyle()}>Formulário de Gestão de Mudanças</h1>
            <div style={subtitleStyle()}>
              {change.change_number || '-'} • Status: {change.status || '-'}
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Título da Mudança</div>
            <div style={simpleValueStyle()}>{change.title || '-'}</div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Objetivo da Mudança</div>
            <div style={simpleValueStyle()}>{change.objective || '-'}</div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Dimensões da Mudança</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}></th>
                    <th style={thStyle({ background: '#d9f99d' })}>Baixo</th>
                    <th style={thStyle({ background: '#fef3c7' })}>Médio</th>
                    <th style={thStyle({ background: '#fecaca' })}>Alto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={thStyle()}>Complexidade</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.complexity === 'Baixo')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.complexity === 'Médio')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.complexity === 'Alto')}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Risco</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.risk === 'Baixo')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.risk === 'Médio')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.risk === 'Alto')}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Prioridade</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.priority === 'Baixo')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.priority === 'Médio')}</td>
                    <td style={centerTdStyle()}>{checkboxMark(change.priority === 'Alto')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Dados da Atividade</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <tbody>
                  <tr>
                    <td style={thStyle({ width: '42%' })}>Tipo de Atividade</td>
                    <td style={tdStyle()}>
                      {checkboxMark(change.activity_type === 'Padrão')} Padrão{' '}
                      {checkboxMark(change.activity_type === 'Programada')} Programada{' '}
                      {checkboxMark(change.activity_type === 'Emergencial')} Emergencial
                    </td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Impacto no Serviço</td>
                    <td style={tdStyle()}>
                      {checkboxMark(change.service_impact === true)} Sim{' '}
                      {checkboxMark(change.service_impact === false)} Não
                    </td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Hora de Início da Atividade</td>
                    <td style={tdStyle()}>{formatDateTime(change.start_time)}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Hora de Término da Atividade</td>
                    <td style={tdStyle()}>{formatDateTime(change.end_time)}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Tempo estimado de duração do impacto</td>
                    <td style={tdStyle()}>{change.impact_duration || '-'}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Tempo estimado para execução do rollback</td>
                    <td style={tdStyle()}>{change.rollback_duration || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Contatos da Atividade</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}>Nome</th>
                    <th style={thStyle()}>Empresa</th>
                    <th style={thStyle()}>Telefone de Contato</th>
                    <th style={thStyle({ borderRight: '1px solid #1f2937' })}>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length > 0 ? (
                    contacts.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>{item?.name || '-'}</td>
                        <td style={tdStyle()}>{item?.company || '-'}</td>
                        <td style={tdStyle()}>{item?.phone || '-'}</td>
                        <td style={tdStyle()}>{item?.email || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={tdStyle({ textAlign: 'center' })} colSpan={4}>
                        Nenhum contato informado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Matriz de Responsabilidades</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}>Nome</th>
                    <th style={thStyle()}>Planejamento (MOP focal)</th>
                    <th style={thStyle()}>Execução</th>
                    <th style={thStyle()}>Validação (Testes)</th>
                    <th style={thStyle()}>Day after (monitoramento)</th>
                    <th style={thStyle()}>Day after (rollback)</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.length > 0 ? (
                    matrix.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>{item?.name || '-'}</td>
                        <td style={centerTdStyle()}>{checkboxMark(!!item?.planning)}</td>
                        <td style={centerTdStyle()}>{checkboxMark(!!item?.execution)}</td>
                        <td style={centerTdStyle()}>{checkboxMark(!!item?.validation)}</td>
                        <td style={centerTdStyle()}>{checkboxMark(!!item?.dayAfterMonitoring)}</td>
                        <td style={centerTdStyle()}>{checkboxMark(!!item?.dayAfterRollback)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={tdStyle({ textAlign: 'center' })} colSpan={6}>
                        Nenhuma responsabilidade informada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Caderno de Testes</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}>Teste</th>
                    <th style={thStyle()}>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.length > 0 ? (
                    tests.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>{item?.test || '-'}</td>
                        <td style={tdStyle()}>{item?.responsible || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={tdStyle({ textAlign: 'center' })} colSpan={2}>
                        Nenhum teste informado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Serviços afetados</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}>Nome</th>
                    <th style={thStyle()}>Sem afetação</th>
                    <th style={thStyle()}>Afetação Baixa</th>
                    <th style={thStyle()}>Afetação Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((item, index) => (
                    <tr key={index}>
                      <td style={tdStyle()}>{item.name}</td>
                      <td style={centerTdStyle()}>{checkboxMark(item.impact === 'SEM_AFETACAO')}</td>
                      <td style={centerTdStyle()}>{checkboxMark(item.impact === 'AFETACAO_BAIXA')}</td>
                      <td style={centerTdStyle()}>{checkboxMark(item.impact === 'AFETACAO_ALTA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Detalhes Técnicos</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <tbody>
                  <tr>
                    <td style={thStyle({ width: '38%' })}>Responsável</td>
                    <td style={tdStyle()}>{change.responsible_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Plataformas / Aplicações / Sites Afetados</td>
                    <td style={tdStyle()}>{change.affected_platforms || '-'}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Descrição detalhada da mudança</td>
                    <td style={tdStyle()}>{change.technical_description || '-'}</td>
                  </tr>
                  <tr>
                    <td style={thStyle()}>Descrição do rollback</td>
                    <td style={tdStyle()}>{change.rollback_description || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Script de Execução</div>
            <div style={monospacedBoxStyle()}>
              {change.execution_script_text || 'Nenhum script de execução informado.'}
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Script de Rollback</div>
            <div style={monospacedBoxStyle()}>
              {change.rollback_script_text || 'Nenhum script de rollback informado.'}
            </div>
          </div>

          <div style={sectionStyle()}>
            <div style={sectionHeaderStyle()}>Timeline de Execução</div>
            <div style={sectionBodyStyle()}>
              <table style={tableStyle()}>
                <thead>
                  <tr>
                    <th style={thStyle()}>Horário</th>
                    <th style={thStyle()}>Atividade</th>
                    <th style={thStyle()}>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.length > 0 ? (
                    timeline.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle()}>{item?.time || '-'}</td>
                        <td style={tdStyle()}>{item?.activity || '-'}</td>
                        <td style={tdStyle()}>{item?.responsible || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={tdStyle({ textAlign: 'center' })} colSpan={3}>
                        Nenhuma linha de timeline informada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {change.manager_comment ? (
            <div style={sectionStyle()}>
              <div style={sectionHeaderStyle()}>Parecer do Manager</div>
              <div style={simpleValueStyle()}>{change.manager_comment}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function PrintPage() {
  return (
    <AuthGuard>
      <PrintPageContent />
    </AuthGuard>
  )
}