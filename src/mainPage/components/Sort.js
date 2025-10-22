// src/components/Sort.js
import React from 'react';

function Sort({ sortOrder, setSortOrder }) {
    return (
        <div className="sort-container">
            <label htmlFor="sort" className="me-2 text-white-50">Sort by:</label>
            <select
                className="sort-select" // Custom CSS class for styling
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
            >
                <option value="date">Date</option>
                <option value="alphabetical">A-Z</option>
                <option value="reverse-alphabetical">Z-A</option>
            </select>
        </div>
    );
}

export default Sort;