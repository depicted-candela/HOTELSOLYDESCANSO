document.addEventListener('DOMContentLoaded', function() {
    let roomNumbers = [];
    const storedRooms = localStorage.getItem('hotelRooms');

    if (storedRooms) {
        roomNumbers = JSON.parse(storedRooms).map(roomData => {
            const room = new Room(roomData.roomNumber);
            room.reservations = roomData.reservations.map(reservation => {
                return { startDate: new Date(reservation.startDate), endDate: new Date(reservation.endDate), name: reservation.name, email: reservation.email };
            });
            room.rents = roomData.rents.map(rent => {
                return { startDate: new Date(rent.startDate), endDate: new Date(rent.endDate), name: rent.name, email: rent.email };
            });
            return room;
        });
    } else {
        roomNumbers = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111].map(roomNumber => new Room(roomNumber));
        saveRoomsToLocalStorage(roomNumbers);
    }

    populateRoomNumbers(roomNumbers, 'roomNumberReservation');
    populateRoomNumbers(roomNumbers, 'roomNumberRent');
    window.roomNumbers = roomNumbers;
});

document.getElementById('checkAvailabilityForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    const availableRooms = window.roomNumbers.filter(room => {
        return room.isAvailable(startDate, endDate);
    }).map(room => room.roomNumber);

    const availableRoomsDiv = document.getElementById('availableRooms');
    if (availableRooms.length > 0) {
        availableRoomsDiv.innerHTML = '<h3>Habitaciones disponibles:</h3>';
        availableRooms.forEach(roomNumber => {
            availableRoomsDiv.innerHTML += `<p>Hab. ${roomNumber}</p>`;
        });
    } else {
        availableRoomsDiv.innerHTML = '<p>No hay habitaciones disponibles para el periodo seleccionado.</p>';
    }

    populateRoomNumbers(availableRooms, 'roomNumberReservation');
    populateRoomNumbers(availableRooms, 'roomNumberRent');
});

document.getElementById('reservationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const roomNumber = parseInt(document.getElementById('roomNumberReservation').value);
    const startDate = new Date(document.getElementById('startDateReservation').value);
    const endDate = new Date(document.getElementById('endDateReservation').value);
    const name = document.getElementById('nameReservation').value;
    const email = document.getElementById('emailReservation').value;

    if (checkRoomAvailability(roomNumber, startDate, endDate, 'reservar')) {
        reserveRoom(roomNumber, startDate, endDate, 'reservar', name, email);
        document.getElementById('reservationStatus').innerHTML = `<p>La habitación ${roomNumber} reservada satisfactoriamente para ${name} (${email})</p>`;
    } else {
        document.getElementById('reservationStatus').innerHTML = `<p>La habitación ${roomNumber} no está disponible para reservar desde ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}</p>`;
    }
});

document.getElementById('rentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const roomNumber = parseInt(document.getElementById('roomNumberRent').value);
    const startDate = new Date(document.getElementById('startDateRent').value);
    const endDate = new Date(document.getElementById('endDateRent').value);
    const name = document.getElementById('nameRent').value;
    const email = document.getElementById('emailRent').value;

    if (checkRoomAvailability(roomNumber, startDate, endDate, 'alquilar')) {
        reserveRoom(roomNumber, startDate, endDate, 'alquilar', name, email);
        document.getElementById('rentStatus').innerHTML = `<p>La habitación ${roomNumber} alquilada satisfactoriamente para ${name} (${email})</p>`;
    } else {
        document.getElementById('rentStatus').innerHTML = `<p>La habitación ${roomNumber} no está disponible para alquilar desde ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}</p>`;
    }
});

class Room {
    constructor(roomNumber) {
        this.roomNumber = roomNumber;
        this.reservations = [];
        this.rents = [];
    }

    isAvailable(startDate, endDate) {
        return !this.reservations.some(reservation => this.isIntersecting(startDate, endDate, new Date(reservation.startDate), new Date(reservation.endDate))) &&
               !this.rents.some(rent => this.isIntersecting(startDate, endDate, new Date(rent.startDate), new Date(rent.endDate)));
    }

    isIntersecting(startDate1, endDate1, startDate2, endDate2) {
        return !(endDate1 < startDate2 || startDate1 > endDate2);
    }

    addReservation(startDate, endDate, name, email) {
        this.reservations.push({ startDate, endDate, name, email });
        saveRoomsToLocalStorage(window.roomNumbers);
    }

    addRent(startDate, endDate, name, email) {
        this.rents.push({ startDate, endDate, name, email });
        saveRoomsToLocalStorage(window.roomNumbers);
    }
}

function populateRoomNumbers(roomNumbers, selectId) {
    const roomNumberSelect = document.getElementById(selectId);
    roomNumberSelect.innerHTML = '';
    roomNumbers.forEach(roomNumber => {
        const option = document.createElement('option');
        option.value = roomNumber.roomNumber ? roomNumber.roomNumber : roomNumber;
        option.textContent = `Hab. ${roomNumber.roomNumber ? roomNumber.roomNumber : roomNumber}`;
        roomNumberSelect.appendChild(option);
    });
}

function checkRoomAvailability(roomNumber, startDate, endDate, serviceType) {
    const room = window.roomNumbers.find(room => room.roomNumber === roomNumber);
    if (!room) return false;
    return room.isAvailable(startDate, endDate);
}

function reserveRoom(roomNumber, startDate, endDate, serviceType, name, email) {
    const room = window.roomNumbers.find(room => room.roomNumber === roomNumber);
    if (!room) return;
    if (serviceType === 'reservar') {
        room.addReservation(startDate, endDate, name, email);
    } else if (serviceType === 'alquilar') {
        room.addRent(startDate, endDate, name, email);
    }
    saveRoomsToLocalStorage(window.roomNumbers);
}

function saveRoomsToLocalStorage(rooms) {
    localStorage.setItem('hotelRooms', JSON.stringify(rooms.map(room => ({
        roomNumber: room.roomNumber,
        reservations: room.reservations,
        rents: room.rents
    }))));
}
