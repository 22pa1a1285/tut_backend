const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance'); // Import Attendance model
const { authenticateToken } = require('../middleware/auth');

// Add Student
router.post('/', authenticateToken, async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      userId: req.user._id
    };
    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ message: 'Student added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving student', error: err });
  }
});

// (Optional) Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Handle both new data (with userId) and legacy data (without userId)
    const students = await Student.find({ 
      $or: [
        { userId: req.user._id },
        { userId: { $exists: false } } // Legacy data without userId
      ]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err });
  }
});

// Get students by class
router.get('/by-class', authenticateToken, async (req, res) => {
  try {
    const classQuery = req.query.class;
    let students;
    const baseQuery = { 
      $or: [
        { userId: req.user._id },
        { userId: { $exists: false } } // Legacy data without userId
      ]
    };
    
    if (classQuery === '1-5') {
      students = await Student.find({ ...baseQuery, class: { $in: ['1', '2', '3', '4', '5'] } });
    } else if (classQuery) {
      students = await Student.find({ ...baseQuery, class: classQuery });
    } else {
      students = await Student.find(baseQuery);
    }
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students by class', error: err });
  }
});

// Get all students with fees
router.get('/fees', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ 
      $or: [
        { userId: req.user._id },
        { userId: { $exists: false } } // Legacy data without userId
      ]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students with fees', error: err });
  }
});

// Update a student's fees
router.put('/:id/fees', authenticateToken, async (req, res) => {
  try {
    const { fees } = req.body;
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { fees },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Fees updated successfully!', student });
  } catch (err) {
    res.status(500).json({ message: 'Error updating fees', error: err });
  }
});

// Get all class 10 students
router.get('/class-10', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ 
      $or: [
        { userId: req.user._id, class: '10' },
        { userId: { $exists: false }, class: '10' } // Legacy data without userId
      ]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching class 10 students', error: err });
  }
});

// Post attendance for all students and store attendance for every student
router.post('/attendance', authenticateToken, async (req, res) => {
  try {
    const { date, attendance } = req.body; // attendance: [{ studentId, status }]
    await Promise.all(attendance.map(async (a) => {
      await Attendance.findOneAndUpdate(
        { date, studentId: a.studentId, userId: req.user._id },
        { status: a.status, userId: req.user._id },
        { upsert: true, new: true }
      );
    }));
    res.json({ message: 'Attendance recorded for all students.' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting attendance', error: err });
  }
});

// Get all attendance records for all students
router.get('/attendance-records', authenticateToken, async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user._id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records', error: err });
  }
});

// Get student by id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err });
  }
});

// Update student by id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating student', error: err });
  }
});

// Delete student by id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err });
  }
});

module.exports = router;
