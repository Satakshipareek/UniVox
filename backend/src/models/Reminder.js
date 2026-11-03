import mongoose from 'mongoose';
const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  reminderDate: { type: Date, required: true, index: true },
  completed: { type: Boolean, default: false, index: true }
}, { timestamps: true });
reminderSchema.index({ completed: 1, reminderDate: 1 });
export default mongoose.model('Reminder', reminderSchema);
