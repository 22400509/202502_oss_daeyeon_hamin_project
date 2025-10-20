import React, { useState, useEffect } from "react";
// react-router-dom에서 Link를 import합니다.
import { Link } from 'react-router-dom';
import './MainPage.css';
import Astronaut from "./images/z2 1.svg"
import SpaceShip from "./images/z2 2.svg"
import Search from "./components/Search.js";
import TagFilter from "./components/Filter.js";
import Gallery from "./components/ImageCards/Gallery.js";

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
                // NASA API에서 이미지 가져오기
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

                const nasaImages = allItems.map(item => ({
                    nasaId: item.data[0].nasa_id,
                    title: item.data[0].title,
                    description: truncateDescription(item.data[0].description),
                    date: new Date(item.data[0].date_created),
                    imageUrl: item.links?.[0]?.href,
                    category: item.category,
                    tags: item.data[0].keywords || [],
                    isUserPost: false // NASA에서 온 데이터임을 표시
                }));

                // localStorage에서 사용자가 올린 이미지 가져오기
                const userPhotos = JSON.parse(localStorage.getItem('photos') || '[]').map((photo, index) => ({
                    ...photo,
                    id: `user-${index}`, // 고유 ID 부여
                    date: new Date(), // 현재 날짜로 설정 (나중에 저장된 날짜로 변경 가능)
                    isUserPost: true // 사용자가 올린 데이터임을 표시
                }));
                
                // 두 데이터를 합칩니다.
                const combinedImages = [...userPhotos, ...nasaImages];

                setAllImages(combinedImages);
                setFilteredImages(combinedImages);
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, []);

    useEffect(() => {
        let images = [...allImages];

        if (searchTerm) {
            images = images.filter(img =>
                (img.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (img.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                <TagFilter selectedTags={selectedTags} onTagChange={setSelectedTags} />

                {/* --- <a> 태그를 <Link> 컴포넌트로 교체하고, 경로를 '/create'로 설정합니다 --- */}
                <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" style={{ textDecoration: 'none' }}>
                    Create
                </Link>
                {/* --- Detail 버튼은 나중에 구현하기 위해 잠시 제거합니다 --- */}
            </div>
            <Gallery images={filteredImages} loading={loading} />
        </div>
    </>
);
}

export default MainPage;

