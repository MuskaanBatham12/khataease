import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  address: z.string().optional().or(z.literal("")),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be a non-negative number"), // price in INR or paise
});

export const billItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().int().min(0, "Price in paise must be non-negative"),
});

export const createBillSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(billItemSchema).optional().default([]),
  total: z.number().int().min(100, "Total amount must be at least 1 INR (100 paise)"), // in paise
  paidAmount: z.number().int().min(0).default(0), // in paise
  note: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  billId: z.string().optional(),
  amount: z.number().int().min(100, "Payment amount must be at least 1 INR (100 paise)"), // in paise
  note: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
