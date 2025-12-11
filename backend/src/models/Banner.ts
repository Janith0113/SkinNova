import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  textStyle?: 'normal' | 'italic' | 'bold';
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
    backgroundColor: {
      type: String,
      default: '#000000',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    textStyle: {
      type: String,
      enum: ['normal', 'italic', 'bold'],
      default: 'normal',
    },
    alignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    overlayOpacity: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;
