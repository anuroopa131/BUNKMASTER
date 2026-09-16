const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

async function getCurrentSemester(db, userId) {
  const [[user]] = await db.query('SELECT current_semester FROM users WHERE id = ?', [userId]);
  if (!user) throw new Error('User not found');
  return user.current_semester;
}

// Get complete timetable with subject details
router.get('/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await global.db.query(
      `SELECT 
        t.id,
        t.day_of_week,
        TIME_FORMAT(t.start_time, '%h:%i %p') as start_time,
        s.id as subject_id,
        s.subject_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.user_id = ?
        AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        t.start_time`,
      [userId, userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a single timetable entry (kept for backwards compatibility)
router.post('/', async (req, res) => {
  const { subject_id, day_of_week, start_time } = req.body;
  const userId = req.user.id;

  if (!subject_id || !day_of_week || !start_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const semesterNumber = await getCurrentSemester(global.db, userId);
    // Two subjects can't share the same day + start time for one user.
    const [clash] = await global.db.query(
      'SELECT id FROM timetable WHERE user_id = ? AND semester_number = ? AND day_of_week = ? AND start_time = ?',
      [userId, semesterNumber, day_of_week, start_time]
    );
    if (clash.length > 0) {
      return res.status(409).json({ error: 'You already have a class scheduled at this day and time' });
    }

    const [subject] = await global.db.query(
      'SELECT id FROM subjects WHERE id = ? AND user_id = ? AND semester_number = ?',
      [subject_id, userId, semesterNumber]
    );

    if (subject.length === 0) {
      return res.status(403).json({ error: 'Subject does not belong to this user' });
    }

    const [result] = await global.db.query(
      'INSERT INTO timetable (user_id, subject_id, day_of_week, start_time, semester_number) VALUES (?, ?, ?, ?, ?)',
      [userId, subject_id, day_of_week, start_time, semesterNumber]
    );

    const [newEntry] = await global.db.query(
      `SELECT 
        t.id,
        t.day_of_week,
        TIME_FORMAT(t.start_time, '%h:%i %p') as start_time,
        s.id as subject_id,
        s.subject_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newEntry[0]);
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ error: "Database error" });
  }
});

// Bulk save — used by the manual-entry UI (and later, the extraction/confirm flow).
// Accepts { userId, entries: [{ day, time, subject, teacher, room }, ...] }
// Resolves each entry's subject name to a subject_id, creating the subject if it
// doesn't exist yet for this user. teacher/room are accepted but not persisted —
// the `timetable` table has no columns for them yet.
router.post('/upload', async (req, res) => {
  const { entries } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: "A non-empty entries array is required" });
  }

  const connection = await global.db.getConnection();

  try {
    const semesterNumber = await getCurrentSemester(connection, userId);
    await connection.beginTransaction();

    const savedEntries = [];

    for (const entry of entries) {
      const { day, time, subject } = entry;

      if (!day || !time || !subject || !subject.trim()) {
        throw new Error(`Invalid entry: ${JSON.stringify(entry)}`);
      }

      // "09:00 - 10:00" -> "09:00:00" (start time only; MySQL TIME column)
      const startTimeRaw = time.split('-')[0].trim();
      const startTime = startTimeRaw.length === 5 ? `${startTimeRaw}:00` : startTimeRaw;

      // Find existing subject for this user, or create it
      const [existingSubject] = await connection.query(
        'SELECT id FROM subjects WHERE user_id = ? AND semester_number = ? AND subject_name = ?',
        [userId, semesterNumber, subject.trim()]
      );

      let subjectId;
      if (existingSubject.length > 0) {
        subjectId = existingSubject[0].id;
      } else {
        const [newSubject] = await connection.query(
          'INSERT INTO subjects (user_id, subject_name, semester_number) VALUES (?, ?, ?)',
          [userId, subject.trim(), semesterNumber]
        );
        subjectId = newSubject.insertId;
      }

      const [result] = await connection.query(
        'INSERT INTO timetable (user_id, subject_id, day_of_week, start_time, semester_number) VALUES (?, ?, ?, ?, ?)',
        [userId, subjectId, day, startTime, semesterNumber]
      );

      savedEntries.push({ id: result.insertId, day, start_time: startTime, subject });
    }

    await connection.commit();
    res.status(201).json({ message: 'Timetable saved', count: savedEntries.length, entries: savedEntries });
  } catch (error) {
    await connection.rollback();
    console.error('Error bulk-saving timetable:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Leftover debug endpoint — gated the same as everything else rather than
// removed outright, in case you're still using it. Safe to delete later.
router.get('/debug/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await global.db.query(
      `SELECT 
        day_of_week,
        COUNT(*) as count,
        GROUP_CONCAT(TIME_FORMAT(start_time, '%h:%i %p')) as times
      FROM timetable 
      WHERE user_id = ?
        AND semester_number = (SELECT current_semester FROM users WHERE id = ?)
      GROUP BY day_of_week`,
      [userId, userId]
    );

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayDate = new Date().toISOString().split('T')[0];

    res.json({
      today: today,
      today_date: todayDate,
      your_timetable_days: rows,
      message: `Today is ${today}. Your timetable has entries for: ${rows.map(r => r.day_of_week).join(', ') || 'no days yet'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete timetable entry — cascades to its attendance logs (no DB-level
// ON DELETE CASCADE, so this is done manually inside a transaction).
router.delete('/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const connection = await global.db.getConnection();

  try {
    // No userId in this URL, so check ownership by hand before deleting.
    const [[owner]] = await connection.query(
      `SELECT user_id FROM timetable
       WHERE id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [entryId, req.user.id]
    );
    if (!owner) {
      connection.release();
      return res.status(404).json({ error: 'Timetable entry not found' });
    }
    if (String(owner.user_id) !== String(req.user.id)) {
      connection.release();
      return res.status(403).json({ error: 'Forbidden' });
    }

    await connection.beginTransaction();

    await connection.query('DELETE FROM attendance_logs WHERE timetable_id = ?', [entryId]);
    const [result] = await connection.query(
      'DELETE FROM timetable WHERE id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [entryId, req.user.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Timetable entry not found' });
    }

    await connection.commit();
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

// Delete every timetable entry for a user — cascades to every attendance
// log tied to it. Subjects themselves are left alone (Danger Zone's
// "delete timetable" is scoped to just the schedule).
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

    const [result] = await connection.query(
      'DELETE FROM timetable WHERE user_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)',
      [userId, userId]
    );

    await connection.commit();
    res.json({ message: 'Timetable deleted', deletedCount: result.affectedRows });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting all timetable entries:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    connection.release();
  }
});

module.exports = router;
