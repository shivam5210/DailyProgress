import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// ====== POST TODAY'S CHECK-IN ======
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { date, mood, journal_note, logs } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    if (!date) {
      return res.status(400).json({ 
        error: 'Date is required',
        code: 'MISSING_DATE'
      });
    }

    if (!Array.isArray(logs)) {
      return res.status(400).json({ 
        error: 'Logs must be an array',
        code: 'INVALID_LOGS'
      });
    }

    if (mood && (mood < 1 || mood > 5)) {
      return res.status(400).json({ 
        error: 'Mood must be between 1 and 5',
        code: 'INVALID_MOOD'
      });
    }

    // Validate and sanitize logs
    const validatedLogs = logs.map(log => {
      const value = Number(log.value);
      if (isNaN(value) || value < 0 || value > 100) {
        throw new Error(`Log value must be between 0 and 100, got ${log.value}`);
      }
      return {
        goal_id: log.goal_id,
        value
      };
    });

    // 1. Create or Update Checkin
    const { data: checkin, error: checkinError } = await supabase
      .from('daily_checkins')
      .upsert(
        { 
          user_id: userId, 
          date, 
          mood: mood || 3,
          journal_note: journal_note?.trim() || '',
          updated_at: new Date().toISOString()
        }, 
        { onConflict: ['user_id', 'date'] }
      )
      .select()
      .single();

    if (checkinError) {
      throw new Error(`Failed to create checkin: ${checkinError.message}`);
    }

    // 2. Delete old logs for this checkin
    await supabase
      .from('goal_logs')
      .delete()
      .eq('checkin_id', checkin.id);

    // 3. Insert new goal logs
    if (validatedLogs.length > 0) {
      const logInserts = validatedLogs.map(log => ({
        checkin_id: checkin.id,
        goal_id: log.goal_id,
        value: log.value,
        created_at: new Date().toISOString()
      }));

      const { error: logsError } = await supabase
        .from('goal_logs')
        .insert(logInserts);

      if (logsError) {
        throw new Error(`Failed to insert logs: ${logsError.message}`);
      }
    }

    res.status(201).json({
      success: true,
      data: checkin,
      message: 'Check-in saved successfully',
      logsCount: validatedLogs.length
    });
  } catch (error) {
    console.error('POST /checkins error:', error);
    next(error);
  }
});

// ====== GET HISTORICAL CHECK-INS ======
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { limit = '30', offset = '0' } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const offsetNum = Math.max(Number(offset), 0);

    const { data, error, count } = await supabase
      .from('daily_checkins')
      .select('*, goal_logs(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    if (error) {
      throw new Error(`Failed to fetch checkins: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('GET /checkins error:', error);
    next(error);
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
      .from('daily_checkins')
      .select('*, goal_logs(*)')
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