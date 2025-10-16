import React, { useState, useEffect } from 'react';
import './ProjectDetail.css'; // 1단계에서 만든 CSS 파일을 불러옵니다.

function DetailPage() {
    // API 데이터를 저장할 state 변수들을 만듭니다.
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 컴포넌트가 처음 렌더링될 때 API를 호출합니다.
    useEffect(() => {
        const nasaId = 'PIA04921'; // 이 ID는 나중에 props로 받을 수 있습니다.

        const fetchAndDisplayData = async () => {
            try {
                const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
                if (!response.ok) throw new Error('Network response was not ok.');

                const searchData = await response.json();
                if (!searchData.collection.items || searchData.collection.items.length === 0) {
                    throw new Error(`'${nasaId}'에 해당하는 데이터를 찾을 수 없습니다.`);
                }
                const item = searchData.collection.items[0];
                const data = item.data[0];

                // 받아온 데이터를 하나의 객체로 정리합니다.
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
                setLoading(false); // 로딩 종료
            }
        };

        fetchAndDisplayData();
    }, []); // 빈 배열은 이 useEffect가 한번만 실행되도록 합니다.

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

export default DetailPage;