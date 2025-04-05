const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// Check in
router.post('/check-in', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        let attendance = await Attendance.findOne({
            employee: req.employee._id,
            date: today
        });

        if (attendance) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        attendance = new Attendance({
            employee: req.employee._id,
            date: today,
            checkIn: new Date(),
            status: 'present'
        });

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Check out
router.post('/check-out', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: req.employee._id,
            date: today
        });

        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOut = new Date();
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance for current employee
router.get('/my-attendance', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { employee: req.employee._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all attendance (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.employee.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { startDate, endDate, employeeId } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (employeeId) {
            query.employee = employeeId;
        }

        const attendance = await Attendance.find(query)
            .populate('employee', 'name email')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 