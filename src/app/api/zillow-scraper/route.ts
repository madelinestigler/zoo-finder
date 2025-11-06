import { NextRequest, NextResponse } from 'next/server';

// Fallback method when scraping fails
function fallbackToUrlParsing(url: string, reason: string = 'Unknown error') {
    console.log('Falling back to URL parsing. Reason:', reason);

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    const addressPart = pathParts.find(part =>
        part &&
        !part.includes('homedetails') &&
        !part.includes('_zpid') &&
        part.length > 5
    );

    let address = '';
    if (addressPart) {
        address = addressPart
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/Unit\s+(\w+)/i, 'UNIT $1');
    }

    return NextResponse.json({
        success: true,
        data: {
            address: address || 'Address not found',
            rent: '',
            beds: '',
            baths: '',
            sqft: '',
            images: [], // Always empty for fallback
            contact: { name: '', phone: '', email: '' },
            scraped: false
        },
        debug: {
            hasImages: false,
            imageCount: 0,
            hasContact: false,
            fallbackUsed: true,
            fallbackReason: reason
        }
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const zillowUrl = searchParams.get('url');

    if (!zillowUrl) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        console.log('🔍 Starting Zillow scrape for:', zillowUrl);

        // Fetch the Zillow page with browser-like headers
        const response = await fetch(zillowUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
            },
        });

        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to fetch Zillow page:', response.status, errorText.substring(0, 200));
            return fallbackToUrlParsing(zillowUrl, `HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        console.log('✅ Successfully fetched HTML, length:', html.length);

        // Check if we got blocked or redirected
        if (html.includes('Access denied') || html.includes('blocked') || html.includes('captcha')) {
            console.warn('🚫 Zillow blocked our request');
            return fallbackToUrlParsing(zillowUrl, 'Request blocked by Zillow');
        }

        if (html.length < 5000) {
            console.warn('⚠️ HTML response suspiciously small, likely not the full page');
            return fallbackToUrlParsing(zillowUrl, 'HTML response too small');
        }

        // Extract property data from the HTML
        const propertyData = {
            address: '',
            rent: '',
            beds: '',
            baths: '',
            sqft: '',
            images: [] as string[],
            contact: {
                name: '',
                phone: ''
            },
            scraped: true
        };

        // Extract address - try multiple patterns
        const addressPatterns = [
            /<h1[^>]*>([^<]*(?:St|Ave|Rd|Dr|Blvd|Ln|Ct|Pl)[^<]*)<\/h1>/i,
            /property-address[^>]*>([^<]*)/i,
            /"streetAddress":"([^"]+)"/i,
            /class="[^"]*address[^"]*"[^>]*>([^<]+)/i
        ];

        for (const pattern of addressPatterns) {
            const match = html.match(pattern);
            if (match) {
                propertyData.address = match[1].trim().replace(/\\"/g, '"');
                console.log('🏠 Found address:', propertyData.address);
                break;
            }
        }

        // Extract rent price - try multiple patterns
        const rentPatterns = [
            /\$(\d{1,3}(?:,\d{3})*)\/mo/i,
            /\$(\d{1,3}(?:,\d{3})*)\/month/i,
            /"price"[^>]*>\$(\d{1,3}(?:,\d{3})*)/i,
            /"price":"?\$?(\d{1,3}(?:,\d{3})*)/i
        ];

        for (const pattern of rentPatterns) {
            const match = html.match(pattern);
            if (match) {
                propertyData.rent = match[1].replace(',', '');
                console.log('💰 Found rent:', propertyData.rent);
                break;
            }
        }

        // Extract beds/baths
        const bedsMatch = html.match(/(\d+)\s*bed/i);
        if (bedsMatch) {
            propertyData.beds = bedsMatch[1];
            console.log('🛏️ Found beds:', propertyData.beds);
        }

        const bathsMatch = html.match(/(\d+(?:\.\d+)?)\s*bath/i);
        if (bathsMatch) {
            propertyData.baths = bathsMatch[1];
            console.log('🚿 Found baths:', propertyData.baths);
        }

        // Extract square footage
        const sqftMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*sqft/i);
        if (sqftMatch) {
            propertyData.sqft = sqftMatch[1].replace(',', '');
            console.log('📐 Found sqft:', propertyData.sqft);
        }

        // Extract images - look for Zillow image URLs with better patterns
        console.log('🖼️ Searching for images...');
        const imagePatterns = [
            /https:\/\/photos\.zillowstatic\.com\/[^"'\s]+\.(?:webp|jpg|jpeg|png)/gi,
            /https:\/\/wp\.zillowstatic\.com\/[^"'\s]+\.(?:webp|jpg|jpeg|png)/gi,
            /"(https:\/\/[^"]*photos\.zillowstatic\.com[^"]*\.(?:webp|jpg|jpeg|png)[^"]*)"/gi
        ];

        const foundImages = new Set<string>();

        for (const pattern of imagePatterns) {
            const matches = Array.from(html.matchAll(pattern));
            console.log(`Found ${matches.length} potential images with pattern ${pattern}`);

            for (const match of matches) {
                let imageUrl = match[1] || match[0];

                // Clean up the URL
                imageUrl = imageUrl.replace(/\\"/g, '').replace(/\\/g, '');

                // Skip obvious non-property images
                if (imageUrl.includes('logo') ||
                    imageUrl.includes('icon') ||
                    imageUrl.includes('sprite') ||
                    imageUrl.includes('avatar') ||
                    foundImages.size >= 10) {
                    continue;
                }

                // Ensure it's a complete URL
                if (!imageUrl.startsWith('http')) {
                    imageUrl = 'https://' + imageUrl;
                }

                // Convert to high-res version if not already
                if (!imageUrl.includes('cc_ft_')) {
                    imageUrl = imageUrl.replace(/\/[^\/]+(\.(webp|jpg|jpeg|png))/i, '/cc_ft_1536$1');
                }

                foundImages.add(imageUrl);
                console.log(`📸 Added image: ${imageUrl}`);
            }
        }

        propertyData.images = Array.from(foundImages);
        console.log(`🖼️ Total images found: ${propertyData.images.length}`);

        // Extract contact information
        const contactPatterns = [
            /contact\s+manager/i,
            /listing\s+agent[^<]*>([^<]+)/i,
            /agent[^<]*name[^<]*>([^<]+)/i,
            /property\s+manager[^<]*>([^<]+)/i
        ];

        for (const pattern of contactPatterns) {
            const match = html.match(pattern);
            if (match) {
                propertyData.contact.name = match[1]?.trim() || 'Property Manager';
                console.log('👤 Found contact:', propertyData.contact.name);
                break;
            }
        }

        // Extract phone number
        const phonePatterns = [
            /tel:([0-9\-\(\)\s]+)/,
            /(\(\d{3}\)\s*\d{3}-\d{4})/,
            /(\d{3}-\d{3}-\d{4})/
        ];

        for (const pattern of phonePatterns) {
            const match = html.match(pattern);
            if (match) {
                propertyData.contact.phone = match[1].trim();
                console.log('📞 Found phone:', propertyData.contact.phone);
                break;
            }
        }

        const extractionSummary = {
            address: !!propertyData.address,
            rent: !!propertyData.rent,
            beds: !!propertyData.beds,
            baths: !!propertyData.baths,
            sqft: !!propertyData.sqft,
            imageCount: propertyData.images.length,
            hasContact: !!(propertyData.contact.name && propertyData.contact.name !== 'Property Manager')
        };

        console.log('📊 Extraction summary:', extractionSummary);

        // Check if we got meaningful data
        const hasGoodData = propertyData.address || propertyData.rent || propertyData.images.length > 0;

        if (!hasGoodData) {
            console.warn('⚠️ No meaningful data extracted, using fallback');
            return fallbackToUrlParsing(zillowUrl, 'No meaningful data extracted from HTML');
        }

        return NextResponse.json({
            success: true,
            data: propertyData,
            debug: {
                hasImages: propertyData.images.length > 0,
                imageCount: propertyData.images.length,
                hasContact: !!(propertyData.contact.name || propertyData.contact.phone),
                firstImageUrl: propertyData.images[0],
                extractedFromHtml: true,
                extractionSummary
            }
        });

    } catch (error) {
        console.error('💥 Error scraping Zillow page:', error);
        return fallbackToUrlParsing(zillowUrl, `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 