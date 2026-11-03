import { z } from 'zod';
import { understandCommand } from '../services/aiService.js';
import { executeIntent } from '../services/actionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const bodySchema = z.object({ transcript: z.string().trim().min(2).max(1000) });
export const processVoiceCommand = asyncHandler(async (req, res) => {
  const { transcript } = bodySchema.parse(req.body);
  const parsed = await understandCommand(transcript);
  const outcome = await executeIntent(parsed);
  res.json({ success: true, transcript, intent: parsed.intent, action: outcome.action || null, needsClarification: !!outcome.needsClarification, message: outcome.message || parsed.response, result: outcome.result ?? null, source: parsed.intent === 'CAMPUS_INFO' ? 'MOCK_LOCAL_DATA' : 'LIVE_DATABASE' });
});
