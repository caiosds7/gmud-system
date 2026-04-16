// lib/permissions.js

export function getEditPermission(task, profile) {
  if (!task) {
    return {
      allowed: false,
      reason: 'Tarefa não encontrada.'
    }
  }

  if (!profile) {
    return {
      allowed: false,
      reason: 'Perfil do usuário não carregado.'
    }
  }

  const role = profile.role
  const userId = profile.id
  const status = task.status

  if (status === 'APROVADO') {
    return {
      allowed: false,
      reason: 'Esta MOP está APROVADA e não pode mais ser editada.'
    }
  }

  if (role === 'MANAGER') {
    return {
      allowed: true,
      reason: ''
    }
  }

  if (role === 'ENGINEER') {
    if (task.executor_id !== userId) {
      return {
        allowed: false,
        reason: 'Você não pode editar esta MOP porque ela pertence a outro responsável.'
      }
    }

    if (status !== 'RASCUNHO' && status !== 'EM_CORRECAO') {
      return {
        allowed: false,
        reason: 'ENGINEER só pode editar MOP própria em RASCUNHO ou EM_CORRECAO.'
      }
    }

    return {
      allowed: true,
      reason: ''
    }
  }

  return {
    allowed: false,
    reason: 'Seu perfil não tem permissão para editar MOPs.'
  }
}

export function canEditTask(task, profile) {
  return getEditPermission(task, profile).allowed
}

export function getStatusManagementPermission(task, profile) {
  if (!task) {
    return {
      allowed: false,
      reason: 'Tarefa não encontrada.'
    }
  }

  if (!profile) {
    return {
      allowed: false,
      reason: 'Perfil do usuário não carregado.'
    }
  }

  if (profile.role !== 'MANAGER') {
    return {
      allowed: false,
      reason: 'Somente usuários com perfil MANAGER podem alterar o status.'
    }
  }

  if (task.status === 'APROVADO') {
    return {
      allowed: false,
      reason: 'Esta MOP está APROVADA e não pode mais ter o status alterado.'
    }
  }

  return {
    allowed: true,
    reason: ''
  }
}

export function canManageStatus(task, profile) {
  return getStatusManagementPermission(task, profile).allowed
}