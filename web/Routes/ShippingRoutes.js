import express from 'express'
import { CreateShipping, DeleteShipping, GetShipping } from '../Controllers/ShippingController.js'

const ShippingRoutes=express.Router()
ShippingRoutes.post('/create-shipping',CreateShipping)
ShippingRoutes.get('/get-shipping', GetShipping)
ShippingRoutes.delete("/delete-shipping",DeleteShipping)
export default ShippingRoutes