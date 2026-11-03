import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, default: '', maxlength: 500 },
  dueDate: { type: Date, default: null, index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true }
}, { timestamps: true });
taskSchema.index({ status: 1, dueDate: 1 });
export default mongoose.model('Task', taskSchema);
