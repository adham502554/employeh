const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');

// Create leave request
router.post('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, reason, type } = req.body;

        const leaveRequest = new LeaveRequest({
            employee: req.employee._id,
            startDate,
            endDate,
            reason,
            type
        });

        await leaveRequest.save();
        res.status(201).json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all leave requests for current employee
router.get('/my-leaves', auth, async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find({ employee: req.employee._id })
            .sort({ createdAt: -1 });
        res.json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all leave requests (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.employee.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const leaveRequests = await LeaveRequest.find()
            .populate('employee', 'name email')
            .sort({ createdAt: -1 });
        res.json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update leave request status (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.employee.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        const leaveRequest = await LeaveRequest.findById(req.params.id);

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leaveRequest.status = status;
        await leaveRequest.save();

        res.json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 