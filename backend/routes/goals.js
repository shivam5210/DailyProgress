import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// ====== GET ACTIVE GOALS ======
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('GET /goals error:', error);
    next(error);
  }
});

// ====== CREATE NEW GOAL ======
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { title, description, goal_type } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ 
        error: 'Goal title is required',
        code: 'MISSING_TITLE'
      });
    }

    if (title.length > 500) {
      return res.status(400).json({ 
        error: 'Goal title must be less than 500 characters',
        code: 'TITLE_TOO_LONG'
      });
    }

    const validGoalTypes = ['reduce', 'build', 'maintain', 'learn'];
    const normalizedGoalType = goal_type || 'build';
    
    if (!validGoalTypes.includes(normalizedGoalType)) {
      return res.status(400).json({ 
        error: `Invalid goal type. Must be one of: ${validGoalTypes.join(', ')}`,
        code: 'INVALID_GOAL_TYPE'
      });
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || '',
        goal_type: normalizedGoalType,
        current_progress: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Goal created successfully'
    });
  } catch (error) {
    console.error("Goal creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====== UPDATE GOAL ======
router.put('/:goalId', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { goalId } = req.params;
    const { title, description, current_progress } = req.body;

    if (!userId || !goalId) {
      return res.status(400).json({ 
        error: 'Missing user ID or goal ID',
        code: 'MISSING_IDS'
      });
    }

    // Validate ownership
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', goalId)
      .single();

    if (fetchError || !existingGoal || existingGoal.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Unauthorized to update this goal',
        code: 'UNAUTHORIZED'
      });
    }

    // Validate progress
    if (current_progress !== undefined) {
      const progress = Number(current_progress);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ 
          error: 'Progress must be a number between 0 and 100',
          code: 'INVALID_PROGRESS'
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (current_progress !== undefined) updateData.current_progress = Number(current_progress);
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }

    res.json({
      success: true,
      data,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('PUT /goals/:goalId error:', error);
    next(error);
  }
});

// ====== DELETE GOAL ======
router.delete('/:goalId', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { goalId } = req.params;

    if (!userId || !goalId) {
      return res.status(400).json({ 
        error: 'Missing user ID or goal ID',
        code: 'MISSING_IDS'
      });
    }

    // Validate ownership
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', goalId)
      .single();

    if (fetchError || !existingGoal || existingGoal.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Unauthorized to delete this goal',
        code: 'UNAUTHORIZED'
      });
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /goals/:goalId error:', error);
    next(error);
  }
});

export default router;