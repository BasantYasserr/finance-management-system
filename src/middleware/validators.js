import { body, validationResult } from 'express-validator';

export const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').trim().isLength({ min: 3 }),
  body('role').isIn(['student', 'staff', 'doctor', 'manager', 'finance_staff']),
  body('department').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateBonus = [
  body('amount').isFloat({ min: 0 }),
  body('reason').trim().notEmpty(),
  body('userId').isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];