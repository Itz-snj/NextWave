import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Mock signup process
    console.log("New user signup:", userData)

    // In a real app, you would:
    // 1. Validate the data
    // 2. Hash the password
    // 3. Save to database
    // 4. Send OTP email

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      userId: `mock-user-${Date.now()}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
