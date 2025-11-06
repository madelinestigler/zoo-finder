'use client';

import { useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import { Property } from '@/types/property';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    tours: Property[];
}

export function TourCalendar() {
    const { properties } = usePropertyStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filter properties that have scheduled tours
    const propertiesWithTours = properties.filter(
        prop => prop.status.tourScheduled && prop.status.tourScheduled.trim() !== ''
    );

    // Get calendar days for the current month
    const getCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Start from Sunday of the week containing the first day
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // End on Saturday of the week containing the last day
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        const days: CalendarDay[] = [];
        const currentDay = new Date(startDate);

        while (currentDay <= endDate) {
            const dayTours = propertiesWithTours.filter(prop => {
                const tourDate = new Date(prop.status.tourScheduled);
                return (
                    tourDate.getFullYear() === currentDay.getFullYear() &&
                    tourDate.getMonth() === currentDay.getMonth() &&
                    tourDate.getDate() === currentDay.getDate()
                );
            });

            days.push({
                date: new Date(currentDay),
                isCurrentMonth: currentDay.getMonth() === month,
                tours: dayTours,
            });

            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    };

    const calendarDays = getCalendarDays();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatTime = (dateTimeString: string): string => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return 'Time TBD';
        }
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        🗓️ Tour Calendar
                    </h2>
                    <div className="text-sm text-gray-500">
                        {propertiesWithTours.length} scheduled tours
                    </div>
                </div>

                {/* Calendar navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <button
                            onClick={goToToday}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                            Today
                        </button>
                    </div>

                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`
                            min-h-[100px] border border-gray-200 p-1 relative
                            ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                            ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                        `}
                    >
                        {/* Date number */}
                        <div className={`
                            text-sm font-medium mb-1
                            ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                            ${isToday(day.date) ? 'text-blue-600' : ''}
                        `}>
                            {day.date.getDate()}
                        </div>

                        {/* Tours for this day */}
                        <div className="space-y-1">
                            {day.tours.map((property) => (
                                <div
                                    key={property.id}
                                    className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                                    title={`${property.address} - ${formatTime(property.status.tourScheduled)}`}
                                >
                                    <div className="font-medium truncate">
                                        {formatTime(property.status.tourScheduled)}
                                    </div>
                                    <div className="truncate opacity-75">
                                        {property.address.split(',')[0]}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overflow indicator */}
                        {day.tours.length > 2 && (
                            <div className="text-xs text-gray-500 text-center mt-1">
                                +{day.tours.length - 2} more
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Upcoming tours list */}
            {propertiesWithTours.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Tours</h4>
                    <div className="space-y-2">
                        {propertiesWithTours
                            .sort((a, b) => new Date(a.status.tourScheduled).getTime() - new Date(b.status.tourScheduled).getTime())
                            .slice(0, 5)
                            .map((property) => (
                                <div
                                    key={property.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {property.address}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            ${property.rent}/month • {property.beds}bd/{property.baths}ba
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-blue-600">
                                            {new Date(property.status.tourScheduled).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {formatTime(property.status.tourScheduled)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {propertiesWithTours.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No tours scheduled yet</p>
                    <p className="text-xs mt-1">Schedule tours from property cards to see them here</p>
                </div>
            )}
        </div>
    );
} 