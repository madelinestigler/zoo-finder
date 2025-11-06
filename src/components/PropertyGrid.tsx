'use client';

import { Property } from '@/types/property';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
    properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
    if (properties.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties to show
                </h3>
                <p className="text-gray-600">
                    Add your first property using the Zillow URL input above, or adjust your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
            ))}
        </div>
    );
} 