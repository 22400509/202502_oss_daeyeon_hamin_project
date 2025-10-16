import React, { useState, useEffect, useRef } from 'react';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function Calendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {

        const fp = flatpickr(calendarRef.current, {
            inline: true, 
            defaultDate: 'today', 

            onChange: (selectedDates) => {
                setSelectedDate(selectedDates[0]);
            },
        });
    }, []); 

    return (
        <div>
            <h1>Static Calendar 🗓️</h1>

            <div ref={calendarRef}></div>
            <p>
                <strong>Selected Date:</strong> {selectedDate.toLocaleDateString()}
            </p>
        </div>
    );
}

export default Calendar;