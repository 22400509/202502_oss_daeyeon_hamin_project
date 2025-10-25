// Search.js
import React from "react";
import { useForm } from "react-hook-form"; // ✅ Form Library (react-hook-form)
import { Form } from "react-bootstrap"; // ✅ React UI Component Library
import './Search.css';

function Search({ searchTerm, onSearchChange }) {
    const { register, handleSubmit } = useForm({
        defaultValues: { search: searchTerm }
    });

    const onSubmit = (data) => {
        onSearchChange(data.search);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}> {/* ✅ Bootstrap Form 사용 */}
            <Form.Control
                type="search"
                placeholder="Find your space"
                className="search-input"
                {...register('search')}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </Form>
    );
}

export default Search;
