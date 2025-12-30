export async function addToMailerlite(email: string, name: string) {
  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      fields: {
        name,
      },
      groups: [process.env.MAILERLITE_GROUP_ID],
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mailerlite error: ${error}`)
  }
  
  return response.json()
}

export async function sendApprovalEmail(email: string, name: string) {
  // Esta función enviará el email de aprobación
  // Mailerlite lo hará automáticamente vía automatización
  // cuando agregues el usuario al grupo de aprobados
  
  return addToMailerlite(email, name)
}
