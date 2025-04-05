const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

// Get all leave requests (HR only)
router.get('/', async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find()
            .populate('employee', 'firstName lastName employeeId department')
            .populate('approvedBy', 'firstName lastName');
        res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get leave requests for current employee
router.get('/my-requests', async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find({ employee: req.user.id })
            .populate('approvedBy', 'firstName lastName');
        res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new leave request
router.post('/', async (req, res) => {
    try {
        const { startDate, endDate, type, reason } = req.body;
        
        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leaveRequest = new LeaveRequest({
            employee: req.user.id,
            startDate,
            endDate,
            type,
            reason,
            days
        });

        await leaveRequest.save();
        res.status(201).json(leaveRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update leave request status (HR only)
router.put('/:id', async (req, res) => {
    try {
        const { status, comments } = req.body;
        const leaveRequest = await LeaveRequest.findById(req.params.id);

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Update leave request
        leaveRequest.status = status;
        leaveRequest.comments = comments;
        leaveRequest.approvedBy = req.user.id;

        // If approved, update employee's leave balance
        if (status === 'approved' && leaveRequest.type === 'annual') {
            const employee = await Employee.findById(leaveRequest.employee);
            employee.leaveBalance -= leaveRequest.days;
            await employee.save();
        }

        await leaveRequest.save();
        res.json(leaveRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 