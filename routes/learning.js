const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LearningResource = require('../models/LearningResource');
const CareerPath = require('../models/CareerPath');

// Get all learning resources
router.get('/resources', protect, async (req, res) => {
    try {
        const resources = await LearningResource.find();
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get career paths
router.get('/career-paths', protect, async (req, res) => {
    try {
        const careerPaths = await CareerPath.find();
        res.json(careerPaths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get personalized learning recommendations
router.get('/recommendations', protect, async (req, res) => {
    try {
        const user = req.user;
        const recommendations = await LearningResource.find({
            department: user.department,
            position: user.position
        });
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 