

import express from 'express'
import { CreatePayment } from '../Controllers/Stripe.js'

const StripeRoutes=express.Router()

StripeRoutes.post('/create-payment-intent',CreatePayment)

export default StripeRoutes