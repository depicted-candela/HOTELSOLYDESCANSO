document.addEventListener('DOMContentLoaded', function() {
    const roomNumbers = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];
    populateRoomNumbers(roomNumbers);
    window.roomNumbers = roomNumbers; // Make the roomNumbers array accessible globally
    window.reservations = getReservationsFromLocalStorage(); // Get reservations from local storage
});

document.getElementById('checkAvailabilityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Fetch available rooms considering existing reservations
    const availableRooms = fetchAvailableRooms(startDate, endDate);

    // Display available rooms
    const availableRoomsDiv = document.getElementById('availableRooms');
    availableRoomsDiv.innerHTML = '<h3>Habitaciones disponibles:</h3>';
    availableRooms.forEach(room => {
        availableRoomsDiv.innerHTML += `<p>Hab. ${room}</p>`;
    });

    // Populate room number select options
    const roomNumberSelect = document.getElementById('roomNumber');
    roomNumberSelect.innerHTML = '';
    availableRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = `Hab. ${room}`;
        roomNumberSelect.appendChild(option);
    });
});

document.getElementById('reservationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const roomNumber = document.getElementById('roomNumber').value;
    const startDate = document.getElementById('startDateReservation').value;
    const endDate = document.getElementById('endDateReservation').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Check if the room is available for the given date span
    const isAvailable = checkRoomAvailability(roomNumber, startDate, endDate);
    let reservationStatus;
    if (isAvailable) {
        // Reserve the room
        reserveRoom(roomNumber, startDate, endDate, name, email);
        reservationStatus = `<p>Room ${roomNumber} reserved successfully for ${name} (${email})</p>`;
    } else {
        reservationStatus = `<p>Room ${roomNumber} is not available from ${startDate} to ${endDate}</p>`;
    }

    // Display reservation status
    const reservationStatusDiv = document.getElementById('reservationStatus');
    reservationStatusDiv.innerHTML = reservationStatus;
});

function populateRoomNumbers(roomNumbers) {
    const roomNumberSelect = document.getElementById('roomNumber');
    roomNumberSelect.innerHTML = '';
    roomNumbers.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = `Hab. ${room}`;
        roomNumberSelect.appendChild(option);
    });
}

function fetchAvailableRooms(startDate, endDate) {
    // Check available rooms considering existing reservations
    const availableRooms = window.roomNumbers.filter(room => {
        return !window.reservations.some(reservation => {
            return reservation.roomNumber == room &&
                ((new Date(startDate) >= new Date(reservation.startDate) && new Date(startDate) <= new Date(reservation.endDate)) ||
                (new Date(endDate) >= new Date(reservation.startDate) && new Date(endDate) <= new Date(reservation.endDate)) ||
                (new Date(startDate) <= new Date(reservation.startDate) && new Date(endDate) >= new Date(reservation.endDate)));
        });
    });
    return availableRooms;
}

function checkRoomAvailability(roomNumber, startDate, endDate) {
    // Check if the room is available for the given date span
    return !window.reservations.some(reservation => {
        return reservation.roomNumber == roomNumber &&
            ((new Date(startDate) >= new Date(reservation.startDate) && new Date(startDate) <= new Date(reservation.endDate)) ||
            (new Date(endDate) >= new Date(reservation.startDate) && new Date(endDate) <= new Date(reservation.endDate)) ||
            (new Date(startDate) <= new Date(reservation.startDate) && new Date(endDate) >= new Date(reservation.endDate)));
    });
}

function reserveRoom(roomNumber, startDate, endDate, name, email) {
    // Add the reservation to the reservations array
    const newReservation = { roomNumber, startDate, endDate, name, email };
    window.reservations.push(newReservation);
    saveReservationsToLocalStorage(window.reservations);
}

function getReservationsFromLocalStorage() {
    const reservations = localStorage.getItem('reservations');
    return reservations ? JSON.parse(reservations) : [];
}

function saveReservationsToLocalStorage(reservations) {
    localStorage.setItem('reservations', JSON.stringify(reservations));
}
