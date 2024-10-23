import { Schema, model, Model } from "mongoose";

export interface IProduct {
  name: string,
  description: string,
  price: number,
  quantity: number,
  image_url?: string,
  createdAt?: Date,
  updatedAt?: Date,
}

export const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, },
    description: { type: String, required: true, },
    price: { type: Number, required: true, },
    quantity: { type: Number, required: true, },
    image_url: { type: String, },
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);