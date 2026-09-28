export async function POST(request: Request) {
  const { uploadId } = await request.json()

  console.log(`[v0] Image rejected: ${uploadId}`)

  return Response.json({
    success: true,
    message: "Image rejected successfully",
    timestamp: new Date().toISOString(),
  })
}
