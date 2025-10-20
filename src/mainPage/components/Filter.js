// Filter.js
import React from 'react';

const allTags = ['Star', 'Galaxy', 'Nebula', 'Planet'];

// Receive props from MainPage
const TagFilter = ({ selectedTags, onTagChange }) => {
    const toggleTag = (tag) => {
        // Update the state in the parent component
        onTagChange((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="d-inline-block">
            <div className="d-flex gap-2">
                {allTags.map((tag) => (
                    <button 
                        key={tag}
                        className={`btn btn-sm ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TagFilter;