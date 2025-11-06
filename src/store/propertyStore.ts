import { create } from 'zustand';
import { Property, PropertyFilters } from '@/types/property';
import { dataService } from '@/services/dataService';

interface PropertyStore {
    properties: Property[];
    filters: PropertyFilters;
    loading: boolean;

    // Actions
    addProperty: (property: Omit<Property, 'id'>) => void;
    updateProperty: (id: string, updates: Partial<Property>) => void;
    deleteProperty: (id: string) => void;
    setFilters: (filters: Partial<PropertyFilters>) => void;
    loadProperties: () => Promise<void>;
    saveProperties: () => Promise<void>;

    // Computed getters
    getFilteredProperties: () => Property[];
}

const initialFilters: PropertyFilters = {
    showOnlyHearted: false,
    showOnlyUnhearted: false,
    showOnlyMaddieHearted: false,
    showOnlyBrittanieHearted: false,
    showDisliked: true,
    sortBy: 'date-added',
};

export const usePropertyStore = create<PropertyStore>((set, get) => ({
    properties: [],
    filters: initialFilters,
    loading: false,

    addProperty: (propertyData) => {
        const newProperty: Property = {
            id: crypto.randomUUID(),
            address: propertyData.address,
            link: propertyData.link,
            images: propertyData.images,
            rent: propertyData.rent,
            sqft: propertyData.sqft,
            beds: propertyData.beds,
            baths: propertyData.baths,
            contact: propertyData.contact,
            status: {
                requestSent: propertyData.status?.requestSent || '',
                responseReceived: propertyData.status?.responseReceived || '',
                tourScheduled: propertyData.status?.tourScheduled || '',
                toured: propertyData.status?.toured || false,
                notes: propertyData.status?.notes || '',
            },
            preferences: {
                maddieHeart: propertyData.preferences?.maddieHeart || false,
                brittanieHeart: propertyData.preferences?.brittanieHeart || false,
                disliked: propertyData.preferences?.disliked || false,
            },
        };

        console.log('➕ Adding property to store:', newProperty.address);
        set((state) => {
            const newProperties = [...state.properties, newProperty];
            console.log('📊 Total properties in store:', newProperties.length);
            return { properties: newProperties };
        });

        // Auto-save to file
        get().saveProperties();
    },

    updateProperty: (id, updates) => {
        console.log('✏️ Updating property in store:', id);
        set((state) => ({
            properties: state.properties.map(prop =>
                prop.id === id ? { ...prop, ...updates } : prop
            )
        }));

        // Auto-save to file
        get().saveProperties();
    },

    deleteProperty: (id) => {
        console.log('🗑️ Deleting property from store:', id);
        set((state) => {
            const newProperties = state.properties.filter(prop => prop.id !== id);
            console.log('📊 Total properties after delete:', newProperties.length);
            return { properties: newProperties };
        });

        // Auto-save to file
        get().saveProperties();
    },

    setFilters: (newFilters) => {
        console.log('🔍 Updating filters:', newFilters);
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }));
    },

    loadProperties: async () => {
        console.log('📂 Loading properties from file...');
        set({ loading: true });
        try {
            const properties = await dataService.loadProperties();
            set({ properties, loading: false });
            console.log('✅ Properties loaded into store:', properties.length);
        } catch (error) {
            console.error('❌ Failed to load properties:', error);
            set({ loading: false });
        }
    },

    saveProperties: async () => {
        try {
            const { properties } = get();
            await dataService.saveProperties(properties);
        } catch (error) {
            console.error('❌ Failed to save properties:', error);
        }
    },

    getFilteredProperties: () => {
        const { properties, filters } = get();

        let filtered = [...properties];

        // Apply preference filters
        if (filters.showOnlyHearted) {
            filtered = filtered.filter(prop =>
                prop.preferences.maddieHeart || prop.preferences.brittanieHeart
            );
        }

        if (filters.showOnlyUnhearted) {
            filtered = filtered.filter(prop =>
                !prop.preferences.maddieHeart && !prop.preferences.brittanieHeart
            );
        }

        // Apply individual person filters
        if (filters.showOnlyMaddieHearted) {
            filtered = filtered.filter(prop => prop.preferences.maddieHeart);
        }

        if (filters.showOnlyBrittanieHearted) {
            filtered = filtered.filter(prop => prop.preferences.brittanieHeart);
        }

        if (!filters.showDisliked) {
            filtered = filtered.filter(prop =>
                !prop.preferences.disliked
            );
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => parseInt(a.rent) - parseInt(b.rent));
                break;
            case 'price-high':
                filtered.sort((a, b) => parseInt(b.rent) - parseInt(a.rent));
                break;
            case 'date-added':
            default:
                // Keep original order (most recently added first)
                filtered.reverse();
                break;
        }

        return filtered;
    },
})); 