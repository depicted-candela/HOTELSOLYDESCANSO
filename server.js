// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"]
            }
        }
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

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

let users = []; // This should be replaced with a database in production

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
}

app.post('/api/register', [
    check('username').isString().notEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.json({ message: 'User registered successfully' });
});

app.post('/api/login', [
    check('username').isString().notEmpty().withMessage('Username is required'),
    check('password').isString().notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.post('/api/checkAvailability', [
    check('startDate').isISO8601().withMessage('Start date must be a valid date'),
    check('endDate').isISO8601().withMessage('End date must be a valid date')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.body;
    const availableRooms = rooms.filter(room => room.isAvailable(new Date(startDate), new Date(endDate)));
    res.json(availableRooms);
});

app.post('/api/reserve', authenticateToken, [
    check('roomNumber').isInt().withMessage('Room number must be an integer'),
    check('startDate').isISO8601().withMessage('Start date must be a valid date'),
    check('endDate').isISO8601().withMessage('End date must be a valid date'),
    check('name').isString().notEmpty().withMessage('Name must be a non-empty string'),
    check('email').isEmail().withMessage('Email must be a valid email address')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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

app.post('/api/rent', authenticateToken, [
    check('roomNumber').isInt().withMessage('Room number must be an integer'),
    check('startDate').isISO8601().withMessage('Start date must be a valid date'),
    check('endDate').isISO8601().withMessage('End date must be a valid date'),
    check('name').isString().notEmpty().withMessage('Name must be a non-empty string'),
    check('email').isEmail().withMessage('Email must be a valid email address')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
