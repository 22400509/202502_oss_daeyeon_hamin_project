import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios'; // axios import
import './MainPage.css';
import Astronaut from "./images/z2 1.svg"
import SpaceShip from "./images/z2 2.svg"
import Search from "./components/Search.js";
import TagFilter from "./components/Filter.js"; 
import Gallery from "./components/ImageCards/Gallery.js";



const IMGBB_API_KEY = "29cb328284db2e5278ce6bbcf2993793"; 
const MOCK_API_URL = "https://68f39165fd14a9fcc42925d9.mockapi.io/astrolensElements"; 


function truncateDescription(text, maxLength = 75) {
    if (!text) return 'No description available.'; // 기본값 추가
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

    
    const fetchNasaImages = useCallback(async () => {
        try {
            const categories = ['Nebula', 'Galaxy', 'Planet', 'Star'];
            const requests = categories.map(category =>
                axios.get(`https://images-api.nasa.gov/search?q=${category}&media_type=image`) 
            );
            const responses = await Promise.all(requests);
            let allItems = [];
            responses.forEach((response, idx) => {
                const items = response.data.collection.items 
                                        .filter(item => item.links && item.links.length > 0 && item.data && item.data.length > 0)
                                        .map(item => ({ ...item, category: categories[idx] }));
                allItems = allItems.concat(items);
            });

            const nasaImages = allItems.map(item => ({
                nasaId: item.data[0].nasa_id,
                title: item.data[0].title,
                description: truncateDescription(item.data[0].description),
                date: new Date(item.data[0].date_created),
                imageUrl: item.links[0].href, 
                category: item.category,
                tags: item.data[0].keywords || [],
                isUserPost: false,
                
            }));
            return nasaImages;
        } catch (error) {
            console.error('Error fetching NASA images:', error);
            return [];
        }
    }, []);

    
    const fetchUserImagesFromMockAPI = useCallback(async () => {
        try {
            const response = await axios.get(MOCK_API_URL);
            const mockUserImages = response.data.map(item => ({
                nasaId: item.id,
                title: item.title,
                description: truncateDescription(item.description),
                date: new Date(item.date), 
                imageUrl: item.imageUrl,
                category: item.category,
                tags: item.tags || [], 
                isUserPost: true,
               
            }));
            return mockUserImages;
        } catch (error) {
            console.error('Error fetching user images from MockAPI.io:', error);
            return [];
        }
    }, []);

    
    useEffect(() => {
        async function loadAllImages() {
            setLoading(true);
            const nasa = await fetchNasaImages();
            const user = await fetchUserImagesFromMockAPI();
            
           
            const combined = [...user, ...nasa]; 
            setAllImages(combined);
            setFilteredImages(combined);
            setLoading(false);
        }
        loadAllImages();
    }, [fetchNasaImages, fetchUserImagesFromMockAPI]); 

    
    useEffect(() => {
        let images = [...allImages];

        if (searchTerm) {
            images = images.filter(img =>
                (img.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (img.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) 
            );
        }

        if (selectedTags.length > 0) {
            images = images.filter(img =>
                selectedTags.every(tag => (img.tags && img.tags.includes(tag)) || img.category === tag)
            );
        }

        if (selectedDate) {
            images = images.filter(img =>
                img.date.toISOString().slice(0, 10) === selectedDate
            );
        }
        
        if (sortOrder === 'alphabetical') {
            images.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sortOrder === 'reverse-alphabetical') {
            images.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        } else if (sortOrder === 'date') {
            images.sort((a, b) => b.date.getTime() - a.date.getTime());
        }

        setFilteredImages(images);
    }, [searchTerm, selectedTags, selectedDate, sortOrder, allImages]);

    

    return (
        <>
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
                    <input className="date-input" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <div id="sort-container">
                        <label htmlFor="sort">Sort by:</label>
                        <select className="sort-select" id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="date">Date</option>
                            <option value="alphabetical">A-Z</option>
                            <option value="reverse-alphabetical">Z-A</option>
                        </select>
                    </div>
                    <TagFilter
                        allTags={[...new Set(allImages.flatMap(img => [...(img.tags || []), img.category]))]} 
                        selectedTags={selectedTags}
                        onTagChange={setSelectedTags}
                    />

                   
                    <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" style={{ textDecoration: 'none' }}>
                        Create
                    </Link>
                </div>
                <Gallery images={filteredImages} loading={loading} />
            </div>
        </>
    );
}

export default MainPage;