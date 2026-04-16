import { supabase } from './supabase'

export async function getCurrentUserWithProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user) {
    return { user: null, profile: null }
  }

  const user = authData.user

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { user, profile: null }
  }

  return { user, profile }
}