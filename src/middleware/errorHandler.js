export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
  
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate Error',
        details: 'This record already exists'
      });
    }
  
    res.status(500).json({
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };