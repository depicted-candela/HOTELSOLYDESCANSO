// scripts.js
document.getElementById('checkAvailabilityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Fetch available rooms (mock data for now)
    const availableRooms = fetchAvailableRooms(startDate, endDate);
    
    // Display available rooms
    const availableRoomsDiv = document.getElementById('availableRooms');
    availableRoomsDiv.innerHTML = '<h3>Available Rooms:</h3>';
    availableRooms.forEach(room => {
        availableRoomsDiv.innerHTML += `<p>Room ${room}</p>`;
    });
});

document.getElementById('reservationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const roomNumber = document.getElementById('roomNumber').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Reserve the room (mock function for now)
    const reservationStatus = reserveRoom(roomNumber, name, email);

    // Display reservation status
    const reservationStatusDiv = document.getElementById('reservationStatus');
    reservationStatusDiv.innerHTML = reservationStatus;
});

function fetchAvailableRooms(startDate, endDate) {
    // Mock data - replace with actual API call
    return [101, 102, 103, 104];
}

function reserveRoom(roomNumber, name, email) {
    // Mock function - replace with actual API call
    return `<p>Room ${roomNumber} reserved successfully for ${name} (${email})</p>`;
}
