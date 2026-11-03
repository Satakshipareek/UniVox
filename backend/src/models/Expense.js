import mongoose from 'mongoose';
const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, trim: true, default: 'Other', maxlength: 40 },
  description: { type: String, trim: true, required: true, maxlength: 160 },
  date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
expenseSchema.index({ date: -1, category: 1 });
export default mongoose.model('Expense', expenseSchema);
