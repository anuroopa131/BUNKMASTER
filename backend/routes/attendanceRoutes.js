const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const todayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mark attendance
router.post('/', async (req, res) => {
  const { timetable_id, date, status } = req.body;

  if (date > todayStr()) {
    return res.status(400).json({ error: 'Cannot mark attendance for a future date' });
  }

  try {
    // No userId in the body here — only timetable_id — so ownership has
    // to be checked by looking up which user that timetable entry
    // belongs to, same pattern as the id-only delete routes elsewhere.
    const [[owner]] = await global.db.query(
      `SELECT user_id FROM timetable
       WHERE id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [timetable_id, req.user.id]
    );
    if (!owner) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }
    if (String(owner.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [existing] = await global.db.query(
      'SELECT id FROM attendance_logs WHERE timetable_id = ? AND date = ?',
      [timetable_id, date]
    );
    
    if (existing.length > 0) {
      // Flipping a day by hand — even if it was originally backfilled,
      // it's now a real correction and should never get swept up by a
      // future shrink-the-start-date delete.
      await global.db.query(
        'UPDATE attendance_logs SET status = ?, source = ? WHERE timetable_id = ? AND date = ?',
        [status, 'manual', timetable_id, date]
      );
      res.json({ message: "Attendance updated" });
    } else {
      await global.db.query(
        'INSERT INTO attendance_logs (timetable_id, date, status, source) VALUES (?, ?, ?, ?)',
        [timetable_id, date, status, 'manual']
      );
      res.status(201).json({ message: "Attendance recorded" });
    }
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get today's attendance status
router.get('/today/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = todayStr();
    const dayOfWeek = DAYS_OF_WEEK[new Date().getDay()];
    
    const [rows] = await global.db.query(
      `SELECT 
        t.id as timetable_id,
        s.subject_name,
        TIME_FORMAT(t.start_time, '%h:%i %p') as start_time,
        al.status
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN attendance_logs al ON t.id = al.timetable_id AND al.date = ?
      WHERE t.user_id = ?
        AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
        AND t.day_of_week = ?
      ORDER BY t.start_time`,
      [today, userId, userId, dayOfWeek]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching today\'s attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get classes scheduled for a specific date, with attendance status if marked
router.get('/date/:userId/:date', requireSelf, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = DAYS_OF_WEEK[new Date(y, m - 1, d, 12, 0, 0).getDay()];

    const [classes] = await global.db.query(
      `SELECT t.id as timetable_id, s.subject_name, 
        TIME_FORMAT(t.start_time, '%h:%i %p') as start_time, al.status
       FROM timetable t
       JOIN subjects s ON t.subject_id = s.id
       LEFT JOIN attendance_logs al ON al.timetable_id = t.id AND al.date = ?
       WHERE t.user_id = ?
         AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
         AND t.day_of_week = ?
       ORDER BY t.start_time`,
      [date, userId, userId, dayOfWeek]
    );
    res.json(classes);
  } catch (err) {
    console.error('Error fetching classes for date:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a month's daily attendance summary (for calendar dots)
router.get('/month/:userId/:year/:month', requireSelf, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;
    const [rows] = await global.db.query(
      `SELECT DATE_FORMAT(al.date, '%Y-%m-%d') as date,
         SUM(CASE WHEN al.status='present' THEN 1 ELSE 0 END) as present_count,
         COUNT(al.id) as total_count
       FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
       WHERE t.user_id = ?
         AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
         AND YEAR(al.date) = ? AND MONTH(al.date) = ?
       GROUP BY al.date`,
      [userId, userId, year, month]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching month summary:', err);
    res.status(500).json({ error: err.message });
  }
});

// Builds one attendance_logs row per scheduled class between fromDateStr
// (inclusive) and toDateStrExclusive (exclusive), tagged source='backfill',
// and inserts them with INSERT IGNORE so any day that already has a row
// (manual or backfill) is left completely untouched. Returns rows actually
// inserted (the ignored duplicates don't count).
async function insertBackfillRows(timetable, fromDateStr, toDateStrExclusive) {
  const rowsToInsert = [];
  const [fromY, fromM, fromD] = fromDateStr.split('-').map(Number);
  const [toY, toM, toD] = toDateStrExclusive.split('-').map(Number);

  // Use local noon to prevent any DST/timezone shifts
  const current = new Date(fromY, fromM - 1, fromD, 12, 0, 0);
  const end = new Date(toY, toM - 1, toD, 12, 0, 0);

  while (current < end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayName = DAYS_OF_WEEK[current.getDay()];

    timetable
      .filter(t => t.day_of_week === dayName)
      .forEach(t => rowsToInsert.push([t.id, dateStr, 'present', 'backfill']));

    current.setDate(current.getDate() + 1);
  }

  if (rowsToInsert.length === 0) return 0;

  const [result] = await global.db.query(
    'INSERT IGNORE INTO attendance_logs (timetable_id, date, status, source) VALUES ?',
    [rowsToInsert]
  );
  return result.affectedRows;
}

// Set (or move) the academic start date and keep the backfilled attendance
// in sync with it.
//   - No start date set yet -> backfill startDate through today, as usual.
//   - New date earlier than the current one -> backfill just the new gap
//     (new date -> old date). Existing rows, manual or backfill, are never
//     touched, since INSERT IGNORE skips any date that already has a row.
//   - New date later than the current one -> delete only the auto-backfilled
//     rows that now fall before the new start date. Rows the student
//     corrected by hand (source='manual') are left alone on purpose.
router.post('/backfill', async (req, res) => {
  const { startDate } = req.body;
  const userId = req.user.id;
  if (!startDate) return res.status(400).json({ error: 'startDate required' });

  try {
    const [userRows] = await global.db.query(
      'SELECT academic_start_date, academic_end_date FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });

    const existingStartDate = userRows[0].academic_start_date
      ? String(userRows[0].academic_start_date).slice(0, 10)
      : null;
    const academicEndDate = userRows[0].academic_end_date
      ? String(userRows[0].academic_end_date).slice(0, 10)
      : null;

    const [timetable] = await global.db.query(
      `SELECT id, day_of_week FROM timetable
       WHERE user_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [userId, userId]
    );

    const todayDate = new Date();
    const todayStrValue = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
    const effectiveEndDate = academicEndDate && academicEndDate < todayStrValue
      ? academicEndDate
      : todayStrValue;
    const effectiveEndDateExclusive = new Date(`${effectiveEndDate}T12:00:00`);
    effectiveEndDateExclusive.setDate(effectiveEndDateExclusive.getDate() + 1);
    const effectiveEndDateExclusiveStr = [
      effectiveEndDateExclusive.getFullYear(),
      String(effectiveEndDateExclusive.getMonth() + 1).padStart(2, '0'),
      String(effectiveEndDateExclusive.getDate()).padStart(2, '0')
    ].join('-');

    let action = 'unchanged';
    let insertedCount = 0;
    let deletedCount = 0;
    let keptManualCount = 0;

    // If the semester already has an end date in the past, remove any stale
    // auto-backfilled rows beyond it before generating fresh ones.
    if (academicEndDate && academicEndDate < todayStrValue) {
      const [deleteFutureResult] = await global.db.query(
        `DELETE al FROM attendance_logs al
         JOIN timetable t ON al.timetable_id = t.id
         WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
           AND al.source = 'backfill' AND al.date > ?`,
        [userId, userId, academicEndDate]
      );
      deletedCount += deleteFutureResult.affectedRows;
    }

    // If start date moved later, prune auto-backfilled rows before the new start date
    if (existingStartDate && startDate > existingStartDate) {
      action = 'shrunk';

      const [deleteResult] = await global.db.query(
        `DELETE al FROM attendance_logs al
         JOIN timetable t ON al.timetable_id = t.id
         WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
           AND al.date >= ? AND al.date < ? AND al.source = 'backfill'`,
        [userId, userId, existingStartDate, startDate]
      );
      deletedCount = deleteResult.affectedRows;

      const [[{ cnt }]] = await global.db.query(
        `SELECT COUNT(*) as cnt FROM attendance_logs al
         JOIN timetable t ON al.timetable_id = t.id
         WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
           AND al.date >= ? AND al.date < ? AND al.source = 'manual'`,
        [userId, userId, existingStartDate, startDate]
      );
      keptManualCount = cnt;
    }

    // Backfill only through the earlier of today and academic_end_date.
    // (INSERT IGNORE safely skips existing records without modifying manual edits)
    insertedCount = await insertBackfillRows(
      timetable,
      startDate,
      effectiveEndDateExclusiveStr
    );
    action = !existingStartDate ? 'first_set' : startDate < existingStartDate ? 'extended' : startDate > existingStartDate ? 'shrunk' : 'synced';

    await global.db.query('UPDATE users SET academic_start_date = ? WHERE id = ?', [startDate, userId]);

    res.json({
      action,
      insertedCount,
      deletedCount,
      keptManualCount,
      newStartDate: startDate
    });
  } catch (err) {
    console.error('Error backfilling:', err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk mark an entire day's classes present/absent (from Calendar tab)
router.post('/day-bulk', async (req, res) => {
  const { date, status } = req.body;
  const userId = req.user.id;

  if (date > todayStr()) {
    return res.status(400).json({ error: 'Cannot mark attendance for a future date' });
  }

  try {
    const dayOfWeek = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const [entries] = await global.db.query(
      `SELECT id FROM timetable
       WHERE user_id = ? AND semester_number = (SELECT current_semester FROM users WHERE id = ?)
         AND day_of_week = ?`,
      [userId, userId, dayOfWeek]
    );
    if (entries.length === 0) return res.json({ message: 'No classes that day', count: 0 });

    const rows = entries.map(e => [e.id, date, status, 'manual']);
    await global.db.query(
      `INSERT INTO attendance_logs (timetable_id, date, status, source) VALUES ?
       ON DUPLICATE KEY UPDATE status = VALUES(status), source = VALUES(source)`,
      [rows]
    );
    res.json({ message: 'Day updated', count: rows.length });
  } catch (err) {
    console.error('Error bulk-marking day:', err);
    res.status(500).json({ error: err.message });
  }
});

// Wipe every attendance log for a user and reset their academic start
// date — subjects and timetable are left untouched. Resetting the start
// date matters: otherwise the Subjects tab would still show an old date
// with nothing behind it, and re-running backfill would silently no-op.
router.delete('/all/:userId', requireSelf, async (req, res) => {
  const userId = req.user.id;
  const connection = await global.db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `DELETE al FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
       WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [userId, userId]
    );

    await connection.query('UPDATE users SET academic_start_date = NULL WHERE id = ?', [userId]);

    await connection.commit();
    res.json({ message: 'All attendance logs deleted', deletedCount: result.affectedRows });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting all attendance:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Delete attendance logs dated on/after a given date. Anything before
// that date is left alone (used by Danger Zone's "delete from this date"
// option). academic_start_date isn't touched here since it's meaningless
// to reset for a partial wipe.
router.delete('/from/:userId/:date', requireSelf, async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await global.db.query(
      `DELETE al FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
       WHERE t.user_id = ? AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?) AND al.date >= ?`,
      [userId, userId, date]
    );

    res.json({ message: 'Attendance logs deleted', deletedCount: result.affectedRows });
  } catch (err) {
    console.error('Error deleting attendance from date:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
