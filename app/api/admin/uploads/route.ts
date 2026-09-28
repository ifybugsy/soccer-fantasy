export async function GET() {
  const mockUploads = [
    {
      id: "img1",
      userId: "user123",
      userName: "John Doe",
      fileName: "profile_pic.jpg",
      type: "profile",
      status: "approved",
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      imageUrl: "/diverse-professional-profiles.png",
    },
    {
      id: "img2",
      userId: "user456",
      userName: "Jane Smith",
      fileName: "gameplay_screenshot.png",
      type: "activity",
      status: "pending",
      uploadedAt: new Date(Date.now() - 3600000).toISOString(),
      imageUrl: "/gaming-screenshot.jpg",
    },
    {
      id: "img3",
      userId: "user789",
      userName: "Alex Johnson",
      fileName: "kyc_document.pdf",
      type: "document",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      imageUrl: "/document-stack.png",
    },
  ]

  return Response.json({
    uploads: mockUploads,
  })
}
