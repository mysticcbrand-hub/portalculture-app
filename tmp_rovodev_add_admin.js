// Script temporal para añadir admin a la waitlist
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('URL:', supabaseUrl ? '✅' : '❌')
console.log('Key:', supabaseServiceKey ? '✅' : '❌')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAdmin() {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', 'mysticcbrand@gmail.com')
      .single()

    if (existing) {
      console.log('✅ Admin ya existe en waitlist:', existing)
      
      // Actualizar a approved si no lo está
      if (existing.status !== 'approved') {
        const { error } = await supabase
          .from('waitlist')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('email', 'mysticcbrand@gmail.com')
        
        if (error) throw error
        console.log('✅ Status actualizado a approved')
      }
      return
    }

    // Si no existe, crear
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: 'mysticcbrand@gmail.com',
          name: 'Admin',
          status: 'approved',
          approved_at: new Date().toISOString(),
          metadata: { admin: true }
        }
      ])
      .select()

    if (error) throw error

    console.log('✅ Admin añadido a waitlist:', data)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addAdmin()
