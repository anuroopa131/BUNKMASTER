const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

async function getCurrentSemester(db, userId) {
  const [[user]] = await db.query('SELECT current_semester FROM users WHERE id = ?', [userId]);
  if (!user) throw new Error('User not found');
  return user.current_semester;
}

// Get all subjects for a user
router.get('/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await global.db.query(
      `SELECT * FROM subjects
       WHERE user_id = ?
         AND semester_number = (SELECT current_semester FROM users WHERE id = ?)
       ORDER BY subject_name`,
      [userId, userId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new subject
router.post('/', async (req, res) => {
  const { subject_name } = req.body;
  const userId = req.user.id;

  if (!subject_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const semesterNumber = await getCurrentSemester(global.db, userId);
    const [result] = await global.db.query(
      'INSERT INTO subjects (user_id, subject_name, semester_number) VALUES (?, ?, ?)',
      [userId, subject_name, semesterNumber]
    );
    
    const [newSubject] = await global.db.query(
      'SELECT * FROM subjects WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newSubject[0]);
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a subject — cascades to its timetable entries and every
// attendance log tied to them (no DB-level ON DELETE CASCADE exists, so
// this has to be done manually, in order, inside a transaction).
router.delete('/:subjectId', async (req, res) => {
  const { subjectId } = req.params;
  const connection = await global.db.getConnection();

  try {
    // This route only gets a subjectId, not a userId — so unlike the
    // other routes there's no requireSelf to lean on. Look up who
    // actually owns this subject before touching anything.
    const [[owner]] = await connection.query(
      `SELECT user_id FROM subjects
       WHERE id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [subjectId, req.user.id]
    );
    if (!owner) {
      connection.release();
      return res.status(404).json({ error: 'Subject not found' });
    }
    if (String(owner.user_id) !== String(req.user.id)) {
      connection.release();
      return res.status(403).json({ error: 'Forbidden' });
    }

    await connection.beginTransaction();

    await connection.query(
      `DELETE al FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
       WHERE t.subject_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [subjectId, req.user.id]
    );

    await connection.query(
      'DELETE FROM timetable WHERE subject_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [subjectId, req.user.id]
    );

    const [result] = await connection.query(
      'DELETE FROM subjects WHERE id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [subjectId, req.user.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Subject not found' });
    }

    await connection.commit();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

// Delete every subject for a user — cascades to their entire timetable
// and every attendance log tied to it. Used by Danger Zone's "delete all
// subjects" and "start a fresh semester" (subjects are the top of the
// chain, so wiping them wipes everything under them).
router.delete('/all/:userId', requireSelf, async (req, res) => {
  const userId = req.user.id;
  const connection = await global.db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `DELETE al FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
       WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [userId, userId]
    );

    await connection.query(
      'DELETE FROM timetable WHERE user_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [userId, userId]
    );
    const [result] = await connection.query(
      'DELETE FROM subjects WHERE user_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [userId, userId]
    );

    // A fresh semester should also clear the old start date, so the
    // Subjects tab's backfill prompt starts blank again next time.
    await connection.query('UPDATE users SET academic_start_date = NULL WHERE id = ?', [userId]);

    await connection.commit();
    res.json({ message: 'All subjects deleted', deletedCount: result.affectedRows });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting all subjects:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

module.exports = router;
