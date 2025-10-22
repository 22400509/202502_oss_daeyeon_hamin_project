// src/components/UploadForm.js
import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

// IMGBB_API_KEY를 MainPage.js에서 prop으로 받습니다.
function UploadForm({ onImageUpload, IMGBB_API_KEY }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('업로드할 이미지를 선택해주세요.');
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('image', selectedFile); 

        try {
            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data && response.data.data && response.data.data.url) {
                const uploadedImageUrl = response.data.data.url;
                alert('이미지 업로드 성공: ' + uploadedImageUrl);
                if (onImageUpload) {
                    onImageUpload({ imageUrl: uploadedImageUrl });
                }
                setSelectedFile(null); // 파일 선택 초기화
            } else {
                throw new Error('IMGBB 응답에서 이미지 URL을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('IMGBB 이미지 업로드 중 오류 발생:', error);
            alert('이미지 업로드에 실패했습니다. API 키나 네트워크 연결을 확인하세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-3 shadow-sm custom-card mb-4 text-white bg-dark border-secondary">
            <h5 className="card-title text-primary">Share Your Universe!</h5>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Choose an image to upload:</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} accept="image/*" className="bg-dark text-white border-secondary" />
            </Form.Group>
            <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
            >
                {loading ? (
                    <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Uploading...</span>
                    </>
                ) : (
                    "Upload Image to AstroLens"
                )}
            </Button>
        </div>
    );
}

export default UploadForm;