export async function GET() {
  const mockDeposits = [
    {
      id: "d1",
      userId: "user123",
      userName: "John Doe",
      amount: 500,
      currency: "USD",
      status: "completed",
      paymentMethod: "credit_card",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "d2",
      userId: "user456",
      userName: "Jane Smith",
      amount: 100000,
      currency: "NGN",
      status: "pending",
      paymentMethod: "bank_transfer",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "d3",
      userId: "user789",
      userName: "Alex Johnson",
      amount: 1000,
      currency: "USD",
      status: "completed",
      paymentMethod: "mobile_money",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  return Response.json({
    deposits: mockDeposits,
  })
}
