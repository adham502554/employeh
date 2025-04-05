const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const LeaveRequest = require('./models/LeaveRequest');
const Attendance = require('./models/Attendance');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Seed data
const seedDatabase = async () => {
    try {
        // Clear existing data
        await Employee.deleteMany({});
        await LeaveRequest.deleteMany({});
        await Attendance.deleteMany({});

        // Create admin employee
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await Employee.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin',
            department: 'Administration',
            position: 'System Administrator'
        });

        // Create regular employee
        const employeePassword = await bcrypt.hash('employee123', 10);
        const employee = await Employee.create({
            name: 'Regular Employee',
            email: 'employee@example.com',
            password: employeePassword,
            role: 'employee',
            department: 'Development',
            position: 'Software Developer'
        });

        // Create sample leave requests
        await LeaveRequest.create([
            {
                employee: employee._id,
                startDate: new Date('2024-04-01'),
                endDate: new Date('2024-04-03'),
                reason: 'Family vacation',
                type: 'vacation',
                status: 'approved'
            },
            {
                employee: employee._id,
                startDate: new Date('2024-04-15'),
                endDate: new Date('2024-04-15'),
                reason: 'Doctor appointment',
                type: 'sick',
                status: 'pending'
            }
        ]);

        // Create sample attendance records
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Attendance.create([
            {
                employee: employee._id,
                date: today,
                checkIn: new Date(today.setHours(9, 0, 0)),
                checkOut: new Date(today.setHours(17, 0, 0)),
                status: 'present'
            },
            {
                employee: admin._id,
                date: today,
                checkIn: new Date(today.setHours(8, 30, 0)),
                checkOut: new Date(today.setHours(17, 30, 0)),
                status: 'present'
            }
        ]);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 