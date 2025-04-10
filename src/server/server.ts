import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { 
  registerUser, 
  authenticateUser, 
  verifyToken, 
  requestPasswordReset, 
  resetPasswordWithToken,
  authenticateWithGoogle
} from '../services/auth';
import { initializeDatabaseAndMigration } from '../services/migrationService';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

console.log(`[Server] Starting environment: ${isBrowser ? 'Browser' : 'Node.js'}`);


// Only create Express app if we're in a Node.js environment
const app = isBrowser ? null : express();
const PORT = 3001;

// This function will only run in a Node.js environment
const setupServer = () => {
  if (!app) return null;
  
  console.log('[Server] Configuring Express server...');
  
  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Middleware to verify authentication
  const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const { valid, user } = verifyToken(token);
      
      if (valid && user) {
        (req as any).user = user;
        next();
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
  };

  // Route for registration
  app.post('/api/register', async (req: express.Request, res: express.Response) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username and password required' });
        return;
      }
      
      const success = await registerUser(username, email || '', password);
      
      if (success) {
        res.json({ success: true, message: 'Registration successful' });
      } else {
        res.status(409).json({ success: false, message: 'Username or email already used' });
      }
    } catch (error) {
      console.error("Error in register route:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Route for login
  app.post('/api/login', async (req: express.Request, res: express.Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username and password required' });
        return;
      }
      
      const result = await authenticateUser(username, password);
      
      if (result.success && result.token && result.user) {
        res.json({
          success: true,
          message: 'Authentication successful',
          token: result.token,
          user: result.user
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error("Error in login route:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Route for Google authentication
  app.post('/api/auth/google', async (req: express.Request, res: express.Response) => {
    try {
      const { googleData } = req.body;
      
      if (!googleData || !googleData.email) {
        res.status(400).json({ success: false, message: 'Google user data required' });
        return;
      }
      
      const result = await authenticateWithGoogle(googleData);
      
      if (result.success && result.token && result.user) {
        res.json({
          success: true,
          message: 'Google authentication successful',
          token: result.token,
          user: result.user
        });
      } else {
        res.status(401).json({ success: false, message: 'Google authentication failed' });
      }
    } catch (error) {
      console.error("Error in Google auth route:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Route for requesting password reset
  app.post('/api/reset-password', async (req: express.Request, res: express.Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ success: false, message: 'Email required' });
        return;
      }
      
      const success = await requestPasswordReset(email);
      
      // Always return success, even if the email doesn't exist (for security reasons)
      res.json({
        success: true,
        message: 'If your email is associated with an account, you will receive a reset link'
      });
    } catch (error) {
      console.error("Error in reset-password route:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Route for resetting password with a token
  app.post('/api/reset-password/confirm', async (req: express.Request, res: express.Response) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({ success: false, message: 'Token and new password required' });
        return;
      }
      
      const success = await resetPasswordWithToken(token, newPassword);
      
      if (success) {
        res.json({
          success: true,
          message: 'Password reset successful'
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid token or expired' 
        });
      }
    } catch (error) {
      console.error("Error in reset-password/confirm route:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Route for protected profile access
  app.get('/api/profile', authenticateJWT, (req: express.Request, res: express.Response) => {
    res.json({ success: true, user: (req as any).user });
  });

  // Route for data synchronization
  app.post('/api/sync', authenticateJWT, (req: express.Request, res: express.Response) => {
    try {
      const { data, syncType } = req.body;
      
      if (!data) {
        res.status(400).json({ success: false, message: 'Data missing for synchronization' });
        return;
      }
      
      // Implement actual synchronization logic here
      // For now, we return a success message
      res.json({ 
        success: true, 
        message: 'Synchronization successful',
        syncType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in sync route:", error);
      res.status(500).json({ success: false, message: 'Synchronization error' });
    }
  });

  return app;
};

// Function to start the server after database migration
const startServer = async () => {
  try {
    console.log('[Server] Initializing migration...');
    
    // Initialize the database and perform migration
    await initializeDatabaseAndMigration();

    console.log('[Server] Database initialized and migration complete.');

    // Start the server after migration
    app.listen(PORT, () => {
      console.log(`[Server] Server started on port ${PORT}`);
    });

  } catch (error) {
    console.error('[Server] Error during initialization:', error);
    process.exit(1);  // Terminate the process with an error if migration fails
  }
};

// Start server only in Node.js environment
if (!isBrowser) {
  console.log('[Server] Node.js environment detected, initializing server...');
  const server = setupServer();
  
  // Start the server and handle migration
  startServer();
} else {
  console.log('[Server] Browser environment detected, server not started');
}

export default app;
