export async function POST(request: Request) {
  const { uploadId } = await request.json()

  console.log(`[v0] Image approved: ${uploadId}`)

  return Response.json({
    success: true,
    message: "Image approved successfully",
    timestamp: new Date().toISOString(),
  })
}
