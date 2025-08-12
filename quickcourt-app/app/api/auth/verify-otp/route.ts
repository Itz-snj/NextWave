import { type NextRequest, NextResponse } from "next/server";
import { dbConnect, OTP, User } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ 
        error: "Email and OTP are required" 
      }, { status: 400 });
    }

    // Find the OTP record for this email
    const otpRecord = await OTP.findOne({ 
      email, 
      isUsed: false, 
      expiresAt: { $gt: new Date() } 
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        error: "Invalid or expired OTP. Please request a new one." 
      }, { status: 400 });
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ 
        error: "Too many failed attempts. Please request a new OTP." 
      }, { status: 400 });
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
    
    if (!isOTPValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = 3 - otpRecord.attempts;
      return NextResponse.json({ 
        error: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      }, { status: 400 });
    }

    // OTP is valid - mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user and mark as verified
    const user = await User.findOne({ email });
    if (user) {
      user.isVerified = true;
      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(email, user.name);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the verification if welcome email fails
      }
    }

    return NextResponse.json({ 
      message: "OTP verified successfully",
      email: email,
      isVerified: true
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
