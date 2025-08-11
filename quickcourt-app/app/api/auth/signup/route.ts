import { type NextRequest, NextResponse } from "next/server"
import { dbConnect, User } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userData = await request.json();
    const { name, email, password, role } = userData;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user" || "owner" || "admin",
      isVerified: false,
    });

    // TODO: Send OTP email here

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
