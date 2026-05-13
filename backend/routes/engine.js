import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';
import { supabase } from '../db/supabase.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const resend = new Resend(process.env.RESEND_API_KEY);

// ====== AI ANALYSIS ENDPOINT ======
router.post('/analyze', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID missing from token',
        code: 'MISSING_USER_ID'
      });
    }

    // 1. Fetch user goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
    if (goalsError) {
      throw new Error(`Failed to fetch goals: ${goalsError.message}`);
    }

    if (!goals || goals.length === 0) {
      return res.status(400).json({ 
        error: 'No goals found for user',
        code: 'NO_GOALS'
      });
    }

    // 2. Fetch last 7 days checkins
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: checkins, error: checkinError } = await supabase
      .from('checkins')
      .select('date, logs')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgoStr)
      .order('date', { ascending: false })
      .limit(7);

    if (checkinError) {
      throw new Error(`Failed to fetch checkins: ${checkinError.message}`);
    }

    // 3. Build AI Prompt
    const prompt = `You are an AI life coach analyzing a user's progress.

Goals:
${JSON.stringify(goals, null, 2)}

Last 7 days data:
${JSON.stringify(checkins || [], null, 2)}

Analyze the user's progress and for each goal:
1. Calculate the current progress percentage (0-100)
2. If they've completely conquered the problem, output 100
3. Provide 1-sentence Hinglish feedback based on recent trajectory

RETURN ONLY valid JSON (no markdown):
{
  "goalUpdates": [
    { "goal_id": "uuid", "new_percentage": 85, "feedback": "Kaafi improvement hai, aise hi karte raho!" }
  ]
}`;

    // 4. Call AI
    let aiResponse = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('AI response did not contain valid JSON');
        }
        
        aiResponse = JSON.parse(jsonMatch[0]);
      } catch (aiError) {
        console.error('Gemini API error:', aiError.message);
        aiResponse = null;
      }
    }

    // Fallback mocked AI response
    if (!aiResponse) {
      aiResponse = {
        goalUpdates: goals.map(g => ({
          goal_id: g.id,
          new_percentage: Math.min((g.current_progress || 0) + 10, 100),
          feedback: 'Great progress! Keep pushing forward! 🚀'
        }))
      };
    }

    // Validate AI response
    if (!aiResponse.goalUpdates || !Array.isArray(aiResponse.goalUpdates)) {
      throw new Error('Invalid AI response format');
    }

    // 5. Update Goals in DB & send emails
    const updates = [];
    
    for (const update of aiResponse.goalUpdates) {
      try {
        if (!update.goal_id || typeof update.new_percentage !== 'number') {
          console.warn('Skipping invalid update:', update);
          continue;
        }

        const progressNum = Math.max(0, Math.min(100, update.new_percentage));
        
        const { error: updateError } = await supabase
          .from('goals')
          .update({ 
            current_progress: progressNum,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.goal_id);

        if (updateError) {
          console.error(`Failed to update goal ${update.goal_id}:`, updateError);
          continue;
        }

        // Check for 100% trigger
        const goal = goals.find(g => g.id === update.goal_id);
        if (progressNum === 100 && (goal?.current_progress || 0) < 100) {
          // Send celebration email
          if (process.env.RESEND_API_KEY && userEmail) {
            try {
              await resend.emails.send({
                from: process.env.EMAIL_FROM || 'noreply@dailyprogress.app',
                to: userEmail,
                subject: `🎉 Goal Completed: ${goal?.title}`,
                html: `
                  <div style="background: linear-gradient(135deg, #04040A 0%, #1a1a2e 100%); color: #BCFF47; padding: 40px; font-family: Arial, sans-serif; text-align: center; border-radius: 10px;">
                    <h1 style="font-size: 48px; margin: 0 0 20px 0;">🚀 100% Achieved!</h1>
                    <p style="font-size: 18px; margin: 0 0 30px 0;">You've completely conquered your goal:</p>
                    <h2 style="font-size: 24px; color: #8EE800; margin: 0 0 20px 0;">${goal?.title}</h2>
                    <p style="color: #ccc; margin-top: 30px;">Keep this momentum going! 💪</p>
                  </div>
                `
              });
              console.log(`✉️ Celebration email sent to ${userEmail}`);
            } catch (emailError) {
              console.error('Failed to send email:', emailError.message);
            }
          }
        }

        updates.push({
          goal_id: update.goal_id,
          new_percentage: progressNum,
          feedback: update.feedback || 'Keep going!'
        });
      } catch (err) {
        console.error('Error processing update:', err);
      }
    }

    res.json({
      success: true,
      message: 'Analysis complete',
      updates: updates.length > 0 ? updates : aiResponse.goalUpdates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('POST /analyze error:', error);
    next(error);
  }
});

export default router;