import { type NextRequest, NextResponse } from "next/server"

// Mock user database
const mockUsers = [
  {
    id: "1",
    name: "John User",
    email: "user@demo.com",
    password: "password123",
    role: "user",
    isVerified: true,
  },
  {
    id: "2",
    name: "Jane Owner",
    email: "owner@demo.com",
    password: "password123",
    role: "owner",
    isVerified: true,
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@demo.com",
    password: "password123",
    role: "admin",
    isVerified: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Mock JWT token
    const token = `mock-jwt-token-${user.id}`

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
