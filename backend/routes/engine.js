import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { supabase } from '../db/supabase.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-dummy12345' });
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy12345');

router.post('/analyze', async (req, res) => {
  const userId = req.user.sub;
  const userEmail = req.user.email; // assuming email is in jwt or we fetch it

  try {
    // 1. Fetch user goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
    if (goalsError) throw goalsError;

    // 2. Fetch last 7 days checkins
    const { data: checkins, error: checkinError } = await supabase
      .from('checkins')
      .select('date, logs')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7);

    if (checkinError) throw checkinError;

    // 3. Build Prompt for AI
    const prompt = `
      You are an AI life coach analyzing a user's progress.
      Goals: ${JSON.stringify(goals)}
      Last 7 days data: ${JSON.stringify(checkins)}
      
      For each goal, calculate the current progress percentage (0-100).
      If they have completely conquered the problem or reached the target, output 100.
      Provide a 1-sentence Hinglish feedback for each goal based on recent trajectory.
      Return ONLY valid JSON:
      {
        "goalUpdates": [
          { "goal_id": "uuid", "new_percentage": 85, "feedback": "Kaafi improvement hai, aise hi karte raho!" }
        ]
      }
    `;

    // 4. Call AI (mocked or real depending on API Key)
    // For now we will mock the AI response if no key, else use real
    let aiResponse;
    if (process.env.ANTHROPIC_API_KEY) {
      const msg = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      });
      aiResponse = JSON.parse(msg.content[0].text);
    } else {
      // Mocked AI Logic for Demo
      aiResponse = {
        goalUpdates: goals.map(g => ({
          goal_id: g.id,
          new_percentage: Math.min((g.current_progress || 0) + 10, 100),
          feedback: "Great job today, keeping it steady!"
        }))
      };
    }

    // 5. Update Goals in DB & check for 100% completion
    const updatePromises = aiResponse.goalUpdates.map(async (update) => {
      // Update the goal progress
      await supabase
        .from('goals')
        .update({ current_progress: update.new_percentage })
        .eq('id', update.goal_id);

      // Check for 100% trigger
      const goal = goals.find(g => g.id === update.goal_id);
      if (update.new_percentage === 100 && goal.current_progress !== 100) {
        // Send email
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'tracker@yourdomain.com',
            to: userEmail || 'test@example.com',
            subject: `Goal Completed: ${goal.title} 🚀`,
            html: `<div style="background-color: #04040A; color: #BCFF47; padding: 40px; text-align: center;">
                    <h1>🎉 Boom! 100% Achieved</h1>
                    <p>The AI noticed you've completely conquered your goal: <strong>${goal.title}</strong>.</p>
                    <p>Keep the momentum going.</p>
                  </div>`
          });
        }
      }
    });

    await Promise.all(updatePromises);

    res.json({ message: "Analysis complete", updates: aiResponse.goalUpdates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
