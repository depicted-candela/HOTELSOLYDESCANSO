// public/scripts.js

document.addEventListener('DOMContentLoaded', async function() {
    const roomNumbers = await fetchRooms();
    populateRoomNumbers(roomNumbers, 'roomNumberReservation');
    populateRoomNumbers(roomNumbers, 'roomNumberRent');
    populateRoomGallery(roomNumbers);
    window.roomNumbers = roomNumbers;
});

async function fetchRooms() {
    const response = await fetch('/api/rooms');
    return response.json();
}

document.getElementById('checkAvailabilityForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const availableRooms = await checkAvailability(startDate, endDate);
    htmlForAvailability(availableRooms, document.getElementById('availableRooms'));
    populateRoomNumbers(availableRooms, 'roomNumberReservation');
    populateRoomNumbers(availableRooms, 'roomNumberRent');
    populateRoomGallery(availableRooms);
});

async function checkAvailability(startDate, endDate) {
    const response = await fetch('/api/checkAvailability', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
}

document.getElementById('reservationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const roomNumber = parseInt(document.getElementById('roomNumberReservation').value);
    const startDate = document.getElementById('startDateReservation').value;
    const endDate = document.getElementById('endDateReservation').value;
    const name = document.getElementById('nameReservation').value;
    const email = document.getElementById('emailReservation').value;

    const success = await reserveRoom(roomNumber, startDate, endDate, name, email);
    document.getElementById('reservationStatus').innerHTML = success ?
        `<p>La habitación ${roomNumber} reservada satisfactoriamente para ${name} (${email})</p>` :
        `<p>La habitación ${roomNumber} no está disponible para reservar desde ${startDate} a ${endDate}</p>`;
});

async function reserveRoom(roomNumber, startDate, endDate, name, email) {
    const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomNumber, startDate, endDate, name, email })
    });
    const result = await response.json();
    return result.success;
}

document.getElementById('rentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const roomNumber = parseInt(document.getElementById('roomNumberRent').value);
    const startDate = document.getElementById('startDateRent').value;
    const endDate = document.getElementById('endDateRent').value;
    const name = document.getElementById('nameRent').value;
    const email = document.getElementById('emailRent').value;

    const success = await rentRoom(roomNumber, startDate, endDate, name, email);
    document.getElementById('rentStatus').innerHTML = success ?
        `<p>La habitación ${roomNumber} alquilada satisfactoriamente para ${name} (${email})</p>` :
        `<p>La habitación ${roomNumber} no está disponible para alquilar desde ${startDate} a ${endDate}</p>`;
});

async function rentRoom(roomNumber, startDate, endDate, name, email) {
    const response = await fetch('/api/rent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomNumber, startDate, endDate, name, email })
    });
    const result = await response.json();
    return result.success;
}

function populateRoomNumbers(roomNumbers, selectId) {
    const roomNumberSelect = document.getElementById(selectId);
    roomNumberSelect.innerHTML = '';
    roomNumbers.forEach(room => {
        const option = document.createElement('option');
        option.value = room.roomNumber;
        option.textContent = `Hab. ${room.roomNumber} (${room.environments} ambiente${room.environments > 1 ? 's' : ''})`;
        roomNumberSelect.appendChild(option);
    });
}

function populateRoomGallery(roomNumbers) {
    const roomGallery = document.getElementById('roomGallery');
    roomGallery.innerHTML = '';
    roomNumbers.forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room-item';
        roomDiv.innerHTML = `
            <img src="${room.image}" alt="Room ${room.roomNumber}">
            <p>Hab. ${room.roomNumber} (${room.environments} ambiente${room.environments > 1 ? 's' : ''})</p>
        `;
        roomGallery.appendChild(roomDiv);
    });
}

function htmlForAvailability(availableRooms, availableRoomsDiv) {
    if (availableRooms.length > 0) {
        availableRoomsDiv.innerHTML = '<h3>Habitaciones disponibles:</h3>';
        availableRooms.forEach(room => {
            availableRoomsDiv.innerHTML += `<p>Hab. ${room.roomNumber} (${room.environments} ambiente${room.environments > 1 ? 's' : ''})</p>`;
        });
    } else {
        availableRoomsDiv.innerHTML = '<p>No hay habitaciones disponibles para el periodo seleccionado.</p>';
    }
}
