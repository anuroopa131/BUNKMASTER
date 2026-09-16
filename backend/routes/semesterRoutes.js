const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

const todayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Longest run of consecutive calendar days where all scheduled classes were attended
function longestPerfectStreak(rows) {
  let longest = 0;
  let current = 0;
  let prevDate = null;

  for (const row of rows) {
    const isPerfectDay = row.total_count > 0 && row.present_count === row.total_count;
    const [y, m, d] = row.date.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);

    const isConsecutive = prevDate && Math.round((date - prevDate) / (1000 * 60 * 60 * 24)) === 1;

    if (isPerfectDay && (current === 0 || isConsecutive)) {
      current += 1;
    } else if (isPerfectDay) {
      current = 1;
    } else {
      current = 0;
    }

    longest = Math.max(longest, current);
    prevDate = isPerfectDay ? date : null;
  }

  return longest;
}

// Terminate and archive the active semester, compute rich trends & achievements,
// and reset the user's active workspace for a fresh beginning.
router.post('/end', async (req, res) => {
  const { endDate: providedEndDate } = req.body;
  const userId = req.user.id;

  const endDate = providedEndDate || todayStr();
  if (endDate > todayStr()) {
    return res.status(400).json({ error: 'endDate cannot be in the future' });
  }

  try {
    const [userRows] = await global.db.query(
      'SELECT current_semester, target_percentage, academic_start_date, academic_end_date, semester_name FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });

    const semesterNumber = userRows[0].current_semester;
    const threshold = userRows[0].target_percentage ?? 75;
    const semesterName = userRows[0].semester_name || 'Semester 1';
    let startDate = userRows[0].academic_start_date
      ? String(userRows[0].academic_start_date).slice(0, 10)
      : null;

    if (!startDate) {
      const [[earliest]] = await global.db.query(
        `SELECT MIN(al.date) as earliest FROM attendance_logs al
         JOIN timetable t ON al.timetable_id = t.id
         WHERE t.user_id = ? AND t.semester_number = ?`,
        [userId, semesterNumber]
      );
      if (!earliest || !earliest.earliest) {
        return res.status(400).json({ error: 'No attendance data to archive yet' });
      }
      startDate = String(earliest.earliest).slice(0, 10);
    }

    if (startDate > endDate) {
      return res.status(400).json({ error: 'endDate must be on or after the start date' });
    }

    // 1. Overall attendance numbers
    const [[overall]] = await global.db.query(
      `SELECT COUNT(al.id) as total_classes,
        SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END) as present_count
       FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
      WHERE t.user_id = ? AND t.semester_number = ? AND al.date BETWEEN ? AND ?`,
          [userId, semesterNumber, startDate, endDate]
    );
    const totalClasses = overall?.total_classes || 0;
    const presentCount = overall?.present_count || 0;
    const bunkedCount = Math.max(0, totalClasses - presentCount);
    const overallPercentage = totalClasses > 0
      ? Math.round((1000 * presentCount / totalClasses)) / 10
      : 0;

    // 2. Subject-wise performance
    const [subjectStats] = await global.db.query(
      `SELECT s.subject_name,
        COUNT(al.id) as total_classes,
        COALESCE(SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END), 0) as present_count
       FROM subjects s
       JOIN timetable t ON s.id = t.subject_id
       JOIN attendance_logs al ON t.id = al.timetable_id
       WHERE s.user_id = ? AND s.semester_number = ?
         AND t.semester_number = ? AND al.date BETWEEN ? AND ?
       GROUP BY s.id, s.subject_name
       HAVING total_classes > 0`,
      [userId, semesterNumber, semesterNumber, startDate, endDate]
    );

    const subjectsWithPct = subjectStats.map(s => {
      const pct = Math.round((1000 * s.present_count / s.total_classes)) / 10;
      const skipped = s.total_classes - s.present_count;
      return {
        subject_name: s.subject_name,
        total_classes: s.total_classes,
        present_count: s.present_count,
        skipped_count: skipped,
        pct
      };
    });

    // Favorite subject: highest attendance % (and highest attendance count as tie-breaker)
    const favoriteSubject = subjectsWithPct.length > 0
      ? subjectsWithPct.reduce((a, b) => (b.pct > a.pct || (b.pct === a.pct && b.present_count > a.present_count) ? b : a))
      : null;

    // Nemesis subject: lowest attendance % (and most skipped classes)
    const nemesisSubject = subjectsWithPct.length > 0
      ? subjectsWithPct.reduce((a, b) => (b.pct < a.pct || (b.pct === a.pct && b.skipped_count > a.skipped_count) ? b : a))
      : null;

    // Flawless subjects (100% attendance)
    const flawlessSubjects = subjectsWithPct.filter(s => s.pct === 100);

    // 3. Daily streaks
    const [dailyRows] = await global.db.query(
      `SELECT DATE_FORMAT(al.date, '%Y-%m-%d') as date,
        SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END) as present_count,
        COUNT(al.id) as total_count
       FROM attendance_logs al
       JOIN timetable t ON al.timetable_id = t.id
      WHERE t.user_id = ? AND t.semester_number = ? AND al.date BETWEEN ? AND ?
       GROUP BY al.date
       ORDER BY al.date ASC`,
          [userId, semesterNumber, startDate, endDate]
    );
    const longestStreak = longestPerfectStreak(dailyRows);

    // 4. Achievement Badges
    const achievements = [];
    if (overallPercentage >= 90) {
      achievements.push({
        id: 'ninja',
        emoji: '🥷',
        title: 'Attendance Ninja',
        badge: 'Elite Tier',
        desc: `Maintained a legendary ${overallPercentage}% attendance rate across the entire semester!`,
        color: '#1F9E82'
      });
    } else if (overallPercentage >= threshold) {
      achievements.push({
        id: 'edge',
        emoji: '🧗',
        title: 'Calculated Strategist',
        badge: 'Safe & Sound',
        desc: `Stayed safely above your ${threshold}% goal while making the most of your college life!`,
        color: '#3A7BD5'
      });
    } else {
      achievements.push({
        id: 'rebel',
        emoji: '🛌',
        title: 'Master Bunker',
        badge: 'Danger Zone',
        desc: `Lived life on the edge (${overallPercentage}%). Ready for a grand comeback next sem!`,
        color: '#E8574A'
      });
    }

    if (longestStreak >= 3) {
      achievements.push({
        id: 'iron_streak',
        emoji: '🔥',
        title: `${longestStreak}-Day Iron Streak`,
        badge: 'Consistency',
        desc: `Attended every single class without a single absence for ${longestStreak} straight class days.`,
        color: '#F59E0B'
      });
    }

    if (flawlessSubjects.length > 0) {
      achievements.push({
        id: 'flawless',
        emoji: '🏆',
        title: 'Flawless Victory',
        badge: '100% Attended',
        desc: `Perfect 100% attendance in ${flawlessSubjects.map(s => s.subject_name).join(', ')}!`,
        color: '#8B5CF6'
      });
    }

    if (bunkedCount > 0) {
      achievements.push({
        id: 'bunk_economy',
        emoji: '💰',
        title: 'Bunk Economy',
        badge: `${bunkedCount} Bunks`,
        desc: `Carefully claimed ${bunkedCount} classes off throughout the term.`,
        color: '#EC4899'
      });
    }

    const summary = {
      semester_name: semesterName,
      start_date: startDate,
      end_date: endDate,
      overall_percentage: overallPercentage,
      present_count: presentCount,
      bunked_count: bunkedCount,
      total_classes: totalClasses,
      longest_streak: longestStreak,
      favorite_subject: favoriteSubject,
      nemesis_subject: nemesisSubject,
      flawless_subjects: flawlessSubjects,
      achievements,
      subjects: subjectsWithPct,
      archived_at: new Date().toISOString()
    };

    // 5. Insert Archive Record
    const [archiveResult] = await global.db.query(
      `INSERT INTO semester_archives (user_id, semester_name, start_date, end_date, threshold, summary_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, semesterName, startDate, endDate, threshold, JSON.stringify(summary)]
    );

    await global.db.query(
      `UPDATE users
       SET current_semester = current_semester + 1,
           academic_start_date = NULL,
           academic_end_date = NULL,
           semester_name = NULL
       WHERE id = ?`,
      [userId]
    );

    res.status(201).json({
      message: 'Semester ended and archived successfully',
      archiveId: archiveResult.insertId,
      summary
    });
  } catch (err) {
    console.error('Error ending semester:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get the latest archived semester recap for a user
router.get('/latest/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await global.db.query(
      `SELECT id, semester_name, start_date, end_date, threshold, summary_json, created_at
       FROM semester_archives
       WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json(null);
    }

    const r = rows[0];
    res.json({
      id: r.id,
      semester_name: r.semester_name || 'Previous Semester',
      start_date: String(r.start_date).slice(0, 10),
      end_date: String(r.end_date).slice(0, 10),
      threshold: r.threshold,
      created_at: r.created_at,
      summary: typeof r.summary_json === 'string' ? JSON.parse(r.summary_json) : r.summary_json,
    });
  } catch (err) {
    console.error('Error fetching latest semester recap:', err);
    res.status(500).json({ error: err.message });
  }
});

// Past archived semesters, most recent first
router.get('/history/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await global.db.query(
      `SELECT id, semester_name, start_date, end_date, threshold, summary_json, created_at
       FROM semester_archives
       WHERE user_id = ?
      ORDER BY created_at DESC, id DESC`,
      [userId]
    );

    const history = rows.map(r => ({
      id: r.id,
      semester_name: r.semester_name || 'Previous Semester',
      start_date: String(r.start_date).slice(0, 10),
      end_date: String(r.end_date).slice(0, 10),
      threshold: r.threshold,
      created_at: r.created_at,
      summary: typeof r.summary_json === 'string' ? JSON.parse(r.summary_json) : r.summary_json,
    }));

    res.json(history);
  } catch (err) {
    console.error('Error fetching semester history:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
