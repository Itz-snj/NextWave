import { type NextRequest, NextResponse } from "next/server";
import { dbConnect, User } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const file = formData.get('avatar') as File;

    if (!userId || !file) {
      return NextResponse.json({ 
        error: "User ID and avatar file are required" 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Only JPEG, PNG, and WebP images are allowed" 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File size must be less than 5MB" 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/avatars/${fileName}`;

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: publicUrl },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar: publicUrl
    });

  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
