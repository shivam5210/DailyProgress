import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// Post today's checkin
router.post('/', async (req, res) => {
  const userId = req.user.sub;
  const { date, mood, journal_note, logs } = req.body; // logs = [{ goal_id, value }]

  try {
    // 1. Create or Update Checkin
    const { data: checkin, error: checkinError } = await supabase
      .from('daily_checkins')
      .upsert({ user_id: userId, date, mood, journal_note }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (checkinError) throw checkinError;

    // 2. Insert goal logs
    const logInserts = logs.map(log => ({
      checkin_id: checkin.id,
      goal_id: log.goal_id,
      value: log.value
    }));

    const { error: logsError } = await supabase
      .from('goal_logs')
      .insert(logInserts);

    if (logsError) throw logsError;

    res.json({ message: 'Checkin saved successfully', checkin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical checkins
router.get('/', async (req, res) => {
  const userId = req.user.sub;
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select(`
        *,
        goal_logs (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
