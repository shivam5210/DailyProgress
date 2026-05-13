import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// ====== POST TODAY'S CHECK-IN ======
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { date, mood, journal_note, logs } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID missing' });
    }

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

    if (checkinError) {
      throw new Error(`Failed to create checkin: ${checkinError.message}`);
    }

    res.json({ success: true, message: 'Checkin saved successfully', data: checkin });
  } catch (error) {
    console.error("Checkin error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====== GET HISTORICAL CHECK-INS ======
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const limit = parseInt(req.query.limit) || 30;
    const offset = parseInt(req.query.offset) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'User ID missing' });
    }

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch checkins: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset
      }
    });
  } catch (error) {
    console.error("Fetch checkins error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====== GET CHECK-IN BY DATE ======
router.get('/:date', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { date } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch checkin: ${error.message}`);
    }

    if (!data) {
      return res.status(404).json({ 
        error: 'Check-in not found for this date',
        code: 'NOT_FOUND',
        date
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('GET /checkins/:date error:', error);
    next(error);
  }
});

export default router;