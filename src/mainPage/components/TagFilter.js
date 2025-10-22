// TagFilter 컴포넌트 (src/components/Filter.js) 예시
function TagFilter({ allTags, selectedTags, onTagChange }) {
    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            onTagChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="tag-filter-container d-flex flex-wrap gap-2">
            {allTags.map(tag => (
                <button
                    key={tag}
                    className={`btn ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTagClick(tag)}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}
export default TagFilter;