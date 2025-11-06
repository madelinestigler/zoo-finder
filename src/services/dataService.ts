import { Property } from '@/types/property';

class DataService {
    async saveProperties(properties: Property[]): Promise<void> {
        try {
            console.log('💾 Saving', properties.length, 'properties to shared database...');

            const response = await fetch('/api/shared-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to save to shared database');
            }

            console.log('✅ Properties saved to shared database successfully');
        } catch (error) {
            console.error('❌ Failed to save properties to shared database:', error);
            throw error;
        }
    }

    async loadProperties(): Promise<Property[]> {
        try {
            console.log('📖 Loading properties from shared database...');

            const response = await fetch('/api/shared-data', {
                cache: 'no-store' // Always get fresh data
            });
            const result = await response.json();

            if (!result.success) {
                console.warn('⚠️ Failed to load properties from shared database:', result.error);
                return [];
            }

            console.log('✅ Loaded', result.properties.length, 'properties from shared database');
            return result.properties || [];
        } catch (error) {
            console.error('❌ Failed to load properties from shared database:', error);
            return [];
        }
    }

    async clearAllData(): Promise<void> {
        try {
            console.log('🗑️ Clearing all shared data...');

            const response = await fetch('/api/shared-data', {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to clear shared data');
            }

            console.log('✅ All shared data cleared successfully');
        } catch (error) {
            console.error('❌ Failed to clear shared data:', error);
            throw error;
        }
    }

    // Get sample properties to load
    async loadSampleData(): Promise<void> {
        const sampleProperties: Property[] = [
            {
                id: "sample-29382365",
                address: "2211 Willow St, Austin, TX 78702",
                link: "https://www.zillow.com/homedetails/2211-Willow-St-Austin-TX-78702/29382365_zpid/",
                images: [
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600",
                    "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600"
                ],
                rent: "3100",
                sqft: "840",
                beds: "2",
                baths: "2.5",
                contact: {
                    name: "Rebecca",
                    phone: "(737) 257-4506",
                    email: "rebecca@austinproperties.com"
                },
                status: {
                    requestSent: "",
                    responseReceived: "",
                    tourScheduled: "",
                    toured: false,
                    notes: ""
                },
                preferences: {
                    maddieHeart: false,
                    brittanieHeart: false,
                    disliked: false
                }
            },
            {
                id: "sample-29386057",
                address: "1146 Northwestern Ave, Austin, TX 78702",
                link: "https://www.zillow.com/homedetails/1146-Northwestern-Ave-Austin-TX-78702/29386057_zpid/",
                images: [
                    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600",
                    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600",
                    "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600"
                ],
                rent: "2700",
                sqft: "1093",
                beds: "3",
                baths: "2",
                contact: {
                    name: "Myung Lemond",
                    phone: "(512) 740-0807",
                    email: "myung@austinrealty.com"
                },
                status: {
                    requestSent: "",
                    responseReceived: "",
                    tourScheduled: "",
                    toured: false,
                    notes: ""
                },
                preferences: {
                    maddieHeart: false,
                    brittanieHeart: false,
                    disliked: false
                }
            }
        ];

        // Load existing properties and merge with samples (avoiding duplicates)
        const existingProperties = await this.loadProperties();
        const existingIds = new Set(existingProperties.map(p => p.id));

        const newSamples = sampleProperties.filter(sample => !existingIds.has(sample.id));
        const allProperties = [...existingProperties, ...newSamples];

        await this.saveProperties(allProperties);
        console.log('📦 Sample data loaded to shared database, added', newSamples.length, 'new properties');
    }

    // Add automatic refresh functionality
    async refreshData(): Promise<Property[]> {
        console.log('🔄 Refreshing shared data...');
        return await this.loadProperties();
    }
}

export const dataService = new DataService(); 