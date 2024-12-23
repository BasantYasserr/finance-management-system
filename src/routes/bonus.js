import express from 'express';
import { Bonus } from '../../DB/models/bonus.js'
import { notificationService } from '../utils/notification.js'
import { authMiddleware } from '../middleware/auth.js'
import { roleCheck } from '../middleware/roleCheck.js'
import mongoose from 'mongoose';

const router = express.Router();

// Create bonus request
router.post(
  '/',
  authMiddleware,
  roleCheck(['manager']),
  async (req, res) => {
    try {
      const bonusData = {
        ...req.body,
        requestedBy: req.user._id
      };
      
      const bonus = await Bonus.create(bonusData);
      
      await notificationService({
        type: 'bonus_request',
        recipientRole: 'finance_staff',
        data: bonus
      });
      
      res.status(201).json(bonus);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get monthly bonus report
router.get(
  '/report/monthly',
  authMiddleware,
  roleCheck(['manager', 'finance_staff']),
  async (req, res) => {
    try {
      const { month, year } = req.query;
      const report = await Bonus.getMonthlyReport(parseInt(month), parseInt(year));
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/monthly',
  authMiddleware,
  roleCheck(['manager', 'staff']),
  async (req, res) => {
    try {
      const { month, year,status } = req.query;
      const report = await Bonus.getPendingRequests(parseInt(month), parseInt(year),status);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  '/:bonusId/approve-reject',
  authMiddleware,
  roleCheck(['staff']), // Only staff can approve/reject
  async (req, res) => {
    const { bonusId } = req.params;
    const { status, reason, comment } = req.body; // Added 'comment' to request body destructure

    try {
      // Validate the status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
      }

      // Validate bonusId format (e.g., ensure it's a valid ObjectId)
      if (!mongoose.Types.ObjectId.isValid(bonusId)) {
        return res.status(400).json({ error: 'Invalid bonus ID format.' });
      }

      // Find and update the bonus request
      const bonus = await Bonus.findByIdAndUpdate(
        bonusId,
        {
          $set: { status, processedDate: new Date() },
          $push: {
            approvalHistory: {
              status,
              updatedBy: req.user._id, // Assuming req.user._id is the staff's ID
              comment: comment || '', // Default to an empty string if no comment
              date: new Date(),
            },
          },
        },
        { new: true }
      );

      // If the bonus does not exist
      if (!bonus) {
        return res.status(404).json({ error: 'Bonus request not found.' });
      }

      // Send notification to the user who requested the bonus
      await notificationService.sendNotification({
        type: `bonus_${status}`, // "bonus_approved" or "bonus_rejected"
        recipientId: bonus.userId,
        data: {
          title: bonus.title,
          status,
          reason,
          comment,
        },
      });

      res.status(200).json(bonus); // Return the updated bonus object
    } catch (error) {
      console.error('Error processing bonus approval/rejection:', error);
      res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
  }
);

// Get specific bonus request by ID including both parties of users
router.get('/:bonusId', async (req, res) => {
  const { bonusId } = req.params;

  try {
    // Validate bonusId format
    if (!mongoose.Types.ObjectId.isValid(bonusId)) {
      return res.status(400).json({ error: 'Invalid bonus ID format.' });
    }

    // Find the bonus by ID and populate userId and requestedBy fields
    const bonus = await Bonus.findById(bonusId)
      .populate('userId', 'username email role department status')
      .populate('requestedBy', 'username email role department status');

    // If the bonus does not exist
    if (!bonus) {
      return res.status(404).json({ error: 'Bonus request not found.' });
    }

    res.status(200).json(bonus);
  } catch (error) {
    console.error('Error fetching bonus request:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

export default router;
