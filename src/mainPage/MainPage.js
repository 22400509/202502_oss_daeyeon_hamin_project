import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './MainPage.css';

function MainPage() {
    return (
        <>
            <div class="parallax-container">
                <img id="foreground-img" src="z2 1.svg" alt="Astronaut in foreground"/>
                    <h1 >NASA, Time to shine</h1>
                    <a href="#bottom-section" id="scroll-btn">Explore</a>
            </div>

            <div id="bottom-section">
                <p>You made it to the content!</p>
            </div>
        </>
    );
}

export default MainPage;