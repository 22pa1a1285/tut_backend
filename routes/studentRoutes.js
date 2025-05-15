const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance'); // Import Attendance model

// Add Student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: 'Student added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving student', error: err });
  }
});

// (Optional) Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err });
  }
});

// Get students by class
router.get('/by-class', async (req, res) => {
  try {
    const classQuery = req.query.class;
    let students;
    if (classQuery === '1-5') {
      students = await Student.find({ class: { $in: ['1', '2', '3', '4', '5'] } });
    } else if (classQuery) {
      students = await Student.find({ class: classQuery });
    } else {
      students = await Student.find();
    }
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students by class', error: err });
  }
});

// Get all students with fees
router.get('/fees', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students with fees', error: err });
  }
});

// Update a student's fees
router.put('/:id/fees', async (req, res) => {
  try {
    const { fees } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
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
router.get('/class-10', async (req, res) => {
  try {
    const students = await Student.find({ class: '10' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching class 10 students', error: err });
  }
});

// Post attendance for all students and store attendance for every student
router.post('/attendance', async (req, res) => {
  try {
    const { date, attendance } = req.body; // attendance: [{ studentId, status }]
    await Promise.all(attendance.map(async (a) => {
      await Attendance.findOneAndUpdate(
        { date, studentId: a.studentId },
        { status: a.status },
        { upsert: true, new: true }
      );
    }));
    res.json({ message: 'Attendance recorded for all students.' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting attendance', error: err });
  }
});

// Get all attendance records for all students
router.get('/attendance-records', async (req, res) => {
  try {
    const records = await Attendance.find({});
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records', error: err });
  }
});

// Get student by id
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err });
  }
});

// Update student by id
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating student', error: err });
  }
});

// Delete student by id
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err });
  }
});

module.exports = router;
