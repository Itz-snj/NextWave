import { type NextRequest, NextResponse } from "next/server";
import { dbConnect, OTP } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if there's already an unused OTP for this email
    const existingOTP = await OTP.findOne({ 
      email, 
      isUsed: false, 
      expiresAt: { $gt: new Date() } 
    });

    if (existingOTP) {
      // Check if we can resend (wait at least 1 minute between requests)
      const timeSinceLastOTP = Date.now() - existingOTP.createdAt.getTime();
      if (timeSinceLastOTP < 60000) { // 1 minute = 60000ms
        const remainingTime = Math.ceil((60000 - timeSinceLastOTP) / 1000);
        return NextResponse.json({ 
          error: `Please wait ${remainingTime} seconds before requesting another OTP` 
        }, { status: 429 });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    const otpRecord = new OTP({
      email,
      otp: hashedOTP,
      expiresAt,
      isUsed: false,
      attempts: 0
    });

    await otpRecord.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      // If email fails, delete the OTP record
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json({ 
        error: "Failed to send OTP email. Please try again." 
      }, { status: 500 });
    }

    // In development, also log the OTP to console for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({ 
      message: "OTP sent successfully",
      email: email
    });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
