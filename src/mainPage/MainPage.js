import React, { useState, useEffect, useCallback } from "react"; // useCallback 추가
import { Link } from 'react-router-dom';
import axios from 'axios'; // axios import
import './MainPage.css';
import Astronaut from "./images/z2 1.svg"
import SpaceShip from "./images/z2 2.svg"
import Search from "./components/Search.js";
import TagFilter from "./components/Filter.js"; // Filter.js로 변경된 것 반영
import Gallery from "./components/ImageCards/Gallery.js";
// UploadForm은 UploadForm.js라는 별도 컴포넌트가 필요하며, 현재 코드에는 포함되어 있지 않습니다.
// 하지만 만약을 위해 여기에 임포트 경로를 남겨둡니다.
// import UploadForm from './components/UploadForm'; 

// --- API Keys and Endpoints (여기에 본인의 키와 URL을 넣어주세요!) ---
const IMGBB_API_KEY = "29cb328284db2e5278ce6bbcf2993793"; // <<<<<<<< 여기에 IMGBB API 키를 입력하세요
const MOCK_API_URL = "https://68f39165fd14a9fcc42925d9.mockapi.io/astrolensElements"; // <<<<<<<< 여기에 MockAPI.io URL을 입력하세요
// ------------------------------------------------------------------

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

    // --- NASA 이미지 불러오는 함수 ---
    const fetchNasaImages = useCallback(async () => {
        try {
            const categories = ['Nebula', 'Galaxy', 'Planet', 'Star'];
            const requests = categories.map(category =>
                axios.get(`https://images-api.nasa.gov/search?q=${category}&media_type=image`) // fetch 대신 axios 사용
            );
            const responses = await Promise.all(requests);
            let allItems = [];
            responses.forEach((response, idx) => {
                const items = response.data.collection.items // axios는 .data 속성에 실제 데이터가 있습니다.
                                        .filter(item => item.links && item.links.length > 0 && item.data && item.data.length > 0)
                                        .map(item => ({ ...item, category: categories[idx] }));
                allItems = allItems.concat(items);
            });

            const nasaImages = allItems.map(item => ({
                nasaId: item.data[0].nasa_id,
                title: item.data[0].title,
                description: truncateDescription(item.data[0].description),
                date: new Date(item.data[0].date_created),
                imageUrl: item.links[0].href, // links?.[0]?.href 대신 links[0].href (필터링했으므로 안전)
                category: item.category,
                tags: item.data[0].keywords || [],
                isUserPost: false,
                // userId: 0 // NASA 이미지에 사용자 ID를 부여하고 싶다면
            }));
            return nasaImages;
        } catch (error) {
            console.error('Error fetching NASA images:', error);
            return [];
        }
    }, []);

    // --- MockAPI.io에서 사용자 이미지 불러오는 함수 ---
    const fetchUserImagesFromMockAPI = useCallback(async () => {
        try {
            const response = await axios.get(MOCK_API_URL);
            const mockUserImages = response.data.map(item => ({
                // MockAPI.io의 데이터 구조에 맞게 매핑
                nasaId: item.id, // MockAPI.io의 id를 고유 식별자로 사용
                title: item.title,
                description: truncateDescription(item.description),
                date: new Date(item.date), // MockAPI에 저장된 date 필드
                imageUrl: item.imageUrl,
                category: item.category, // MockAPI에 저장된 category 필드
                tags: item.tags || [], // MockAPI에 저장된 tags 필드
                isUserPost: true,
                // userId: item.userId // MockAPI에 userId 필드가 있다면
            }));
            return mockUserImages;
        } catch (error) {
            console.error('Error fetching user images from MockAPI.io:', error);
            return [];
        }
    }, []);

    // --- 모든 이미지 (NASA + 사용자)를 처음 불러오는 useEffect ---
    useEffect(() => {
        async function loadAllImages() {
            setLoading(true);
            const nasa = await fetchNasaImages();
            const user = await fetchUserImagesFromMockAPI();
            
            // 사용자가 올린 이미지가 최신으로 보이도록 앞에 배치
            const combined = [...user, ...nasa]; 
            setAllImages(combined);
            setFilteredImages(combined);
            setLoading(false);
        }
        loadAllImages();
    }, [fetchNasaImages, fetchUserImagesFromMockAPI]); // 의존성 배열에 함수 추가

    // --- 검색, 필터링, 정렬 로직 (기존 코드와 유사) ---
    useEffect(() => {
        let images = [...allImages];

        if (searchTerm) {
            images = images.filter(img =>
                (img.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (img.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) // 태그 검색 추가
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

    // --- 이미지 업로드 핸들러 (UploadForm 컴포넌트에서 호출될 함수) ---
    // UploadForm 컴포넌트가 아직 없으므로, 이 함수는 사용자가 직접 구현해야 합니다.
    const handleUserImageUpload = async (imgData) => {
        setLoading(true);
        try {
            // IMGBB에 이미지 업로드 (UploadForm 내부에서 처리되는 경우가 많음)
            // 여기서는 이미 IMGBB에 업로드되어 imageUrl이 넘어왔다고 가정합니다.
            
            const newPost = {
                title: imgData.title || `User Upload ${new Date().toLocaleDateString()}`,
                description: imgData.description || truncateDescription("사용자가 AstroLens에 업로드한 이미지입니다."),
                date: new Date().toISOString(),
                imageUrl: imgData.imageUrl, // IMGBB에서 받은 이미지 URL
                category: imgData.category || 'User Upload',
                tags: imgData.tags || ['User', 'Custom'],
                // userId: 1, // 필요하다면 사용자 ID 추가
            };

            const response = await axios.post(MOCK_API_URL, newPost);
            const savedImage = response.data; // MockAPI.io에서 저장 후 반환된 데이터

            // 새로운 이미지를 allImages 상태에 추가하여 즉시 반영
            setAllImages(prevImages => [
                {
                    nasaId: savedImage.id, // MockAPI에서 할당된 ID
                    title: savedImage.title,
                    description: truncateDescription(savedImage.description),
                    date: new Date(savedImage.date),
                    imageUrl: savedImage.imageUrl,
                    category: savedImage.category,
                    tags: savedImage.tags,
                    isUserPost: true,
                    // userId: savedImage.userId,
                },
                ...prevImages
            ]);
            alert('이미지가 성공적으로 업로드되었습니다!');

        } catch (error) {
            console.error("이미지 업로드 중 오류 발생:", error);
            alert('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };


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
                    {/* TagFilter에 모든 태그와 선택된 태그를 넘겨줍니다 */}
                    <TagFilter
                        allTags={[...new Set(allImages.flatMap(img => [...(img.tags || []), img.category]))]} // 모든 이미지에서 고유한 태그/카테고리 추출
                        selectedTags={selectedTags}
                        onTagChange={setSelectedTags}
                    />

                    {/* Link 컴포넌트로 '/create' 경로로 이동하는 버튼 */}
                    <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" style={{ textDecoration: 'none' }}>
                        Create
                    </Link>
                    
                    {/* 만약 UploadForm 컴포넌트가 있다면 여기에 렌더링하고 handleUserImageUpload 함수를 전달합니다 */}
                    {/* <UploadForm onImageUpload={handleUserImageUpload} IMGBB_API_KEY={IMGBB_API_KEY} /> */}
                </div>
                <Gallery images={filteredImages} loading={loading} />
            </div>
        </>
    );
}

export default MainPage;