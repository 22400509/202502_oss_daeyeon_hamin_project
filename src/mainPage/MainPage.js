import React from "react";
import './MainPage.css';
import background from "./images/z2 1.svg"
import Search from "./components/Search";

function MainPage() {
    return (
        <>
            <div class="parallax-container">
                <img id="foreground-img" src={background} alt="Astronaut in foreground" />
                <div>
                    <h1 id="title">ASTROLENS</h1>
                    <p id="subtitle">One, with the Universe</p>
                </div>
                <a href="#bottom-section" id="scroll-btn">Explore</a>

            </div>

            <div id="bottom-section">
                <Search/>
                <input type="date"></input>
            </div>
        </>
    );
}

export default MainPage;