import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id,
      valorMensual,
      top3Cosas,
      otroTop3,
      probabilidad6Meses,
      motivacionSeguir,
      ayudaPortal,
      menosGustado,
      preferenciaAprendizaje,
      vidaEn2Anos,
    } = body

    // Validaciones
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar que el usuario está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Insertar respuestas
    const { data, error } = await supabase
      .from('post_compra_responses')
      .insert({
        user_id,
        valor_mensual: valorMensual,
        top3_cosas: top3Cosas,
        otro_top3: otroTop3 || null,
        probabilidad_6_meses: probabilidad6Meses,
        motivacion_seguir: motivacionSeguir,
        ayuda_portal: ayudaPortal,
        menos_gustado: menosGustado,
        preferencia_aprendizaje: preferenciaAprendizaje,
        vida_en_2_anos: vidaEn2Anos,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting post-compra response:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      
      // Si ya existe una respuesta (unique constraint)
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Ya has completado este cuestionario anteriormente' 
        }, { status: 409 })
      }

      // Tabla no existe
      if (error.code === '42P01') {
        return NextResponse.json({
          error: 'Tabla post_compra_responses no existe. Ejecuta el SQL en Supabase.'
        }, { status: 500 })
      }

      // RLS / permisos
      if (error.code === '42501') {
        return NextResponse.json({
          error: 'Permisos insuficientes en post_compra_responses. Revisa las políticas RLS.'
        }, { status: 500 })
      }
      
      throw error
    }

    console.log('✅ Post-compra response saved:', user_id)

    return NextResponse.json({ 
      success: true,
      message: 'Respuestas guardadas correctamente',
      data
    })

  } catch (error: any) {
    console.error('Error in post-compra submit:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
