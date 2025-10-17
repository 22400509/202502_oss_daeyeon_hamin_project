import React, { useState } from "react";

function Search(){  
    const[searchTerm, setSearchTerm] = useState("");

    return(
        <>
            <input
                type="search"
                placeholder="find your space"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </>
    );
}

export default Search;