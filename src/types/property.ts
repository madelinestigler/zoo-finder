export interface ZillowData {
    address: string;
    rent: string;
    sqft: string;
    beds: string;
    baths: string;
    contact: {
        name: string;
        phone: string;
        email?: string;
    };
    images: string[];
}

export interface Property extends ZillowData {
    id: string;
    link: string;
    status: {
        requestSent: string;
        responseReceived: string;
        tourScheduled: string;
        toured: boolean;
        notes: string;
    };
    preferences: {
        maddieHeart: boolean;
        brittanieHeart: boolean;
        disliked: boolean;
    };
}

export interface PropertyFilters {
    showOnlyHearted: boolean;
    showOnlyUnhearted: boolean;
    showOnlyMaddieHearted: boolean;
    showOnlyBrittanieHearted: boolean;
    showDisliked: boolean;
    sortBy: 'date-added' | 'price-low' | 'price-high';
} 