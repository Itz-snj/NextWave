import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('🔑 Signature request received');
    
    // Check if Cloudinary is configured
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
    
    console.log('🔧 Environment check:', { hasCloudName, hasApiKey, hasApiSecret });
    console.log('📝 Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    
    if (!hasCloudName || !hasApiKey || !hasApiSecret) {
      console.error('❌ Missing Cloudinary environment variables');
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please add CLOUDINARY_* environment variables.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { folder = 'venues' } = body;

    // Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000);

    // Parameters to include in signature
    const params = {
      timestamp: timestamp.toString(),
      folder,
      // Add any other upload parameters you want to enforce
      // resource_type: 'image',
      // format: 'auto',
      // quality: 'auto'
    };

    // Create the string to sign
    const paramsToSign = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    // Generate signature
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
      .digest('hex');

    console.log('✅ Signature generated successfully');
    console.log('📤 Returning signature data:', {
      timestamp,
      hasSignature: !!signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}