import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ✅ 1. useParams 추가
import './ProjectUpdate.css'; // (CSS 파일은 그대로 사용)

// ✅ 2. 배포된 mockapi.io 주소 (본인 주소로 변경하세요!)
const MOCK_API_URL = 'https://[YOUR_MOCKAPI_ID].mockapi.io/api/v1/photos';
// ✅ 3. ImgBB API 키 (환경변수로 숨기는 것을 권장합니다)
const IMGBB_API_KEY = "29cb328284db2e5278ce6bbcf2993793"; 

function ProjectUpdate() {
    const navigate = useNavigate();
    const { id } = useParams(); // ✅ 4. URL에서 수정할 게시물의 id를 가져옴

    // --- State 정의 ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photographer, setPhotographer] = useState('');
    const [imageType, setImageType] = useState('Nebula');
    const [copyright, setCopyright] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // 기존 이미지 URL
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    
    const [preview, setPreview] = useState(''); // 미리보기 URL
    const [newFile, setNewFile] = useState(null); // ✅ 5. '새로 선택한' 이미지 파일
    
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false); // '업로드' -> '제출'
    const [isLoading, setIsLoading] = useState(true); // ✅ 6. 기존 데이터 로딩 상태
    
    const fileInputRef = useRef(null);

    // --- 1. 데이터 불러오기 (useEffect) ---
    // ✅ 7. 페이지 로드 시, id를 이용해 기존 데이터를 불러옴
    useEffect(() => {
        const fetchPostData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${MOCK_API_URL}/${id}`);
                if (!response.ok) {
                    throw new Error('데이터를 불러오지 못했습니다.');
                }
                const data = await response.json();

                // 8. 불러온 데이터로 모든 state를 채워 폼에 표시
                setTitle(data.title);
                setDescription(data.description);
                setPhotographer(data.photographer || '');
                setImageType(data.category || 'Other');
                setCopyright(data.copyright || '');
                setKeywords(data.tags || []);
                setImageUrl(data.imageUrl); // "기존" 이미지 URL 저장
                setPreview(data.imageUrl);  // "기존" 이미지로 미리보기 설정
                
            } catch (error) {
                showMessage(error.message, 'error');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostData();
    }, [id]); // id가 변경될 때만 실행

    // --- 2. 메시지 핸들러 ---
    const showMessage = (text, type) => {
        setMessage({ text, type });
        if (type !== 'loading') { 
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    // --- 3. ImgBB 업로드 (수정됨) ---
    // ✅ 9. 이 함수는 이제 호출되면 '업로드된 URL'을 반환(return)합니다.
    const uploadToImgBB = async (file) => {
        if (!IMGBB_API_KEY) {
            showMessage('API 키를 입력해주세요!', 'error');
            return null; // 실패 시 null 반환
        }
        
        showMessage('새 이미지 업로드 중...', 'loading');
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                showMessage('새 이미지 업로드 성공!', 'success');
                return result.data.url; // ✅ 성공 시 URL 반환
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            showMessage(`업로드 실패: ${error.message}`, 'error');
            console.error(error);
            return null; // 실패 시 null 반환
        }
    };

    // --- 4. 파일 선택 핸들러 (수정됨) ---
    // ✅ 10. 파일 선택 시 '즉시' 업로드하지 않고, 'newFile' state에 저장만 함
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showMessage('이미지 파일만 업로드할 수 있습니다.', 'error');
            return;
        }
        
        // 11. 새 파일 저장
        setNewFile(file); 
        
        // 12. 새 파일 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // --- 5. 키워드 핸들러 (기존과 동일) ---
    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newKeyword = keywordInput.trim();
            if (newKeyword && !keywords.includes(newKeyword)) {
                setKeywords([...keywords, newKeyword]);
            }
            setKeywordInput('');
        }
    };

    // --- 6. 최종 제출 핸들러 (대폭 수정됨) ---
    // ✅ 13. 'handleSubmit' -> 'PUT' 요청으로 변경
    const handleSubmit = async () => {
        setIsSubmitting(true);
        let finalImageUrl = imageUrl; // 1. 일단 "기존" 이미지 URL로 설정

        try {
            // 2. 만약 '새로운' 파일이 선택되었다면,
            if (newFile) {
                const uploadedUrl = await uploadToImgBB(newFile); // ImgBB에 업로드
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl; // URL을 "새" URL로 교체
                } else {
                    throw new Error('새 이미지 업로드에 실패하여 중단합니다.');
                }
            }
            
            // 3. '수정된' 포스트 객체 생성
            const updatedPost = {
                title,
                description,
                photographer,
                date: new Date().toISOString(), // 수정한 날짜로 갱신
                category: imageType,
                copyright,
                imageUrl: finalImageUrl, // ✅ 최종 이미지 URL (새것 또는 기존것)
                tags: keywords,
                isUserPost: true
            };

            // 4. 'localStorage'가 아닌 'mockapi.io'로 'PUT' 요청
            const response = await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'PUT', // '생성(POST)'이 아닌 '수정(PUT)'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost)
            });

            if (!response.ok) {
                throw new Error('수정에 실패했습니다.');
            }

            showMessage('수정 완료!', 'success');
            
            // 5. 1초 후 수정된 상세 페이지로 이동
            setTimeout(() => {
                navigate(`/detail/${id}?user=true`);
            }, 1000);

        } catch (error) {
            showMessage(error.message, 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- 7. 드래그 앤 드롭 핸들러 (기존과 동일) ---
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    // --- 8. JSX (렌더링) ---
    
    // 14. 기존 데이터 로딩 중일 때
    if (isLoading) {
        return <div style={{ color: 'white', textAlign: 'center', fontSize: '2rem', paddingTop: '5rem' }}>
            데이터 불러오는 중...
        </div>;
    }

    // 15. 로딩 완료 후 폼 렌더링
    return (
        <div className="creat-page-container">
            <div className="form-container">
                <div className="form-header">
                    <h2>ASTROLENS (수정하기)</h2> {/* 16. 제목 변경 */}
                </div>
                <div className="form-body">
                    <div 
                        className={`drop-zone-style ${isDragging ? 'drag-over' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* 17. preview state로 미리보기 표시 (기존/신규) */}
                        {!preview && (
                            <>
                                <svg className="w-12 h-12 text-stone-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                                <p>Drag & drop new image, or Click</p>
                            </>
                        )}
                        {preview && <img src={preview} alt="Preview" id="preview-image"/>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])}/>
                    </div>
                    
                    {/* 18. 모든 input에 value와 onChange를 연결 (기존 데이터가 폼에 채워짐) */}
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="Title" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" placeholder="Description" rows="4"></textarea>
                    <input type="text" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="form-input" placeholder="Photographer" />
                    <select value={imageType} onChange={(e) => setImageType(e.target.value)} className="form-input">
                        <option value="Nebula">Nebula</option>
                        <option value="Galaxy">Galaxy</option>
                        <option value="Star">Star</option>
                        <option value="Planet">Planet</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" value={copyright} onChange={(e) => setCopyright(e.target.value)} className="form-input" placeholder="Copyright" />
                    
                    {/* 19. imageUrl 입력란은 굳이 필요 없으므로 제거하거나 readOnly로 둬도 됩니다. */}
                    {/* <input type="text" value={imageUrl} className="form-input" placeholder="Image URL" readOnly /> */}
                    
                    <div>
                        <input 
                            type="text" 
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.g.target.value)}
                            onKeyDown={handleKeywordKeyDown}
                            className="form-input" 
                            placeholder="Keywords (press Enter to add)" 
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {keywords.map((kw, index) => <div key={index} className="keyword-tag">{kw}</div>)}
                        </div>
                    </div>
                </div>
                <div className="form-footer">
                   <button 
                       onClick={handleSubmit} 
                       className="btn btn-primary"
                       disabled={isSubmitting} // 20. isUploading -> isSubmitting
                   >
                       {isSubmitting ? '수정 중...' : 'Update Photo'} {/* 21. 버튼 텍스트 변경 */}
                   </button>
                   <div className={`message-box 
                       ${message.type === 'success' ? 'success' : ''}
                       ${message.type === 'error' ? 'error' : ''}
                       ${message.type === 'loading' ? 'loading' : ''}`}
                   >
                      {message.text}
                   </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectUpdate;