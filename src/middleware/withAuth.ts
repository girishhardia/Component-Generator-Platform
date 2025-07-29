import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

// We need to extend the NextApiRequest type to include our custom 'userId' property
export interface NextApiRequestWithUser extends NextApiRequest {
  userId?: string;
}

const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token not found or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      req.userId = decoded.id; // Attach user ID to the request object
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  };
};

export default withAuth;