'use client';

import { useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import { zillowService } from '@/services/zillowService';
import { LoadingSpinner } from './LoadingSpinner';

export function ZillowUrlInput() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showManualInputs, setShowManualInputs] = useState(false);

    // Manual input fields
    const [manualImageUrl, setManualImageUrl] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');

    const { addProperty } = usePropertyStore();

    const clearForm = () => {
        setUrl('');
        setManualImageUrl('');
        setOwnerName('');
        setOwnerPhone('');
        setOwnerEmail('');
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError('Please enter a Zillow URL');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            console.log('Processing Zillow URL...');
            const propertyData = await zillowService.scrapePropertyData(url.trim());

            // Override with manual inputs if provided
            const enhancedPropertyData = {
                ...propertyData,
                // Add manual image URL to the beginning of images array if provided
                images: manualImageUrl.trim()
                    ? [manualImageUrl.trim(), ...propertyData.images]
                    : propertyData.images,
                // Override contact info with manual inputs if provided
                contact: {
                    name: ownerName.trim() || propertyData.contact.name || 'Property Manager',
                    phone: ownerPhone.trim() || propertyData.contact.phone || '',
                    email: ownerEmail.trim() || undefined,
                }
            };

            addProperty({
                ...enhancedPropertyData,
                link: url.trim(),
                status: {
                    requestSent: '',
                    responseReceived: '',
                    tourScheduled: '',
                    toured: false,
                    notes: '',
                },
                preferences: {
                    maddieHeart: false,
                    brittanieHeart: false,
                    disliked: false,
                },
            });

            clearForm();

            // Show success message with info about data source
            const hasManualData = manualImageUrl.trim() || ownerName.trim() || ownerPhone.trim() || ownerEmail.trim();
            if (hasManualData) {
                setSuccessMessage('✅ Property added with your custom information!');
            } else if (propertyData.contact.name && propertyData.contact.name !== 'Property Manager') {
                setSuccessMessage('✅ Property added with real contact info!');
            } else if (propertyData.address && !propertyData.address.includes('Downtown')) {
                setSuccessMessage('✅ Property added with extracted address!');
            } else {
                setSuccessMessage('✅ Property added successfully!');
            }

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process property data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Main URL Input */}
            <div>
                <label htmlFor="zillow-url" className="sr-only">
                    Zillow URL
                </label>
                <div className="flex gap-3">
                    <input
                        id="zillow-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.zillow.com/homedetails/..."
                        className="input-field flex-1"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="btn-primary min-w-[120px] flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            'Add Property'
                        )}
                    </button>
                </div>
            </div>

            {/* Toggle for Manual Inputs */}
            <div className="border-t border-gray-200 pt-4">
                <button
                    type="button"
                    onClick={() => setShowManualInputs(!showManualInputs)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={loading}
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${showManualInputs ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Add Custom Image & Owner Information
                </button>
            </div>

            {/* Manual Input Fields */}
            {showManualInputs && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="text-sm text-gray-700 mb-3">
                        <strong>Override scraped data:</strong> These fields will take priority over auto-extracted information
                    </div>

                    {/* Image URL */}
                    <div>
                        <label htmlFor="manual-image" className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Image URL
                        </label>
                        <input
                            id="manual-image"
                            type="url"
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            placeholder="https://images.example.com/property.jpg"
                            className="input-field w-full"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This image will appear first in the property gallery
                        </p>
                    </div>

                    {/* Owner Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="owner-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Owner/Contact Name
                            </label>
                            <input
                                id="owner-name"
                                type="text"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="John Smith"
                                className="input-field w-full"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="owner-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                id="owner-phone"
                                type="tel"
                                value={ownerPhone}
                                onChange={(e) => setOwnerPhone(e.target.value)}
                                placeholder="(512) 555-0123"
                                className="input-field w-full"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="owner-email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="owner-email"
                                type="email"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                placeholder="contact@property.com"
                                className="input-field w-full"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Clear Manual Inputs Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setManualImageUrl('');
                                setOwnerName('');
                                setOwnerPhone('');
                                setOwnerEmail('');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Clear custom fields
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                    {successMessage}
                </div>
            )}
        </form>
    );
} 