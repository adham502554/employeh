const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://hr-portal:hr-portal-pass@cluster0.mongodb.net/hr-portal?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await User.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Attendance.deleteMany({});

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Management'
      },
      {
        name: 'HR Manager',
        email: 'hr@example.com',
        password: await bcrypt.hash('hr123', 10),
        role: 'hr',
        department: 'Human Resources'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        department: 'Engineering'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        department: 'Marketing'
      }
    ];

    const createdUsers = await User.insertMany(users);

    // Create leave requests
    const leaveRequests = [
      {
        employee: createdUsers[2]._id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        reason: 'Annual leave',
        status: 'approved'
      },
      {
        employee: createdUsers[3]._id,
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-12'),
        reason: 'Sick leave',
        status: 'pending'
      }
    ];

    await LeaveRequest.insertMany(leaveRequests);

    // Create attendance records
    const attendanceRecords = [
      {
        employee: createdUsers[2]._id,
        date: new Date('2024-02-28'),
        checkIn: new Date('2024-02-28T09:00:00'),
        checkOut: new Date('2024-02-28T17:00:00')
      },
      {
        employee: createdUsers[3]._id,
        date: new Date('2024-02-28'),
        checkIn: new Date('2024-02-28T08:45:00'),
        checkOut: new Date('2024-02-28T17:30:00')
      }
    ];

    await Attendance.insertMany(attendanceRecords);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 