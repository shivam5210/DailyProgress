import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// Post today's checkin
router.post('/', async (req, res) => {
  const userId = req.user.sub;
  const { date, mood, journal_note, logs } = req.body; // logs = [{ goal_id, value }]

  try {
    // 1. Create or Update Checkin using the simplified schema
    const { data: checkin, error: checkinError } = await supabase
      .from('checkins')
      .upsert({ 
        user_id: userId, 
        date, 
        mood, 
        journal_note, 
        logs: JSON.stringify(logs) // Store as JSON string for the JSONB column
      }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (checkinError) throw checkinError;

    res.json({ message: 'Checkin saved successfully', checkin });
  } catch (error) {
    console.error("Checkin error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get historical checkins
router.get('/', async (req, res) => {
  const userId = req.user.sub;
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Fetch checkins error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
