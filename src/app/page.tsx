'use client';

import { useEffect, useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import { ZillowUrlInput } from '@/components/ZillowUrlInput';
import { PropertyFilters } from '@/components/PropertyFilters';
import { PropertyGrid } from '@/components/PropertyGrid';
import { TourCalendar } from '@/components/TourCalendar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { dataService } from '@/services/dataService';

export default function HomePage() {
    const {
        properties,
        loading,
        loadProperties,
        getFilteredProperties
    } = usePropertyStore();

    const [initialized, setInitialized] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        const initializeApp = async () => {
            console.log('🚀 Initializing Zoo Hunter app...');
            await loadProperties();
            setInitialized(true);
            console.log('✅ App initialized');
        };

        initializeApp();
    }, [loadProperties]);

    // Auto-refresh every 30 seconds to keep data in sync
    useEffect(() => {
        if (!initialized) return;

        const interval = setInterval(async () => {
            console.log('🔄 Auto-refreshing data...');
            await loadProperties();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [initialized, loadProperties]);

    const handleLoadSampleData = async () => {
        setLoadingSample(true);
        try {
            console.log('📦 Loading sample data...');
            await dataService.loadSampleData();
            await loadProperties();
            console.log('✅ Sample data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load sample data:', error);
        } finally {
            setLoadingSample(false);
        }
    };

    const filteredProperties = getFilteredProperties();
    const propertiesWithTours = properties.filter(
        prop => prop.status.tourScheduled && prop.status.tourScheduled.trim() !== ''
    );

    if (!initialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading Zoo Hunter...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">🦓 Zoo Hunter</h1>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* URL Input */}
                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Property from Zillow</h2>
                        <ZillowUrlInput />
                    </section>

                    {/* Properties Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {viewMode === 'list' ? `Properties (${filteredProperties.length})` : 'Tour Calendar'}
                                </h2>

                                {/* View toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        📋 List View
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        🗓️ Calendar ({propertiesWithTours.length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <div className="text-gray-500 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H7m12 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                                <p className="text-gray-500 mb-4">Add a Zillow URL above or load sample data to get started</p>
                                <button
                                    onClick={handleLoadSampleData}
                                    disabled={loadingSample}
                                    className="btn-primary"
                                >
                                    {loadingSample ? <LoadingSpinner /> : 'Load Sample Properties'}
                                </button>
                            </div>
                        ) : viewMode === 'calendar' ? (
                            <TourCalendar />
                        ) : (
                            <div className="space-y-6">
                                {/* Filters moved to top */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filters & Sorting</h3>
                                    <PropertyFilters />
                                </div>

                                {/* Property Grid */}
                                <PropertyGrid properties={filteredProperties} />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
} 