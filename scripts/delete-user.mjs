// Script to delete a user from Supabase Auth
// Usage: node scripts/delete-user.mjs

import { readFileSync } from 'fs'

// Read .env.local to get credentials
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1) return
  const key = trimmed.substring(0, eqIndex).trim()
  const value = trimmed.substring(eqIndex + 1).trim()
  envVars[key] = value
})

const SUPABASE_URL = envVars['VITE_SUPABASE_URL']
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']

console.log('URL:', SUPABASE_URL)
console.log('Key length:', SERVICE_ROLE_KEY?.length)

const EMAIL_TO_DELETE = 'homiecontractor@hotmail.com'

async function deleteUser() {
  console.log(`\n🔍 Looking up user: ${EMAIL_TO_DELETE}`)

  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  })

  if (!listRes.ok) {
    console.error('❌ Failed to list users:', await listRes.text())
    process.exit(1)
  }

  const { users } = await listRes.json()
  const user = users.find(u => u.email === EMAIL_TO_DELETE)

  if (!user) {
    console.error(`❌ User with email "${EMAIL_TO_DELETE}" not found`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`)
  console.log(`   Role: ${user.user_metadata?.role || 'none'}`)
  console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)

  console.log(`🗑️  Deleting user...`)
  const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  })

  if (!deleteRes.ok) {
    console.error('❌ Failed to delete user:', await deleteRes.text())
    process.exit(1)
  }

  console.log(`✅ User "${EMAIL_TO_DELETE}" has been deleted!`)
  console.log(`   You can now sign up again with this email.`)
}

deleteUser()
