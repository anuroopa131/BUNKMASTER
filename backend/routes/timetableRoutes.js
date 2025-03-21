const express = require('express');
const Timetable = require('../models/Timetable'); // Import the Timetable model

const router = express.Router();

// Fetch timetable
router.get('/', async (req, res) => {
  try {
    const timetable = await Timetable.find(); // Fetch data from MongoDB
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

module.exports = router;