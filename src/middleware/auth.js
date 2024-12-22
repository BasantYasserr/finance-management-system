import jwt from 'jsonwebtoken'
import { User } from '../../DB/models/user.js'

export const authMiddleware = async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      const user = await User.findOne({ _id: decoded.id, status: 'Active' });
  
      if (!user) {
        throw new Error();
      }
  
      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Please authenticate' });
    }
  };