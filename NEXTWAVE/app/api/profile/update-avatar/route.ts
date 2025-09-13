import { type NextRequest, NextResponse } from "next/server";
import { dbConnect, User } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, avatar } = await request.json();

    if (!userId || !avatar) {
      return NextResponse.json({ 
        error: "User ID and avatar URL are required" 
      }, { status: 400 });
    }

    // Validate that the avatar URL is from Cloudinary
    if (!avatar.includes('res.cloudinary.com')) {
      return NextResponse.json({ 
        error: "Invalid avatar URL. Must be from Cloudinary." 
      }, { status: 400 });
    }

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Avatar updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json({ 
      error: "Failed to update avatar" 
    }, { status: 500 });
  }
}