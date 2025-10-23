// src/components/ProjectDetail/ProjectDetail.js (원래 주셨던 코드 그대로)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

import './ProjectDetail.css';

const MOCK_API_URL = "https://68f39165fd14a9fcc42925d9.mockapi.io/astrolensElements";

function ProjectDetail() {
    const { nasaId } = useParams();
    const navigate = useNavigate();

    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!nasaId) {
            setError('No image ID provided.');
            setLoading(false);
            return;
        }

        const fetchAndDisplayData = async () => {
            setLoading(true);
            setError(null);
            try {
                let foundImage = null;

                try {
                    const mockApiResponse = await axios.get(`${MOCK_API_URL}/${nasaId}`);
                    if (mockApiResponse.data && mockApiResponse.data.id === nasaId) {
                        const data = mockApiResponse.data;
                        console.log("MockAPI에서 가져온 Image URL:", data.imageUrl);
                        foundImage = {
                            imageUrl: data.imageUrl,
                            title: data.title || '제목 없음 (User)',
                            description: data.description || '상세 설명이 없습니다. (User)',
                            dateCreated: new Date(data.date).toLocaleDateString('ko-KR'),
                            photographer: data.photographer || '정보 없음 (User)',
                            keywords: data.tags?.slice(0, 5) || [],
                            copyright: data.copyright || 'User Upload',
                            isUserPost: true,
                            category: data.category || 'Other'
                        };
                        setImageData(foundImage);
                        setLoading(false);
                        return;
                    }
                } catch (mockApiError) {
                    // console.log(`ID ${nasaId} not found in MockAPI, trying NASA API.`);
                }

                const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`'${nasaId}'에 해당하는 NASA 데이터를 찾을 수 없습니다.`);
                    }
                    throw new Error('Network response was not ok for NASA API.');
                }

                const searchData = await response.json();
                if (!searchData.collection.items || searchData.collection.items.length === 0) {
                    throw new Error(`'${nasaId}'에 해당하는 NASA 데이터를 찾을 수 없습니다.`);
                }
                const item = searchData.collection.items[0];
                const data = item.data[0];
                const copyrightMatch = data.description?.match(/Credit:|Image Credit:/i);
                console.log("NASA API에서 가져온 Image URL:", item.links[0].href);
                const keywords = data.keywords || [];
                const findSimpleCategory = (tags) => {
                    const simpleCategories = ['Nebula', 'Galaxy', 'Star', 'Planet'];
                    for (const tag of tags) {
                        const lowerTag = tag.toLowerCase();
                        for (const cat of simpleCategories) {
                            if (lowerTag.includes(cat.toLowerCase())) {
                                return cat;
                            }
                        }
                    }
                    return null;
                };
                const simpleCategory = findSimpleCategory(keywords);
                setImageData({
                    imageUrl: item.links[0].href,
                    title: data.title || '제목 없음',
                    description: data.description || '상세 설명이 없습니다.',
                    dateCreated: new Date(data.date_created).toLocaleDateString('ko-KR'),
                    photographer: data.secondary_creator || '정보 없음',
                    keywords: data.keywords?.slice(0, 5) || [],
                    copyright: copyrightMatch ? copyrightMatch.input.substring(copyrightMatch.index).split('\n')[0] : 'NASA/Public Domain',
                    isUserPost: false,
                    category: simpleCategory || 'NASA'
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndDisplayData();
    }, [nasaId]);

    const handleDelete = async () => {
        if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const response = await axios.delete(`${MOCK_API_URL}/${nasaId}`);

            if (response.status === 200 || response.status === 204) {
                alert("게시물이 삭제되었습니다.");
                navigate('/');
            } else {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }

        } catch (err) {
            console.error("삭제 실패:", err);
            setError(err.message || '삭제 중 오류가 발생했습니다.');
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', fontSize: '2rem' }}>Loading...</div>;
    }

    if (error) {
        return (
            <div style={{ color: 'red', textAlign: 'center', fontSize: '2rem' }}>
                Error: {error}
                <button onClick={() => navigate(-1)} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="Detail"> {/* 원래 클래스명으로 복구 */}
            <div className="card"> {/* 원래 클래스명으로 복구 */}
                <div className="card-body top" style={{ backgroundColor: '#111827', color: '#ffffff'}}> {/* 원래 클래스명으로 복구 */}
                    <p>Astro Lens</p>
                    <button onClick={() => navigate(`/`)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Back
                    </button>
                </div>
                <div className="card p-3" id="ttt"> {/* 원래 클래스명으로 복구 */}
                    <img id="main-image" src={imageData.imageUrl} className="card-img-top" alt={imageData.title} />
                    <div className="card" id="insidecard" style={{ color: '#ffffff', borderRadius: '5px' }}> {/* 원래 클래스명으로 복구 */}
                        <div className="card-header" style={{ backgroundColor: '#111827', borderRadius: '5px' }}> {/* 원래 클래스명으로 복구 */}
                            <h2 id="info-title" className="mb-0">{imageData.title}</h2>
                            <div>
                                {imageData.isUserPost ? (
                                        <div id="btn-group">
                                            <Link to={`/update/${nasaId}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" style={{ textDecoration: 'none' }}>
                                                Edit
                                            </Link>
                                            <button
                                                id="delete"
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? '삭제 중...' : 'DELETE'}
                                            </button>

                                        </div>
                                ) : (
                                        <span style={{ color: '#aaa', fontSize: '0.9em' }}>NASA Image</span>
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            <p id="info-description" className="card-text">{imageData.description}</p>
                            <br />
                            <dl className="info-grid">
                                <dt>Date Created:</dt>
                                <dd id="info-date">{imageData.dateCreated}</dd>

                                <dt>Photographer:</dt>
                                <dd id="info-photographer">{imageData.photographer}</dd>

                                <dt>Copyright:</dt>
                                <dd id="info-copyright">{imageData.copyright}</dd>

                                {imageData.category && (
                                        <>
                                            <dt>Category:</dt>
                                            <dd id="info-category">{imageData.category}</dd>
                                        </>
                                )}

                                <dt>Image URL:</dt>
                                <dd id="info-imgageUrl">{imageData.imageUrl}</dd>
                            </dl>
                        </div>
                        <div className="card-footer">
                            <div id="info-keywords">
                                {imageData.keywords.map((keyword, index) => (
                                        <span key={index} className="keyword">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;