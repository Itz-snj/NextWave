import { type NextRequest, NextResponse } from "next/server";
import { dbConnect, User } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, profileData } = await request.json();

    if (!userId || !profileData) {
      return NextResponse.json({ 
        error: "User ID and profile data are required" 
      }, { status: 400 });
    }

    // Find and update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          avatar: profileData.avatar,
          bio: profileData.bio,
          'preferences.emailNotifications': profileData.preferences?.emailNotifications,
          'preferences.smsNotifications': profileData.preferences?.smsNotifications,
          'preferences.privacyLevel': profileData.preferences?.privacyLevel,
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        preferences: updatedUser.preferences,
        isVerified: updatedUser.isVerified,
      }
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
