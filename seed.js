const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const LeaveRequest = require('./models/LeaveRequest');
const Attendance = require('./models/Attendance');
const LearningResource = require('./models/LearningResource');
const CareerPath = require('./models/CareerPath');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
const positions = ['Manager', 'Senior Developer', 'Developer', 'Analyst', 'Coordinator'];

const generateEmployees = async () => {
    const employees = [];
    const password = await bcrypt.hash('password123', 10);

    // Create HR Manager
    employees.push({
        employeeId: 'HR001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        password,
        role: 'hr',
        department: 'HR',
        position: 'Manager',
        joinDate: new Date('2020-01-15'),
        leaveBalance: 25,
        profile: {
            phone: '+1234567890',
            address: '123 HR Street, City',
            emergencyContact: {
                name: 'John Johnson',
                relationship: 'Spouse',
                phone: '+1234567891'
            }
        }
    });

    // Create regular employees
    for (let i = 1; i <= 20; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const pos = positions[Math.floor(Math.random() * positions.length)];
        
        employees.push({
            employeeId: `EMP${String(i).padStart(3, '0')}`,
            firstName: `Employee${i}`,
            lastName: `Last${i}`,
            email: `employee${i}@company.com`,
            password,
            role: 'employee',
            department: dept,
            position: pos,
            joinDate: new Date(`202${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`),
            leaveBalance: 20,
            profile: {
                phone: `+1234567${String(i).padStart(3, '0')}`,
                address: `${i} Employee Street, City`,
                emergencyContact: {
                    name: `Emergency Contact ${i}`,
                    relationship: 'Family',
                    phone: `+1234567${String(i + 100).padStart(3, '0')}`
                }
            }
        });
    }

    return employees;
};

const generateLeaveRequests = (employees) => {
    const leaveRequests = [];
    const leaveTypes = ['annual', 'sick', 'unpaid', 'maternity', 'paternity'];
    
    employees.forEach(employee => {
        // Generate 1-3 leave requests per employee
        const numRequests = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numRequests; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
            const days = Math.floor(Math.random() * 5) + 1;
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + days);
            
            leaveRequests.push({
                employee: employee._id,
                startDate,
                endDate,
                type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                reason: `Sample leave reason ${i + 1}`,
                status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                days,
                comments: `Sample comments for leave request ${i + 1}`
            });
        }
    });

    return leaveRequests;
};

const generateAttendance = (employees) => {
    const attendance = [];
    const today = new Date();
    
    employees.forEach(employee => {
        // Generate attendance for the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const clockIn = new Date(date);
            clockIn.setHours(9, Math.floor(Math.random() * 30), 0);
            
            const clockOut = new Date(date);
            clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
            
            attendance.push({
                employee: employee._id,
                date,
                clockIn,
                clockOut,
                status: ['present', 'late', 'half-day'][Math.floor(Math.random() * 3)],
                location: {
                    type: ['office', 'remote'][Math.floor(Math.random() * 2)],
                    coordinates: {
                        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
                    }
                }
            });
        }
    });

    return attendance;
};

const generateLearningResources = () => {
    const resources = [];
    const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
    const positions = ['Manager', 'Senior Developer', 'Developer', 'Analyst', 'Coordinator'];
    const types = ['video', 'article', 'course', 'document'];

    departments.forEach(dept => {
        positions.forEach(pos => {
            for (let i = 1; i <= 3; i++) {
                resources.push({
                    title: `${dept} ${pos} Learning Resource ${i}`,
                    description: `Comprehensive learning material for ${pos} in ${dept}`,
                    type: types[Math.floor(Math.random() * types.length)],
                    url: `https://example.com/learning/${dept}/${pos}/${i}`,
                    department: dept,
                    position: pos,
                    duration: Math.floor(Math.random() * 120) + 30,
                    tags: ['professional', 'development', dept.toLowerCase(), pos.toLowerCase()]
                });
            }
        });
    });

    return resources;
};

const generateCareerPaths = () => {
    const careerPaths = [];
    const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
    const positions = ['Coordinator', 'Analyst', 'Developer', 'Senior Developer', 'Manager', 'Director'];

    departments.forEach(dept => {
        positions.forEach((pos, index) => {
            if (index < positions.length - 1) {
                careerPaths.push({
                    title: `${dept} Career Path: ${pos} to ${positions[index + 1]}`,
                    description: `Career progression path from ${pos} to ${positions[index + 1]} in ${dept}`,
                    department: dept,
                    currentPosition: pos,
                    nextPositions: [{
                        position: positions[index + 1],
                        requirements: [
                            `Minimum 2 years as ${pos}`,
                            'Strong communication skills',
                            'Leadership potential'
                        ],
                        averageTime: '2-3 years',
                        salaryRange: {
                            min: 50000 + (index * 20000),
                            max: 80000 + (index * 20000)
                        }
                    }],
                    skills: [
                        { name: 'Technical Skills', level: 'advanced' },
                        { name: 'Leadership', level: 'intermediate' },
                        { name: 'Communication', level: 'advanced' }
                    ]
                });
            }
        });
    });

    return careerPaths;
};

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Employee.deleteMany({});
        await LeaveRequest.deleteMany({});
        await Attendance.deleteMany({});
        await LearningResource.deleteMany({});
        await CareerPath.deleteMany({});

        // Generate and insert employees
        const employees = await generateEmployees();
        const insertedEmployees = await Employee.insertMany(employees);
        console.log('Employees seeded successfully');

        // Generate and insert leave requests
        const leaveRequests = generateLeaveRequests(insertedEmployees);
        await LeaveRequest.insertMany(leaveRequests);
        console.log('Leave requests seeded successfully');

        // Generate and insert attendance records
        const attendance = generateAttendance(insertedEmployees);
        await Attendance.insertMany(attendance);
        console.log('Attendance records seeded successfully');

        // Generate and insert learning resources
        const learningResources = generateLearningResources();
        await LearningResource.insertMany(learningResources);
        console.log('Learning resources seeded successfully');

        // Generate and insert career paths
        const careerPaths = generateCareerPaths();
        await CareerPath.insertMany(careerPaths);
        console.log('Career paths seeded successfully');

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 