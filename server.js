// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

class Room {
    constructor(roomNumber, environments, image) {
        this.roomNumber = roomNumber;
        this.environments = environments;
        this.image = image;
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
    }

    addRent(startDate, endDate, name, email) {
        this.rents.push({ startDate, endDate, name, email });
    }
}

let rooms = require('./rooms.json').map(roomData => {
    const room = new Room(roomData.roomNumber, roomData.environments, roomData.image);
    room.reservations = roomData.reservations;
    room.rents = roomData.rents;
    return room;
});

app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.post('/api/checkAvailability', (req, res) => {
    const { startDate, endDate } = req.body;
    const availableRooms = rooms.filter(room => room.isAvailable(new Date(startDate), new Date(endDate)));
    res.json(availableRooms);
});

app.post('/api/reserve', (req, res) => {
    const { roomNumber, startDate, endDate, name, email } = req.body;
    const room = rooms.find(r => r.roomNumber === roomNumber);
    if (room && room.isAvailable(new Date(startDate), new Date(endDate))) {
        room.addReservation(new Date(startDate), new Date(endDate), name, email);
        saveRooms();
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Room not available' });
    }
});

app.post('/api/rent', (req, res) => {
    const { roomNumber, startDate, endDate, name, email } = req.body;
    const room = rooms.find(r => r.roomNumber === roomNumber);
    if (room && room.isAvailable(new Date(startDate), new Date(endDate))) {
        room.addRent(new Date(startDate), new Date(endDate), name, email);
        saveRooms();
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Room not available' });
    }
});

function saveRooms() {
    fs.writeFileSync('./rooms.json', JSON.stringify(rooms, null, 2));
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
