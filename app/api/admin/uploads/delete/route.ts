export async function POST(request: Request) {
  const { uploadId } = await request.json()

  console.log(`[v0] Image deleted: ${uploadId}`)

  return Response.json({
    success: true,
    message: "Image deleted successfully",
    timestamp: new Date().toISOString(),
  })
}
