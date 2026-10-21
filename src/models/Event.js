import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const EventModel = mongoose.model('Event', eventSchema);
export default EventModel;
