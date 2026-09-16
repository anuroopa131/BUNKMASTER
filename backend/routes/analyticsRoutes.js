const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

// Given current present/total counts and a target percentage (0-100),
// returns how many more classes must be attended (in a row) to reach
// the target, or how many can safely be missed while staying above it.
function calculateWarning(presentCount, totalCount, thresholdPct) {
  // No classes marked yet — don't fake a percentage or a warning
  if (totalCount === 0) {
    return { status: 'new', classes_can_skip: 0, classes_needed: 0 };
  }

  const currentPct = (100 * presentCount) / totalCount;
  const target = thresholdPct / 100;

  if (currentPct >= thresholdPct) {
    const skippable = target > 0
      ? Math.floor(presentCount / target) - totalCount
      : 0;
    return {
      status: skippable <= 0 ? 'warning' : 'safe',
      classes_can_skip: Math.max(0, skippable),
      classes_needed: 0
    };
  }

  const needed = target < 1
    ? Math.ceil((target * totalCount - presentCount) / (1 - target))
    : Infinity;
  return {
    status: currentPct < thresholdPct - 10 ? 'critical' : 'warning',
    classes_can_skip: 0,
    classes_needed: Math.max(0, needed)
  };
}


// Get complete analytics for user
router.get('/:userId', requireSelf, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userData] = await global.db.query(
      'SELECT target_percentage, academic_start_date, academic_end_date, semester_name FROM users WHERE id = ?',
      [userId]
    );

    if (userData.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const threshold = userData[0].target_percentage ?? 75;
    const academicStartDate = userData[0].academic_start_date ? String(userData[0].academic_start_date).slice(0, 10) : null;
    const academicEndDate = userData[0].academic_end_date ? String(userData[0].academic_end_date).slice(0, 10) : null;
    const semesterName = userData[0].semester_name || 'Semester 1';

    // Overall stats
    const [overallStats] = await global.db.query(
      `SELECT 
        COUNT(DISTINCT al.date) as total_days,
        COUNT(al.id) as total_classes,
        SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance_logs al
      JOIN timetable t ON al.timetable_id = t.id
      WHERE t.user_id = ?
        AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)`,
      [userId, userId]
    );

    const overall = overallStats[0] || { total_days: 0, total_classes: 0, present_count: 0 };
    const overallWarning = calculateWarning(overall.present_count || 0, overall.total_classes || 0, threshold);

    // Subject-wise stats
    const [subjectStats] = await global.db.query(
      `SELECT 
        s.subject_name,
        COUNT(al.id) as total_classes,
        COALESCE(SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END), 0) as present_count
      FROM subjects s
      LEFT JOIN timetable t ON s.id = t.subject_id
      LEFT JOIN attendance_logs al ON t.id = al.timetable_id
      WHERE s.user_id = ?
        AND s.semester_number = (SELECT current_semester FROM users WHERE id = ?)
      GROUP BY s.id, s.subject_name
      ORDER BY s.subject_name`,
      [userId, userId]
    );

    const subjectsWithWarnings = subjectStats.map(subject => ({
      ...subject,
      attendance_percentage: subject.total_classes > 0
        ? Math.round((1000 * subject.present_count / subject.total_classes)) / 10
        : 0,
      ...calculateWarning(subject.present_count || 0, subject.total_classes || 0, threshold)
    }));

    const warnings = subjectsWithWarnings.filter(
      s => s.status === 'critical' || s.status === 'warning'
    );

    // Daily stats for charts (last 30 days)
    const [dailyStats] = await global.db.query(
      `SELECT 
        DATE_FORMAT(al.date, '%Y-%m-%d') as date,
        DAYNAME(al.date) as day_name,
        COUNT(al.id) as total_classes,
        SUM(CASE WHEN al.status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance_logs al
      JOIN timetable t ON al.timetable_id = t.id
      WHERE t.user_id = ?
        AND t.semester_number = (SELECT current_semester FROM users WHERE id = ?)
      GROUP BY al.date
      ORDER BY al.date DESC
      LIMIT 30`,
      [userId, userId]
    );

    res.json({
      threshold,
      academic_start_date: academicStartDate,
      academic_end_date: academicEndDate,
      semester_name: semesterName,
      overall: {
        ...overall,
        attendance_percentage: overall.total_classes > 0
          ? Math.round((1000 * overall.present_count / overall.total_classes)) / 10
          : 0,
        ...overallWarning
      },
      subjects: subjectsWithWarnings,
      warnings,
      daily: dailyStats
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
