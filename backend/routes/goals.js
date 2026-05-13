import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// Get active goals for user
router.get('/', async (req, res) => {
  const userId = req.user.sub; // From JWT
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new goal manually
router.post('/', async (req, res) => {
  const userId = req.user.sub;
  const { title, description, goal_type } = req.body;
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert([{ user_id: userId, title, description, goal_type }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error("Goal creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
