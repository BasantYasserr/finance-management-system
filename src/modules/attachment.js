import {Attachment} from '../../DB/models/attachment.js'

// Attach files
export const attachFiles = async (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
  
      const { transactionId } = req.body;
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
  
      // Save file details to database
      const attachment = await Attachment.create({
        transactionId,
        filename: req.file.filename,
        path: req.file.path,
        type: req.file.mimetype
      });
  
      res.status(200).json({ 
        status: 'success',
        attachment 
      });
    } catch (error) {
      res.status(400).json({ 
        error: error.message 
      });
    }
  };