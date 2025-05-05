import { Request, Response, NextFunction } from 'express';
import { validate, parse } from '@telegram-apps/init-data-node';
import dotenv from 'dotenv';

dotenv.config();

// Get Telegram bot token from environment variables
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('TELEGRAM_TOKEN is not defined in environment variables');
}

// Type for parsed init data
interface InitDataParsed {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    [key: string]: any;
  };
  auth_date: number | Date;
  hash: string;
  chat?: {
    id: number;
    type: string;
    title: string;
    username?: string;
    photo_url?: string;
    [key: string]: any;
  };
  start_param?: string;
  can_send_after?: number;
  auth_date_unix?: number;
  receiver?: {
    id: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// Extend Express Request to include initData
declare global {
  namespace Express {
    interface Request {
      telegramInitData?: InitDataParsed;
    }
  }
}

/**
 * Middleware to authenticate Telegram Mini App requests
 * Validates the init data from Telegram and stores it in the request object
 * Bypasses authentication in development mode
 */
export default function telegramAuth(req: Request, res: Response, next: NextFunction) {
  // Bypass authentication in development mode
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    console.log('Development mode: Bypassing Telegram authentication');
    return next();
  }

  // We expect passing init data in the Authorization header in the following format:
  // <auth-type> <auth-data>
  // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data
  const authHeader = req.header('authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const [authType, authData = ''] = authHeader.split(' ');

  if (authType !== 'tma') {
    return res.status(401).json({ error: 'Invalid authorization type' });
  }

  try {
    if (!token) {
      throw new Error('Telegram bot token is not configured');
    }

    validate(authData, token, { expiresIn: 60*60*24*365*10 });

    // Parse and store init data in the request object
    req.telegramInitData = parse(authData);
    return next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    return res.status(401).json({
      error: 'Invalid Telegram authentication data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}