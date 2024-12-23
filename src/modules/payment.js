import PayPal from 'paypal-rest-sdk';


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
      const { amount, description, currency = 'USD' } = req.body;
      
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
            total: amount,
            currency
          },
          description
        }]
      };
  
      const transaction = await createPayment(payment);
      const redirectUrl = transaction.links.find(link => link.method === 'REDIRECT')?.href;
      
      if (!redirectUrl) throw new Error('No redirect URL found');
      
      res.status(200).json({ 
        redirectUrl,
        paymentId: transaction.id 
      });
    } catch (error) {
      res.status(400).json({ 
        error: error.message 
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
