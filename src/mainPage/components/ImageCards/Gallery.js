// Gallery.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ 1. Import the Link component
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';
import './Gallery.css';

const Gallery = ({ images, loading }) => {
    const ITEMS_PER_PAGE = 12;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    
    // This useEffect is important to reset the view when filters change
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
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {/* Loop through the images */}
                        {visibleImages.map((img, index) => (
                            // ✅ 2. Wrap each ImageCard with a Link component
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