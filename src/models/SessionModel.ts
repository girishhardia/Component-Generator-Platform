import mongoose, { Document, Model, Schema } from 'mongoose';

interface IChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface IGeneratedCode {
  tsx: string;
  css: string;
}

export interface ISession extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  chatHistory: IChatMessage[];
  generatedCode: IGeneratedCode;
}

const SessionSchema: Schema<ISession> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a session name'],
    default: 'New Project',
  },
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  }],
  generatedCode: {
    tsx: { type: String, default: '' },
    css: { type: String, default: '' },
  },
}, { timestamps: true });

const SessionModel: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default SessionModel;