
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
const stripeClient = stripe('sk_test_51QWwrrGRZ5NyJeXFCdss3bt5rltr9y6VRPRrSDktZ8doqf4EphStaZErUxxVRldiknPOZMATksySbI1PqYFoXr2O00jywu54N7')

export const CreatePayment = async (req, res) => {
    const {amount} = req.body
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
