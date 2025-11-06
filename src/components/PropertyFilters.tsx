'use client';

import { usePropertyStore } from '@/store/propertyStore';

export function PropertyFilters() {
    const { filters, setFilters } = usePropertyStore();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Filters</h3>

            <div className="space-y-3">
                {/* Preference Filters */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preferences</h4>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.showOnlyHearted}
                                onChange={(e) => setFilters({ showOnlyHearted: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Only show hearted properties</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.showOnlyUnhearted}
                                onChange={(e) => setFilters({ showOnlyUnhearted: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Only show unhearted properties</span>
                        </label>

                        {/* Individual person filters */}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <h5 className="text-xs font-medium text-gray-500 mb-2">Show only properties hearted by:</h5>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.showOnlyMaddieHearted}
                                    onChange={(e) => setFilters({ showOnlyMaddieHearted: e.target.checked })}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">💚 Maddie's favorites</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.showOnlyBrittanieHearted}
                                    onChange={(e) => setFilters({ showOnlyBrittanieHearted: e.target.checked })}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">💜 Brittanie's favorites</span>
                            </label>
                        </div>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.showDisliked}
                                onChange={(e) => setFilters({ showDisliked: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Show disliked properties</span>
                        </label>
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sort by</h4>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ sortBy: e.target.value as 'date-added' | 'price-low' | 'price-high' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                        <option value="date-added">Date Added (Newest First)</option>
                        <option value="price-low">Price (Low to High)</option>
                        <option value="price-high">Price (High to Low)</option>
                    </select>
                </div>
            </div>
        </div>
    );
} 