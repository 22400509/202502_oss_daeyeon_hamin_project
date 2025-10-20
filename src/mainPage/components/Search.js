// Search.js
import React from "react";
import './Search.css';

// Receive props from MainPage
function Search({ searchTerm, onSearchChange }) {
    return (
        <input
            type="search"
            className="search-input"
            placeholder="Find your space"
            value={searchTerm} // Value comes from props
            onChange={(e) => onSearchChange(e.target.value)} // Call function from props
        />
    );
}

export default Search;