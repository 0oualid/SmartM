import { getStorage } from '../../utils/sqliteStorage';
import { User, AuthResult } from './types';
import db from '../../server/db';

const storage = getStorage();
export const JWT_SECRET = 'smartm-auth-secret-key'; // En production, utilisez une variable d'environnement

// Helper function to create a simple JWT token (browser-compatible)
export const createToken = (payload: any, expiresIn: string): string => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expiresIn === '24h' ? 86400 : expiresIn === '1h' ? 3600 : 86400);
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp
  };
  
  // In a real app, you'd use a proper JWT library
  // This is a simplified version for demo purposes
  return btoa(JSON.stringify(tokenPayload));
};

// Helper function to verify a token (browser-compatible)
export const verifyJwt = (token: string): any => {
  try {
    const decoded = JSON.parse(atob(token));
    const now = Math.floor(Date.now() / 1000);
    
    if (decoded.exp && decoded.exp < now) {
      throw new Error('Token expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Function to register a new user
export const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    console.log(`Registering user: ${username}, ${email}`);
    
    // Check if user already exists in the database (SQLite)
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?');
    const existingUser = stmt.get(username, email);
    
    if (existingUser) {
      return false;
    }
    
    // Store new user in SQLite
    const hashedPassword = password; // In production, use hashing
    const insertStmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    insertStmt.run(username, email, hashedPassword);
    
    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

// Function to authenticate a user
export const authenticateUser = async (username: string, password: string): Promise<AuthResult> => {
  try {
    // Check user credentials from SQLite
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    
    if (!user) {
      return { success: false };
    }
    
    // Check password (no hashing in this demo, use hashed password in production)
    const isPasswordValid = user.password === password;
    
    if (!isPasswordValid) {
      return { success: false };
    }
    
    // Generate JWT token
    const token = createToken({ id: user.id, username: user.username }, '24h');
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false };
  }
};

// Function for Google authentication
export const authenticateWithGoogle = async (googleUserData: { email: string, name: string, googleId: string }): Promise<AuthResult> => {
  try {
    const { email, name, googleId } = googleUserData;
    
    // Check if user exists in SQLite
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    let user = stmt.get(email);
    
    let userId: number;
    
    if (user) {
      // User exists, update googleId if not set
      if (!user.googleId) {
        const updateStmt = db.prepare('UPDATE users SET googleId = ? WHERE email = ?');
        updateStmt.run(googleId, email);
      }
      userId = user.id;
    } else {
      // Create new user with Google data
      const randomPassword = Math.random().toString(36).slice(-10);
      const username = name.replace(/\s+/g, '') || email.split('@')[0];
      
      // Create new user
      const insertStmt = db.prepare('INSERT INTO users (username, email, password, googleId) VALUES (?, ?, ?, ?)');
      const result = insertStmt.run(username, email, randomPassword, googleId);
      userId = result.lastInsertRowid;
      user = { id: userId, username, email, googleId, password: randomPassword };
    }
    
    // Generate token
    const token = createToken({ id: userId, email }, '24h');
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error authenticating with Google:', error);
    return { success: false };
  }
};

// Function to verify a JWT token
export const verifyToken = (token: string): { valid: boolean; user?: User } => {
  try {
    // Use our browser-compatible verify function
    const decoded = verifyJwt(token);
    
    return {
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username
      }
    };
  } catch (error) {
    return { valid: false };
  }
};
