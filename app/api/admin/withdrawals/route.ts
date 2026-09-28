export async function GET() {
  const mockWithdrawals = [
    {
      id: "w1",
      userId: "user123",
      userName: "John Doe",
      amount: 500,
      currency: "USD",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      bankAccount: "****1234",
    },
    {
      id: "w2",
      userId: "user456",
      userName: "Jane Smith",
      amount: 100000,
      currency: "NGN",
      status: "pending",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      bankAccount: "****5678",
    },
    {
      id: "w3",
      userId: "user789",
      userName: "Alex Johnson",
      amount: 250,
      currency: "USD",
      status: "approved",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      bankAccount: "****9012",
    },
  ]

  return Response.json({
    withdrawals: mockWithdrawals,
  })
}
