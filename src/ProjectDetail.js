import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams 훅과 useNavigate 훅을 불러옵니다.
import axios from 'axios'; // Hamin이 추가함: axios import

import './ProjectDetail.css';

// Hamin이 추가함: MockAPI URL 정의 (ProjectCreat.js, MainPage.js와 동일해야 합니다.)
const MOCK_API_URL = "https://68f39165fd14a9fcc42925d9.mockapi.io/astrolensElements"; 

function ProjectDetail() {
    // 1. useParams를 이용해 URL의 :nasaId 부분을 변수로 가져옵니다.
    const { nasaId } = useParams();
    const navigate = useNavigate(); // Hamin이 추가함: 뒤로 가기 버튼 등을 위해 useNavigate 훅 사용

    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect의 의존성 배열에 nasaId를 추가합니다.
    // 이렇게 하면 URL의 ID가 바뀔 때마다 API를 새로 호출합니다.
    useEffect(() => {
        // 3. 고정된 ID 대신 URL에서 가져온 nasaId 변수를 사용합니다.
        if (!nasaId) {
            // Hamin이 수정함: ID가 없을 경우 에러 메시지 설정 및 로딩 종료
            setError('No image ID provided.');
            setLoading(false);
            return;
        }

        const fetchAndDisplayData = async () => {
            setLoading(true); // ID가 바뀔 때마다 다시 로딩 상태로 설정
            setError(null);
            try {
                let foundImage = null; // Hamin이 추가함: 찾은 이미지 데이터를 저장할 변수

                // Hamin이 추가함: 1. 먼저 MockAPI.io (사용자 이미지)에서 ID를 찾아봅니다.
                try {
                    const mockApiResponse = await axios.get(`${MOCK_API_URL}/${nasaId}`);
                    // Hamin이 추가함: MockAPI.io에서 데이터가 있고, 'id' 필드가 있다면 사용자 이미지로 간주합니다.
                    // MockAPI.io의 `id`는 숫자형 문자열일 수 있습니다.
                    if (mockApiResponse.data && mockApiResponse.data.id === nasaId) { 
                        const data = mockApiResponse.data;
                        foundImage = {
                            imageUrl: data.imageUrl,
                            title: data.title || '제목 없음 (User)',
                            description: data.description || '상세 설명이 없습니다. (User)',
                            // Hamin이 수정함: date는 MockAPI에서 ISO String으로 저장했으므로 Date 객체로 변환 후 포맷
                            dateCreated: new Date(data.date).toLocaleDateString('ko-KR'), 
                            photographer: data.photographer || '정보 없음 (User)',
                            keywords: data.tags?.slice(0, 5) || [], // Hamin이 수정함: MockAPI는 'tags' 필드 사용
                            copyright: data.copyright || 'User Upload',
                            isUserPost: true // Hamin이 추가함: 사용자 게시물임을 명시
                        };
                        // Hamin이 추가함: MockAPI에서 찾았으면 NASA API 호출 건너뛰기
                        setImageData(foundImage);
                        setLoading(false);
                        return; // 여기서 함수 실행을 종료하여 NASA API 호출을 막습니다.
                    }
                } catch (mockApiError) {
                    // Hamin이 추가함: MockAPI.io에서 해당 ID를 찾지 못했을 경우 (404 등) -> NASA API로 넘어갑니다.
                    // console.log(`ID ${nasaId} not found in MockAPI, trying NASA API.`);
                    // Hamin이 추가함: MockAPI 에러는 여기서 잡고, NASA API 시도는 계속 진행합니다.
                }

                // Hamin이 추가함: 원래 NASA API 호출 로직 시작 (MockAPI.io에서 찾지 못했을 경우에만 실행)
                const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
                // ... (이하 API 호출 로직은 기존과 동일)
                if (!response.ok) {
                    // Hamin이 수정함: 네트워크 에러 발생 시 throw 대신 에러 메시지 설정
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
                
                // Hamin이 수정함: imageData 상태를 직접 업데이트
                setImageData({
                    imageUrl: item.links[0].href,
                    title: data.title || '제목 없음',
                    description: data.description || '상세 설명이 없습니다.',
                    dateCreated: new Date(data.date_created).toLocaleDateString('ko-KR'),
                    photographer: data.secondary_creator || '정보 없음',
                    keywords: data.keywords?.slice(0, 5) || [],
                    copyright: copyrightMatch ? copyrightMatch.input.substring(copyrightMatch.index).split('\n')[0] : 'NASA/Public Domain',
                    isUserPost: false // Hamin이 추가함: NASA 게시물임을 명시
                });
                // Hamin이 추가함: 원래 NASA API 호출 로직 끝
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndDisplayData();
    }, [nasaId]); // 2번 설명: 의존성 배열

    // 로딩 중일 때 보여줄 화면
    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', fontSize: '2rem' }}>Loading...</div>;
    }

    // 에러 발생 시 보여줄 화면
    if (error) {
        return (
            // Hamin이 추가함: 에러 발생 시 뒤로 가기 버튼 제공
            <div style={{ color: 'red', textAlign: 'center', fontSize: '2rem' }}>
                Error: {error}
                <button onClick={() => navigate(-1)} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Go Back
                </button>
            </div>
        );
    }

    // 데이터 로딩 성공 시 보여줄 화면
    return (
        <div className="Detail">
            <div className="card">
                {/* JSX에서는 HTML과 달리 class는 className, style은 객체 형태로 씁니다. */}
                <div className="card-body top" style={{ backgroundColor: '#111827', color: '#ffffff' }}>
                    <p>Astro Lens</p>
                </div>
                <div className="card p-3" id="ttt">
                    <img id="main-image" src={imageData.imageUrl} className="card-img-top" alt={imageData.title} />
                    <div className="card" id="insidecard" style={{ color: '#ffffff', borderRadius: '5px' }}>
                        <div className="card-header" style={{ backgroundColor: '#111827', borderRadius: '5px' }}>
                            <h2 id="info-title" className="mb-0">{imageData.title}</h2>
                            <div>
                                {/* Hamin이 추가함: isUserPost에 따라 EDIT/DELETE 버튼 조건부 렌더링 */}
                                {imageData.isUserPost ? (
                                    <>
                                        <button id="edit" className="btn btn-primary">EDIT</button>
                                        <button id="delete" className="btn btn-danger ms-2">DELETE</button>
                                    </>
                                ) : (
                                    // Hamin이 추가함: NASA 이미지의 경우 "NASA Image" 표시 또는 아무것도 표시 안 함
                                    <span style={{ color: '#aaa', fontSize: '0.9em' }}>NASA Image</span>
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            <p id="info-description" className="card-text">{imageData.description}</p>
                            <dl className="info-grid">
                                <dt>Date Created:</dt>
                                <dd id="info-date">{imageData.dateCreated}</dd>
                                <dt>Photographer:</dt>
                                <dd id="info-photographer">{imageData.photographer}</dd>
                                <dt>Copyright:</dt>
                                <dd id="info-copyright">{imageData.copyright}</dd>
                            </dl>
                        </div>
                        <div className="card-footer">
                            <div id="info-keywords">
                                {/* .map()을 이용해 키워드 배열을 동적으로 렌더링합니다. */}
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