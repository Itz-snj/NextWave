import { type NextRequest, NextResponse } from "next/server"
import { dbConnect, User } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No valid token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    
    // For now, we're using mock tokens, so extract user ID from token
    // In production, you'd verify JWT token properly
    if (!token.startsWith("mock-jwt-token-")) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
    }
    
    const userId = token.replace("mock-jwt-token-", "")
    
    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone || "",
        location: user.location || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          privacyLevel: 'public'
        }
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}