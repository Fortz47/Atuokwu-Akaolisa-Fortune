import { Schema, model } from "mongoose";
import { IProduct, productSchema } from "./Product";

interface IOrder {
  customerName: string;
  customerEmail: string;
  products: IProduct[];
  orderStatus: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAdress: string;
  orderDate: Date;
  orderTotal: number;
}

const orderschema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    products: [productSchema], // Array of embedded Product documents
    orderStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    shippingAdress: { type: String, required: true },
    orderDate: {
      type: Date,
      default: Date.now
    },
    orderTotal: {
      type: Number,
      required: true
    },
  },
);

export const Order = model<IOrder>('Order', orderschema);