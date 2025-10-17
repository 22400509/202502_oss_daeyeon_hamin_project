import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // useParams 훅을 불러옵니다.
import './ProjectDetail.css';

function ProjectDetail() {
    // 1. useParams를 이용해 URL의 :nasaId 부분을 변수로 가져옵니다.
    const { nasaId } = useParams();

    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect의 의존성 배열에 nasaId를 추가합니다.
    // 이렇게 하면 URL의 ID가 바뀔 때마다 API를 새로 호출합니다.
    useEffect(() => {
        // 3. 고정된 ID 대신 URL에서 가져온 nasaId 변수를 사용합니다.
        if (!nasaId) return;

        const fetchAndDisplayData = async () => {
            setLoading(true); // ID가 바뀔 때마다 다시 로딩 상태로 설정
            try {
                const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
                // ... (이하 API 호출 로직은 기존과 동일)
                if (!response.ok) throw new Error('Network response was not ok.');
                const searchData = await response.json();
                if (!searchData.collection.items || searchData.collection.items.length === 0) {
                    throw new Error(`'${nasaId}'에 해당하는 데이터를 찾을 수 없습니다.`);
                }
                const item = searchData.collection.items[0];
                const data = item.data[0];
                const copyrightMatch = data.description?.match(/Credit:|Image Credit:/i);
                setImageData({
                    imageUrl: item.links[0].href,
                    title: data.title || '제목 없음',
                    description: data.description || '상세 설명이 없습니다.',
                    dateCreated: new Date(data.date_created).toLocaleDateString('ko-KR'),
                    photographer: data.secondary_creator || '정보 없음',
                    keywords: data.keywords?.slice(0, 5) || [],
                    copyright: copyrightMatch ? copyrightMatch.input.substring(copyrightMatch.index).split('\n')[0] : 'NASA/Public Domain'
                });

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
        return <div style={{ color: 'red', textAlign: 'center', fontSize: '2rem' }}>Error: {error}</div>;
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
                                <button id="edit" className="btn btn-primary">EDIT</button>
                                <button id="delete" className="btn btn-danger ms-2">DELETE</button>
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