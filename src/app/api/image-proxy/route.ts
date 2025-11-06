import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    console.log('🖼️ Image proxy request for:', imageUrl);

    if (!imageUrl) {
        console.error('❌ No URL parameter provided');
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        console.log('🔄 Fetching image from:', imageUrl);

        // Fetch the image from the external URL
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.zillow.com/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            },
        });

        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            console.error('❌ Failed to fetch image:', response.status, response.statusText);
            return new NextResponse(`Failed to fetch image: ${response.status} ${response.statusText}`, {
                status: response.status
            });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        console.log('✅ Successfully proxied image, size:', imageBuffer.byteLength, 'bytes, type:', contentType);

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('💥 Image proxy error:', error);
        return new NextResponse(`Failed to proxy image: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            status: 500
        });
    }
} 