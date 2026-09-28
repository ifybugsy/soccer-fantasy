export async function POST(req: Request) {
  const body = await req.json()
  const { withdrawalId, userId, amount, fee, netAmount, currency, action } = body

  console.log(`[v0] Processing withdrawal approval:`, {
    withdrawalId,
    amount,
    fee,
    netAmount,
    action,
  })

  // Simulate API call to payment processor
  return Response.json({
    success: true,
    message: `Withdrawal ${action}d successfully`,
    withdrawal: {
      id: withdrawalId,
      status: action,
      fee: fee,
      netAmount: netAmount,
      processedAt: new Date().toISOString(),
    },
  })
}
