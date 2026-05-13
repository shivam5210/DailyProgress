import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

router.post('/sync', async (req, res) => {
  const { id, email, full_name, avatar_url } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id, email, full_name, avatar_url }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (error) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
