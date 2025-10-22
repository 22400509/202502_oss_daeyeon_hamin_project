// src/components/DateSortFilter.js
import React from 'react';

function DateSortFilter({ selectedDate, setSelectedDate }) {
    return (
        <div className="date-filter-container">
            <label htmlFor="date-filter" className="me-2 text-white-50">Filter by Date:</label>
            <input
                className="date-input" // Custom CSS class for styling
                type="date"
                id="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>
    );
}

export default DateSortFilter;