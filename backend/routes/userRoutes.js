const express = require('express');
const router = express.Router();
const { requireSelf } = require('../middleware/auth');

// Update a user's attendance target percentage.
// Used by the Bunk calculator tab so students at colleges with a
// different cutoff (e.g. 65% or 80% instead of the 75% default) can
// set their own — analyticsRoutes.js already reads this column with
// a `?? 75` fallback, so this is the only piece that was missing.
router.put('/:userId/threshold', requireSelf, async (req, res) => {
  const userId = req.user.id;
  const { target_percentage } = req.body;

  const pct = Number(target_percentage);
  if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
    return res.status(400).json({ error: 'target_percentage must be a number between 1 and 100' });
  }

  try {
    const [result] = await global.db.query(
      'UPDATE users SET target_percentage = ? WHERE id = ?',
      [pct, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Threshold updated', target_percentage: pct });
  } catch (err) {
    console.error('Error updating threshold:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a user's semester info (name, start date, end date, target percentage)
router.put('/:userId/semester', requireSelf, async (req, res) => {
  const userId = req.user.id;
  const { semester_name, academic_start_date, academic_end_date, target_percentage } = req.body;

  try {
    const fields = [];
    const params = [];

    if (semester_name !== undefined) {
      fields.push('semester_name = ?');
      params.push(semester_name || null);
    }
    if (academic_start_date !== undefined) {
      fields.push('academic_start_date = ?');
      params.push(academic_start_date || null);
    }
    if (academic_end_date !== undefined) {
      fields.push('academic_end_date = ?');
      params.push(academic_end_date || null);
    }
    if (target_percentage !== undefined) {
      fields.push('target_percentage = ?');
      params.push(Number(target_percentage));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(userId);
    await global.db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Semester settings updated' });
  } catch (err) {
    console.error('Error updating semester settings:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
