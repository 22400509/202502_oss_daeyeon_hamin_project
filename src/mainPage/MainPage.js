import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function MainPage() {
    return (
        <>
            <Container>
                <Row className="align-items-end bg-danger" style={{ height: "30vw" }}>
                    <Col sm={6}>
                        <h1>AstroLens</h1>
                        <h6>A new glimpse of the cosmos, delivered daily.<br/> This site features the official Astronomy Picture of the Day from NASA.</h6>
                    </Col>
                    <Col sm={6}>
                        <input type="date" id="picturedate" name="user_picturedate"></input>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default MainPage;