const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Clock in
router.post('/clock-in', async (req, res) => {
    try {
        const { location } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existingAttendance = await Attendance.findOne({
            employee: req.user.id,
            date: today
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Already clocked in today' });
        }

        const attendance = new Attendance({
            employee: req.user.id,
            date: today,
            clockIn: new Date(),
            location
        });

        await attendance.save();
        res.status(201).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Clock out
router.post('/clock-out', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: req.user.id,
            date: today
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No clock-in record found for today' });
        }

        if (attendance.clockOut) {
            return res.status(400).json({ message: 'Already clocked out today' });
        }

        attendance.clockOut = new Date();
        
        // Calculate if late based on clock-in time
        const clockInHour = attendance.clockIn.getHours();
        const clockInMinute = attendance.clockIn.getMinutes();
        
        if (clockInHour > 9 || (clockInHour === 9 && clockInMinute > 30)) {
            attendance.status = 'late';
        }

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance history for current employee
router.get('/my-attendance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { employee: req.user.id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all attendance records (HR only)
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('employee', 'firstName lastName employeeId department')
            .sort({ date: -1 });

        if (department) {
            attendance = attendance.filter(record => 
                record.employee.department.toLowerCase() === department.toLowerCase()
            );
        }

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 