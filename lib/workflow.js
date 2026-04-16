// lib/workflow.js

export const STATUS = {
  RASCUNHO: 'RASCUNHO',
  EM_CORRECAO: 'EM_CORRECAO',
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO'
}

const ALLOWED_TRANSITIONS = {
  RASCUNHO: [STATUS.APROVADO, STATUS.REPROVADO, STATUS.EM_CORRECAO],
  EM_CORRECAO: [STATUS.RASCUNHO, STATUS.APROVADO, STATUS.REPROVADO],
  REPROVADO: [STATUS.RASCUNHO],
  APROVADO: []
}

export function canTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || []
  return allowed.includes(nextStatus)
}

export function validateTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) {
    return {
      valid: false,
      message: 'Status atual ou status de destino não informado.'
    }
  }

  if (currentStatus === nextStatus) {
    return {
      valid: false,
      message: 'O status já está neste valor.'
    }
  }

  const isAllowed = canTransition(currentStatus, nextStatus)

  if (!isAllowed) {
    return {
      valid: false,
      message: `Transição inválida: ${currentStatus} → ${nextStatus}`
    }
  }

  return {
    valid: true,
    message: 'Transição válida.'
  }
}

export function getAvailableTransitions(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] || []
}