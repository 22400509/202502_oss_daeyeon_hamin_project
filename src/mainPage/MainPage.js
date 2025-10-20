// MainPage.js
import React, { useState, useEffect } from "react";
import './MainPage.css';
import Astronaut from "./images/z2 1.svg"
import SpaceShip from "./images/z2 2.svg"
import Search from "./components/Search";
import TagFilter from "./components/Filter";
import Gallery from "./components/ImageCards/Gallery";

// Define the truncateDescription function here, outside the component
// or inside if you prefer, but it should be here to process data
function truncateDescription(text, maxLength = 75) {
    if (!text) return '';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.slice(0, maxLength).trim() + '...';
}

function MainPage() {
    const [allImages, setAllImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [sortOrder, setSortOrder] = useState("date");
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        async function fetchImages() {
            try {
                const categories = ['Nebula', 'Galaxy', 'Planet', 'Star'];
                const requests = categories.map(category =>
                    fetch(`https://images-api.nasa.gov/search?q=${category}&media_type=image`)
                        .then(res => res.json())
                );
                const responses = await Promise.all(requests);
                let allItems = [];
                responses.forEach((response, idx) => {
                    const items = response.collection.items.map(item => ({ ...item, category: categories[idx] }));
                    allItems = allItems.concat(items);
                });

                const formatted = allItems.map(item => ({
                    nasaId: item.data[0].nasa_id,
                    title: item.data[0].title,
                    // *** ENSURE truncateDescription IS CALLED HERE ***
                    description: truncateDescription(item.data[0].description), // Apply truncation here
                    date: new Date(item.data[0].date_created),
                    imageUrl: item.links?.[0]?.href,
                    category: item.category,
                    tags: item.data[0].keywords || []
                }));
                
                setAllImages(formatted);
                setFilteredImages(formatted);
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, []);

    // ... (rest of useEffect for filtering and sorting remains the same) ...
    useEffect(() => {
        let images = [...allImages];

        if (searchTerm) {
            images = images.filter(img =>
                img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                img.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTags.length > 0) {
            images = images.filter(img =>
                selectedTags.every(tag => img.tags.includes(tag) || img.category === tag)
            );
        }

        if (selectedDate) {
            images = images.filter(img =>
                img.date.toISOString().slice(0, 10) === selectedDate
            );
        }
        
        if (sortOrder === 'alphabetical') {
            images.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOrder === 'reverse-alphabetical') {
            images.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortOrder === 'date') {
            images.sort((a, b) => b.date.getTime() - a.date.getTime()); // Use getTime for Date objects
        }

        setFilteredImages(images);
    }, [searchTerm, selectedTags, selectedDate, sortOrder, allImages]);


    return (
        <>
            {/* Your parallax-container and its content */}
            <div className="parallax-container">
                <img className="foreground-img" src={Astronaut} alt="Astronaut in foreground" />
                <img className="foreground-img" src={SpaceShip} alt="SpaceShip in foreground" />
                <div>
                    <h1 id="title">ASTROLENS</h1>
                    <p id="subtitle">One, with the Universe</p>
                </div>
                <a href="#bottom-section" id="scroll-btn">Explore</a>
            </div>

            <div id="bottom-section">
                <div className="d-flex justify-content-evenly flex-wrap align-items-center gap-3 p-3">
                    <Search searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    <input type="date" className="date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <div id="sort-container">
                        <label htmlFor="sort">Sort by:</label>
                        <select className="sort-select" id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="date">Date</option>
                            <option value="alphabetical">A-Z</option>
                            <option value="reverse-alphabetical">Z-A</option>
                        </select>
                    </div>
                    <TagFilter selectedTags={selectedTags} onTagChange={setSelectedTags} />
                </div>
                <Gallery images={filteredImages} loading={loading} />
            </div>
        </>
    );
}

export default MainPage;