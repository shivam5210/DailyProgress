import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// ====== SYNC USER ======
router.post('/sync', async (req, res, next) => {
  try {
    const { id, email, full_name, avatar_url } = req.body;

    // Validation
    if (!id) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_ID'
      });
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ 
        error: 'Valid email is required',
        code: 'INVALID_EMAIL'
      });
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(
        { 
          id, 
          email, 
          full_name: full_name || '',
          avatar_url: avatar_url || '',
          updated_at: new Date().toISOString()
        }, 
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to sync user: ${error.message}`);
    }

    res.json({
      success: true,
      user: data,
      message: 'User synced successfully'
    });
  } catch (error) {
    console.error('POST /auth/sync error:', error);
    next(error);
  }
});

export default router;