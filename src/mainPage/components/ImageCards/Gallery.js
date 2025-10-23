// src/components/ImageCards/Gallery.js (이전에 제공해주신 코드를 기반으로 수정)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css'; // Masonry 사용 여부에 따라 아래 Grid 수정
import ImageCard from './ImageCard';
import './Gallery.css';

const Gallery = ({ images, loading }) => {
    const ITEMS_PER_PAGE = 12;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [images]);

    const visibleImages = images.slice(0, visibleCount);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        768: 2,
        500: 1
    };

    return (
        <main style={{ padding: '2rem' }}>
            {loading ? (
                <p>Loading images...</p>
            ) : (
                <>
                    {/* Hamin이 수정함: Masonry를 계속 사용합니다. Masonry 자체에 반응형 breakpoint가 설정되어 있으므로, 
                                 Masonry 내부 ImageCard를 감싸는 Link 태그에 직접적인 col-12 클래스 추가는 필요 없습니다.
                                 Masonry의 breakpointColumnsObj가 이미 반응형 처리를 해줍니다. */}
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {visibleImages.map((img, index) => (
                            <Link to={`/detail/${img.nasaId}`} key={img.nasaId || index} className="gallery-link">
                                <ImageCard {...img} />
                            </Link>
                        ))}
                    </Masonry>

                    {visibleCount < images.length && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default Gallery;