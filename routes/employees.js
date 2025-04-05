const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find()
            .select('-password')
            .sort({ department: 1, lastName: 1 });
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-password');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new employee
router.post('/', async (req, res) => {
    try {
        const {
            employeeId,
            firstName,
            lastName,
            email,
            password,
            department,
            position,
            role = 'employee'
        } = req.body;

        // Check if employee already exists
        let employee = await Employee.findOne({ email });
        if (employee) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        employee = new Employee({
            employeeId,
            firstName,
            lastName,
            email,
            password,
            department,
            position,
            role
        });

        await employee.save();
        
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;
        
        res.status(201).json(employeeResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            department,
            position,
            role,
            profile
        } = req.body;

        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update fields
        employee.firstName = firstName || employee.firstName;
        employee.lastName = lastName || employee.lastName;
        employee.email = email || employee.email;
        employee.department = department || employee.department;
        employee.position = position || employee.position;
        employee.role = role || employee.role;
        
        if (profile) {
            employee.profile = {
                ...employee.profile,
                ...profile
            };
        }

        await employee.save();
        
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;
        
        res.json(employeeResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await employee.remove();
        res.json({ message: 'Employee removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update employee password
router.put('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.password = password;
        await employee.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 