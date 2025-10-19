import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCreat.css'; // 수정된 CSS 파일을 import 합니다.

function ProjectCreat() {
    const navigate = useNavigate();
    const IMGBB_API_KEY = "29cb328284db2e5278ce6bbcf2993793"; 

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photographer, setPhotographer] = useState('');
    const [imageType, setImageType] = useState('Nebula');
    const [copyright, setCopyright] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploadTime, setUploadTime] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [preview, setPreview] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const showMessage = (text, type) => {
        setMessage({ text, type });
        if (type !== 'loading') { 
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    const uploadToImgBB = async (file) => {
        if (IMGBB_API_KEY === "YOUR_IMGBB_API_KEY" || !IMGBB_API_KEY) {
            showMessage('API 키를 입력해주세요!', 'error');
            return;
        }
        setIsUploading(true);
        showMessage('이미지를 업로드하는 중...', 'loading');
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                showMessage('업로드 성공!', 'success');
                setImageUrl(result.data.url);
                setUploadTime(result.data.time);
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            showMessage(`업로드 실패: ${error.message}`, 'error');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showMessage('이미지 파일만 업로드할 수 있습니다.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        uploadToImgBB(file);
    };

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

    const handleSubmit = () => {
        if (!imageUrl) {
            showMessage('이미지를 먼저 업로드해주세요.', 'error');
            return;
        }
        const newPost = {
            id: `user-${Date.now()}`,
            title,
            description,
            photographer,
            date: new Date(uploadTime * 1000).toISOString(),
            category: imageType,
            copyright,
            imageUrl,
            tags: keywords,
            isUserPost: true
        };
        const existingPosts = JSON.parse(localStorage.getItem('photos')) || [];
        existingPosts.unshift(newPost);
        localStorage.setItem('photos', JSON.stringify(existingPosts));
        navigate('/');
    };
    
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

    return (
        // ▼▼▼ [ 여기에 컨테이너 클래스를 적용합니다 ] ▼▼▼
        <div className="creat-page-container">
            <div className="form-container">
                <div className="form-header">
                    <h2>ASTROLENS</h2>
                </div>
                <div className="form-body">
                    <div 
                        className={`drop-zone-style ${isDragging ? 'drag-over' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <svg className="w-12 h-12 text-stone-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                        {!preview && <p>Drag & drop your image here, or Click to Choose File</p>}
                        {preview && <img src={preview} alt="Preview" id="preview-image"/>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])}/>
                    </div>
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
                    <input type="text" value={imageUrl} className="form-input" placeholder="Image URL (auto-filled after upload)" readOnly />
                    <div>
                        <input 
                            type="text" 
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
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
                        disabled={isUploading}
                    >
                        {isUploading ? '업로드 중...' : 'Submit Photo'}
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

export default ProjectCreat;

