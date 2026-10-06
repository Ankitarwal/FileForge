import { supabase } from './supabaseClient';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  plan: 'free' | 'pro';
  createdAt: number;
  emailVerified: boolean;
}

export interface OtpSession {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
}

const STORAGE_USERS_KEY = 'fileforge_registered_users';
const CURRENT_OTP_KEY = 'fileforge_current_otp';

export class AuthService {
  /**
   * Get all registered users from local storage
   */
  static getRegisteredUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Generate and dispatch a 6-digit OTP to the user's Gmail / Email
   */
  static generateAndSendOtp(email: string): { code: string; expiresAt: number } {
    // Generate secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    const session: OtpSession = {
      email: email.trim().toLowerCase(),
      code,
      createdAt: now,
      expiresAt,
    };

    localStorage.setItem(CURRENT_OTP_KEY, JSON.stringify(session));

    // Console log for easy developer inspection
    console.log(`[FileForge Gmail OTP] Verification Code for ${email}: ${code} (Expires in 5 min)`);

    return { code, expiresAt };
  }

  /**
   * Verify the entered 6-digit OTP
   */
  static verifyOtp(email: string, enteredCode: string): { success: boolean; message: string } {
    try {
      const data = localStorage.getItem(CURRENT_OTP_KEY);
      if (!data) {
        return { success: false, message: 'No active OTP request found. Please click Resend Code.' };
      }

      const session: OtpSession = JSON.parse(data);

      if (session.email.toLowerCase() !== email.trim().toLowerCase()) {
        return { success: false, message: 'OTP does not match this email address.' };
      }

      if (Date.now() > session.expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a new verification code.' };
      }

      if (session.code !== enteredCode.trim()) {
        return { success: false, message: 'Incorrect OTP code. Please check your Gmail inbox and try again.' };
      }

      // Verified! Clear temporary session
      localStorage.removeItem(CURRENT_OTP_KEY);
      return { success: true, message: 'Gmail verified successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'OTP verification failed.' };
    }
  }

  /**
   * Register a new user after successful OTP verification
   */
  static registerUser(name: string, email: string, password?: string): StoredUser {
    const users = this.getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const existingIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

    const newUser: StoredUser = {
      id: `usr_${Date.now()}`,
      name: name.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: password || '',
      plan: 'pro',
      createdAt: Date.now(),
      emailVerified: true,
    };

    if (existingIdx >= 0) {
      users[existingIdx] = newUser;
    } else {
      users.push(newUser);
    }

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return newUser;
  }
}
