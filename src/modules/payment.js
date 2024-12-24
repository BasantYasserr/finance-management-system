import PayPal from 'paypal-rest-sdk';
import dotenv from 'dotenv';
dotenv.config();
import { Bonus } from '../../DB/models/bonus.js';


// Configure PayPal
PayPal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET
});

// Create PayPal payment
const createPayment = (payment) => {
    return new Promise((resolve, reject) => {
      PayPal.payment.create(payment, (err, payment) => {
        if (err) reject(err);
        else resolve(payment);
      });
    });
  };
  
// Process payment
export const processPayment = async (req, res) => {
  try {
    const { bonusRequestId, description, currency = 'USD' } = req.body;

    // Retrieve the bonus request using the bonusRequestId
    const bonusRequest = await Bonus.findById(bonusRequestId);
    
    // If no bonus request found, return an error
    if (!bonusRequest) {
      return res.status(404).json({ error: "Bonus request not found" });
    }

    if(bonusRequest.status != "approved")
      return res.status(400).json({ error: "Bonus request must be approved first" });


    // Use the amount from the bonus request
    const amount = bonusRequest.amount;

    console.log(amount.toFixed(2));

    // Construct the payment object
    const payment = {
      intent: 'authorize',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${process.env.BASE_URL}/api/payments/success`,
        cancel_url: `${process.env.BASE_URL}/api/payments/cancel`
      },
      transactions: [{
        amount: {
          total: amount.toFixed(2), // Ensure the amount is formatted correctly
          currency
        },
        description
      }]
    };

    // Create the payment and get the redirect URL
    const transaction = await createPayment(payment);
    const redirectUrl = transaction.links.find(link => link.method === 'REDIRECT')?.href;

    if (!redirectUrl) throw new Error('No redirect URL found');

    // Return the redirect URL and payment ID
    res.status(200).json({ 
      redirectUrl,
      paymentId: transaction.id 
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ 
      error: error.message || "An error occurred while processing the payment" 
    });
  }
};

// Execute payment after PayPal approval
export const executePayment = async (req, res) => {
    try {
      const { paymentId, PayerID } = req.query;
      
      const payment = await new Promise((resolve, reject) => {
        PayPal.payment.execute(paymentId, { payer_id: PayerID }, (err, payment) => {
          if (err) reject(err);
          else resolve(payment);
        });
      });
  
      res.status(200).json({ 
        status: 'success',
        payment 
      });
    } catch (error) {
      res.status(400).json({ 
        error: error.message 
      });
    }
};
