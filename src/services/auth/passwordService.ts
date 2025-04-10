
import bcryptjs from 'bcryptjs';
import db from '../../server/db';
import { sendPasswordResetEmail } from '../emailService';
import { createToken, verifyJwt } from './authCore';

// Function to request a password reset
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      // For security reasons, we return true even if the user doesn't exist
      return true;
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = createToken(
      { id: user.id, purpose: 'password_reset' },
      '1h'
    );
    
    // Store token in database
    const stmt = db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?');
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    
    stmt.run(resetToken, expiryTime.toISOString(), user.id);
    
    // Send reset email
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In browser environment, simulate email sending
      console.log(`[SIMULATED] Reset email sent to: ${email}`);
      console.log(`[SIMULATED] Reset link: /reset-password?token=${resetToken}`);
      return true;
    } else {
      // In server environment, send a real email
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (emailSent) {
        console.log(`Reset email sent to: ${email}`);
        return true;
      } else {
        console.error(`Failed to send email to: ${email}`);
        return false;
      }
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return false;
  }
};

// Function to reset password with a token
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    // Verify token
    let decoded;
    try {
      decoded = verifyJwt(token);
      if (decoded.purpose !== 'password_reset') {
        return false;
      }
    } catch (error) {
      return false;
    }
    
    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND reset_token = ?').get(decoded.id, token);
    
    if (!user) {
      return false;
    }
    
    // Check if token has expired
    const tokenExpires = new Date(user.reset_token_expires);
    if (tokenExpires < new Date()) {
      return false;
    }
    
    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    // Update password and clear token
    const stmt = db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?');
    stmt.run(hashedPassword, user.id);
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};
