import { z } from "zod";

export const signupSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  upiId: z.string().optional().or(z.literal("")),
  language: z.enum(["en", "hi"]).default("en"),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
