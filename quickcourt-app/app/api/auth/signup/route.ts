import { type NextRequest, NextResponse } from "next/server"
import { dbConnect, User, OTP } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendOTPEmail } from "@/lib/email"

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

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
    });

    // Generate and store OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOTP = await bcrypt.hash(otpCode, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Clear any existing OTP for this email
    await OTP.deleteMany({ email })

    // Store new OTP
    await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt,
      isUsed: false,
      attempts: 0
    })

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode)
      console.log(`🔐 OTP for ${email}: ${otpCode}`)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      // Don't fail signup if email fails, user can request new OTP
    }

    return NextResponse.json({
      message: "User created successfully. Please verify your email with the OTP sent to you.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
