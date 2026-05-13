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

    // 3. Build AI Prompt (GOD MODE)
    const prompt = `You are the CORE INTELLIGENCE of a high-performance Life OS.
Analyze the user's trajectory based on their goals and recent check-ins.

Goals:
${JSON.stringify(goals, null, 2)}

Check-ins (Last 7 Days):
${JSON.stringify(checkins || [], null, 2)}

TASK:
1. Update progress percentages (0-100) based on consistency and journal entries.
2. Calculate "Predictive Trajectory": When will they hit 100% at this rate?
3. Generate "Deep Analysis" in Markdown. It MUST include:
   - ## 🧠 Psychological Profile: Burnout risk, dopamine levels, and consistency analysis.
   - ## ⚡ Predictive Trajectory: Expected date of completion for each sector.
   - ## 🛠️ Actionable Interventions: 3 specific, high-impact tasks for the next 24 hours.
   - ## 👑 Mindset Shift: A powerful, short directive to maintain God Mode.

Tone: Professional, elite, data-driven, slightly futuristic. Use Hinglish where appropriate for relatability.

RETURN ONLY valid JSON:
{
  "goalUpdates": [
    { "goal_id": "uuid", "new_percentage": 85, "feedback": "Solid consistency in sector 1." }
  ],
  "deepAnalysis": "# Core Intelligence Report\n\n..."
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
            current_progress: progressNum
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
      deepAnalysis: aiResponse.deepAnalysis || "Great job! Consistency is the key to success. Keep tracking your progress daily.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('POST /analyze error:', error);
    next(error);
  }
});

// ====== OPTIMIZE GOALS ENDPOINT ======
router.post('/optimize-goals', async (req, res, next) => {
  try {
    const { problems } = req.body; // Raw text from user

    if (!problems || !problems.trim()) {
      return res.status(400).json({ error: 'No problems provided' });
    }

    const prompt = `
      The user has listed these problems:
      ${problems}

      As an expert life coach, transform these problems into 4-5 high-impact, actionable goals.
      For each goal:
      1. Provide a clear Title.
      2. Provide a short Strategy/Solution (Hinglish).
      3. Assign a Category (reduce, build, maintain, learn).

      Return ONLY a valid JSON object:
      {
        "optimizedGoals": [
          { "title": "...", "description": "...", "goal_type": "..." }
        ]
      }
    `;

    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const aiResponse = JSON.parse(jsonMatch[0]);
      res.json({ success: true, goals: aiResponse.optimizedGoals });
    } else {
      // Mocked response
      res.json({ 
        success: true, 
        goals: problems.split('\n').filter(Boolean).map(p => ({
          title: p.trim(),
          description: 'Start small and stay consistent.',
          goal_type: 'build'
        }))
      });
    }
  } catch (error) {
    console.error('Goal optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====== REAL-TIME AI CHAT ======
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?.sub;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Fetch context (goals)
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId);

    const prompt = `You are the CORE INTELLIGENCE of the user's Life OS. 
User Goals: ${JSON.stringify(goals)}
Chat History: ${JSON.stringify(history || [])}
User Message: "${message}"

TASK: Provide a high-impact, elite response. Be proactive. Make decisions for the user if they are indecisive. Help them optimize their time. Tone: Futuristic, professional, slightly demanding.`;

    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ success: true, response: response.text() });
    } else {
      res.json({ success: true, response: "Core Intelligence fallback: Keep pushing towards your goals!" });
    }
  } catch (error) {
    next(error);
  }
});

// ====== LIVE TIMETABLE GENERATION ======
router.get('/timetable', async (req, res, next) => {
  try {
    const userId = req.user?.sub;

    // Fetch goals and recent checkins for context
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId);

    const prompt = `Generate a high-performance daily timetable for a founder with these goals: ${JSON.stringify(goals)}.
Format the output as a valid JSON array of objects with "time" and "task" keys.
Example: [{"time": "06:00", "task": "Strategic Planning"}]
RETURN ONLY VALID JSON.`;

    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const timetable = JSON.parse(jsonMatch[0]);
      res.json({ success: true, timetable });
    } else {
      res.json({ success: true, timetable: [{time: "08:00", task: "Default Routine"}] });
    }
  } catch (error) {
    next(error);
  }
});

export default router;