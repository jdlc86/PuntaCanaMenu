export function moneyEUR(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n)
}

export function buildWAText(orderId: string, total: number, tip = 0): string {
  const parts = ["*Nuevo pedido*"]

  if (tip > 0) {
    const subtotal = total - tip
    parts.push(`Subtotal: ${moneyEUR(subtotal)}`)
    parts.push(`Propina: ${moneyEUR(tip)}`)
  }

  parts.push(`Total: ${moneyEUR(total)}`)
  parts.push("", `[ORDER] ${orderId}`)

  return parts.join("\n")
}
