import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Property } from '@/types/property';

// Initialize Redis client
const redis = Redis.fromEnv();

const DATA_KEY = 'zoo-hunter-shared-properties';

interface SharedData {
    properties: Property[];
    lastUpdated: string;
}

// GET - Load shared properties
export async function GET() {
    try {
        console.log('📖 Loading shared properties from Redis...');

        const data = await redis.get<SharedData>(DATA_KEY);

        if (!data) {
            console.log('📂 No shared data found, returning empty array');
            return NextResponse.json({
                success: true,
                properties: [],
                lastUpdated: new Date().toISOString()
            });
        }

        console.log('✅ Loaded', data.properties.length, 'shared properties');
        return NextResponse.json({
            success: true,
            properties: data.properties,
            lastUpdated: data.lastUpdated
        });
    } catch (error) {
        console.error('❌ Error reading shared data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to read shared data',
            properties: []
        }, { status: 500 });
    }
}

// POST - Save shared properties
export async function POST(request: NextRequest) {
    try {
        const { properties } = await request.json();

        if (!Array.isArray(properties)) {
            return NextResponse.json({
                success: false,
                error: 'Properties must be an array'
            }, { status: 400 });
        }

        console.log('💾 Saving', properties.length, 'properties to shared Redis...');

        const sharedData: SharedData = {
            properties,
            lastUpdated: new Date().toISOString()
        };

        await redis.set(DATA_KEY, sharedData);

        console.log('✅ Saved shared properties successfully');

        return NextResponse.json({
            success: true,
            message: `Saved ${properties.length} shared properties`,
            lastUpdated: sharedData.lastUpdated
        });
    } catch (error) {
        console.error('❌ Error saving shared data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to save shared data'
        }, { status: 500 });
    }
}

// DELETE - Clear all shared data
export async function DELETE() {
    try {
        console.log('🗑️ Clearing all shared data...');

        await redis.del(DATA_KEY);

        console.log('✅ All shared data cleared successfully');

        return NextResponse.json({
            success: true,
            message: 'All shared data cleared'
        });
    } catch (error) {
        console.error('❌ Error clearing shared data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to clear shared data'
        }, { status: 500 });
    }
} 