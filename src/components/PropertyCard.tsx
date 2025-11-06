'use client';

import { useState } from 'react';
import { Property } from '@/types/property';
import { usePropertyStore } from '@/store/propertyStore';
import { Heart, MapPin, Bed, Bath, Square, Phone, ExternalLink, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
    const { updateProperty, deleteProperty } = usePropertyStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
    const [allImagesFailed, setAllImagesFailed] = useState(false);

    const handleImageError = (imageUrl: string) => {
        console.log('Image failed to load:', imageUrl);
        const newErrors = { ...imageErrors, [imageUrl]: true };
        setImageErrors(newErrors);

        // Check if all images have failed
        const failedCount = Object.keys(newErrors).length;
        if (failedCount >= property.images.length) {
            console.log('All images failed for property:', property.address);
            setAllImagesFailed(true);
        }
    };

    const getWorkingImages = () => {
        return property.images.filter(url => !imageErrors[url]);
    };

    const workingImages = getWorkingImages();
    const hasWorkingImages = workingImages.length > 0;

    const nextImage = () => {
        if (hasWorkingImages) {
            setCurrentImageIndex((prev) => (prev + 1) % workingImages.length);
        }
    };

    const prevImage = () => {
        if (hasWorkingImages) {
            setCurrentImageIndex((prev) => (prev - 1 + workingImages.length) % workingImages.length);
        }
    };

    const handleStatusChange = (field: keyof Property['status'], value: string | boolean) => {
        updateProperty(property.id, {
            status: { ...property.status, [field]: value }
        });
    };

    const handlePreferenceChange = (field: keyof Property['preferences'], value: boolean) => {
        updateProperty(property.id, {
            preferences: { ...property.preferences, [field]: value }
        });
    };

    const currentImage = hasWorkingImages ? workingImages[currentImageIndex] : null;

    return (
        <div className="property-card overflow-hidden">
            {/* Image Section */}
            <div className="relative h-48 bg-gray-100">
                {allImagesFailed ? (
                    // Show placeholder when all images fail
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-center text-gray-500">
                            <ImageIcon size={48} className="mx-auto mb-2" />
                            <p className="text-sm">Images unavailable</p>
                        </div>
                    </div>
                ) : currentImage ? (
                    <>
                        <img
                            src={currentImage}
                            alt={property.address}
                            className="property-card-image"
                            onError={() => handleImageError(currentImage)}
                        />

                        {/* Image Navigation */}
                        {workingImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                                >
                                    <ChevronRight size={16} />
                                </button>

                                {/* Image Counter */}
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1} / {workingImages.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    // Loading state
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-gray-400">Loading images...</div>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {property.address}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin size={14} className="mr-1" />
                            <a
                                href={property.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline flex items-center"
                            >
                                View on Zillow
                                <ExternalLink size={12} className="ml-1" />
                            </a>
                        </div>
                    </div>

                    {/* Heart Actions */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handlePreferenceChange('maddieHeart', !property.preferences.maddieHeart)}
                            className={`heart-button maddie ${property.preferences.maddieHeart ? 'active' : ''}`}
                            title="Maddie likes this"
                        >
                            <Heart size={16} fill={property.preferences.maddieHeart ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={() => handlePreferenceChange('brittanieHeart', !property.preferences.brittanieHeart)}
                            className={`heart-button brittanie ${property.preferences.brittanieHeart ? 'active' : ''}`}
                            title="Brittanie likes this"
                        >
                            <Heart size={16} fill={property.preferences.brittanieHeart ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            ${parseInt(property.rent).toLocaleString()}
                        </div>
                        <div className="text-gray-500">per month</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                            <Bed size={14} className="mr-1" />
                            <span>{property.beds} bed</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Bath size={14} className="mr-1" />
                            <span>{property.baths} bath</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Square size={14} className="mr-1" />
                            <span>{parseInt(property.sqft).toLocaleString()} sqft</span>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">Contact</div>
                    <div className="text-sm text-gray-600">{property.contact.name}</div>
                    {property.contact.phone && (
                        <div className="flex items-center text-sm text-blue-600 mt-1">
                            <Phone size={12} className="mr-1" />
                            <a href={`tel:${property.contact.phone}`} className="hover:underline">
                                {property.contact.phone}
                            </a>
                        </div>
                    )}
                </div>

                {/* Status Tracking */}
                <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-900">Application Progress</div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm">
                            <input
                                type="date"
                                value={property.status.requestSent}
                                onChange={(e) => handleStatusChange('requestSent', e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                                placeholder="Request sent"
                            />
                            <span className="text-gray-600">Request sent</span>
                        </label>

                        <label className="flex items-center text-sm">
                            <input
                                type="date"
                                value={property.status.responseReceived}
                                onChange={(e) => handleStatusChange('responseReceived', e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                                placeholder="Response received"
                            />
                            <span className="text-gray-600">Response received</span>
                        </label>

                        <label className="flex items-center text-sm">
                            <input
                                type="datetime-local"
                                value={property.status.tourScheduled}
                                onChange={(e) => handleStatusChange('tourScheduled', e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                                placeholder="Tour scheduled"
                            />
                            <span className="text-gray-600">Tour scheduled</span>
                        </label>

                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={property.status.toured}
                                onChange={(e) => handleStatusChange('toured', e.target.checked)}
                                className="checkbox-custom mr-2"
                            />
                            <span className="text-gray-600">Toured</span>
                        </label>
                    </div>

                    <div>
                        <textarea
                            value={property.status.notes}
                            onChange={(e) => handleStatusChange('notes', e.target.value)}
                            placeholder="Add notes..."
                            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-none"
                            rows={2}
                        />
                    </div>
                </div>

                {/* Preferences */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <label className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={property.preferences.disliked}
                            onChange={(e) => handlePreferenceChange('disliked', e.target.checked)}
                            className="checkbox-custom mr-2"
                        />
                        <span className="text-gray-600">Not interested</span>
                    </label>

                    <button
                        onClick={() => deleteProperty(property.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
} 