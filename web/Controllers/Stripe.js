
// import stripe from 'stripe' 

// export const  CreatePayment=async(req,res)=>{
//     const {amount}=req.body
//     try {
//         const  paymentIntent= await stripe.paymentIntents.create({
//             amount:amount,
//             currency:'usd',
          
//         })
//         res.json({
//             clientSecret: paymentIntent.client_secret,
//           });
//     } catch (error) {
//         console.error('Stripe',error);
//     res.status(500).send('Internal Server Error');
//     }
// }
import stripe from 'stripe'

// Initialize stripe with the secret key from environment variable

export const CreatePayment = async (req, res) => {
    const {amount,StripeKey} = req.body
    const stripeClient = stripe(StripeKey)
    console.log('amount',amount)
    try {
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            
        })
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe', error);
        res.status(500).send('Internal Server Error');
    }
}
