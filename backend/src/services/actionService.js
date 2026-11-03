import { z } from 'zod';
import Expense from '../models/Expense.js';
import Task from '../models/Task.js';
import Reminder from '../models/Reminder.js';
import { campusData } from './campusData.js';

const expenseInput = z.object({ amount: z.number().positive().max(10000000), category: z.string().trim().min(1).max(40).default('Other'), description: z.string().trim().min(1).max(160), date: z.coerce.date().optional() });
const taskInput = z.object({ title: z.string().trim().min(1).max(140), description: z.string().max(500).optional(), dueDate: z.coerce.date().optional().nullable(), priority: z.enum(['low','medium','high']).default('medium') });
const reminderInput = z.object({ title: z.string().trim().min(1).max(160), reminderDate: z.coerce.date() });

export async function createExpense(input) {
  const data = expenseInput.parse(input);
  const doc = await Expense.create(data);
  return { message: `Saved ₹${doc.amount} for ${doc.description}.`, data: doc };
}
export async function listExpenses(limit = 20) { return Expense.find().sort({ date: -1 }).limit(Math.min(Number(limit) || 20, 100)).lean(); }
export async function expenseSummary() {
  const now = new Date(); const start = new Date(now); const day = (start.getDay() + 6) % 7; start.setDate(start.getDate() - day); start.setHours(0,0,0,0);
  const [total, count, categories] = await Promise.all([
    Expense.aggregate([{ $match: { date: { $gte: start, $lte: now } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.countDocuments({ date: { $gte: start, $lte: now } }),
    Expense.aggregate([{ $match: { date: { $gte: start, $lte: now } } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }])
  ]);
  return { weekStart: start, total: total[0]?.total || 0, count, categories };
}
export async function createTask(input) { const doc = await Task.create(taskInput.parse(input)); return { message: `Task created: ${doc.title}.`, data: doc }; }
export async function listTasks(status) { const filter = status && ['pending','completed'].includes(status) ? { status } : {}; return Task.find(filter).sort({ dueDate: 1, createdAt: -1 }).limit(100).lean(); }
export async function completeTask(id) { const doc = await Task.findByIdAndUpdate(id, { status: 'completed' }, { new: true, runValidators: true }); if (!doc) { const e = new Error('Task not found.'); e.status = 404; throw e; } return doc; }
export async function createReminder(input) { const doc = await Reminder.create(reminderInput.parse(input)); return { message: `Reminder set for ${doc.title}.`, data: doc }; }
export async function listReminders() { return Reminder.find({ completed: false, reminderDate: { $gte: new Date(Date.now() - 86400000) } }).sort({ reminderDate: 1 }).limit(100).lean(); }

export async function executeIntent(parsed) {
  const p = parsed.parameters || {};
  // Explicit allow-list: model output can select a service, never a query or executable operation.
  switch (parsed.intent) {
    case 'CREATE_EXPENSE': {
      if (p.amount == null || !p.description) return { needsClarification: true, message: 'Please tell me the expense amount and what it was for.' };
      const result = await createExpense({ amount: p.amount, category: p.category || 'Other', description: p.description, ...(p.date ? { date: p.date } : {}) });
      return { action: parsed.intent, result: result.data, message: result.message };
    }
    case 'CREATE_TASK': {
      if (!p.title) return { needsClarification: true, message: 'What should I name the task?' };
      const result = await createTask({ title: p.title, dueDate: p.dueDate || null, priority: p.priority || 'medium' });
      return { action: parsed.intent, result: result.data, message: result.message };
    }
    case 'CREATE_REMINDER': {
      if (!p.title || !p.dueDate) return { needsClarification: true, message: 'Please tell me what to remind you about and when.' };
      const result = await createReminder({ title: p.title, reminderDate: p.dueDate });
      return { action: parsed.intent, result: result.data, message: result.message };
    }
    case 'LIST_TASKS': { const data = await listTasks(p.status || 'pending'); return { action: parsed.intent, result: data, message: data.length ? `You have ${data.length} ${p.status || 'pending'} tasks.` : `You have no ${p.status || 'pending'} tasks.` }; }
    case 'LIST_EXPENSES': { const data = await listExpenses(10); return { action: parsed.intent, result: data, message: `I found ${data.length} recent expenses.` }; }
    case 'GET_EXPENSE_SUMMARY': { const data = await expenseSummary(); return { action: parsed.intent, result: data, message: `You spent ${Math.round(data.total)} rupees this week across ${data.count} expenses.` }; }
    case 'CAMPUS_INFO': {
      const topic = (p.topic || 'general').toLowerCase();
      const data = topic.includes('event') ? { events: campusData.events, source: campusData.source } : topic.includes('libr') ? { library: campusData.library, source: campusData.source } : topic.includes('academ') ? { academic: campusData.academic, source: campusData.source } : campusData;
      return { action: parsed.intent, result: data, message: topic.includes('event') ? `There are ${campusData.events.length} sample campus events in the local dataset.` : topic.includes('libr') ? campusData.library.hours : 'I found campus information in the local sample dataset.' };
    }
    default: return { action: 'UNKNOWN', result: null, message: 'I can save expenses, create tasks and reminders, list tasks or expenses, summarize spending, and answer sample campus questions. Please try one of those.' };
  }
}
