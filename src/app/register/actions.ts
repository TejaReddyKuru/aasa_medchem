'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerSeller(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = RegisterSchema.safeParse(rawData);

    if (!validatedData.success) {
      return validatedData.error.issues[0].message;
    }

    const { name, email, password } = validatedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return "An account with this email already exists.";
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'SELLER', // New public users are always sellers
      },
    });

  } catch (error) {
    return 'Something went wrong during registration.';
  }

  // Redirect to login upon successful registration
  redirect('/login?registered=true');
}
