const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

// Helper function to generate unique employee ID
const generateEmployeeId = async () => {
    try {
        // Get the highest employee ID
        const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
        let nextId = 1;
        
        if (lastEmployee) {
            const lastId = parseInt(lastEmployee.employeeId.slice(3));
            nextId = lastId + 1;
        }

        // Generate the new ID
        const employeeId = `EMP${String(nextId).padStart(3, '0')}`;

        // Double-check if the ID exists (in case of concurrent registrations)
        const existingEmployee = await Employee.findOne({ employeeId });
        if (existingEmployee) {
            // If ID exists, recursively try the next number
            return generateEmployeeId();
        }

        return employeeId;
    } catch (error) {
        console.error('Error generating employee ID:', error);
        throw new Error('Failed to generate employee ID');
    }
};

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, department, position } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if employee already exists
        let employee = await Employee.findOne({ email });
        if (employee) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        // Generate unique employee ID
        const employeeId = await generateEmployeeId();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new employee
        employee = new Employee({
            employeeId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'employee',
            department: department || 'Operations',
            position: position || 'Employee',
            joinDate: new Date(),
            leaveBalance: 20,
            profile: {
                phone: '',
                address: '',
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                }
            }
        });

        // Save employee
        await employee.save();

        // Create JWT token
        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            employee: {
                id: employee._id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: employee.role,
                department: employee.department
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee ID or email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find employee by email
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            employee: {
                id: employee._id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: employee.role,
                department: employee.department
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const employee = await Employee.findById(decoded.id).select('-password');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 