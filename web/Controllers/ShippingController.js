import ShippingModal from "../Models/ShippingMehtods.js"


export const CreateShipping=async(req,res)=>{
    try {
        const {ShipmentName,Price,Store_Id,store_domain}=req.body 
        if (!ShipmentName || !Price || !Store_Id || !store_domain) {
            return res.status(400).json({error:"All fields are required"})
  
        }
        const existingShipping=await ShippingModal.findOne({ShipmentName,Store_Id})
        if (existingShipping) {
            return res.status(400).json({error:"Shipping Method Already Exists"})
        }
      
        const shipping=await ShippingModal.create({
            ShipmentName,
            Price,
            Store_Id,
            store_domain
        })
        res.status(200).json({shipping,message:"Shipping Method Created Successfully"})
    } catch (error) {
        console.log('erro',error)
        res.status(500).json({error:error.message})
    }
}

// For arry store code

// export const CreateShipping = async (req, res) => {
//     try {
//       const { ShipmentName, Price, Store_Id, store_domain } = req.body;
  
//       // Validate required fields
//       if (!ShipmentName || !Price || !Store_Id || !store_domain) {
//         return res.status(400).json({ error: "All fields are required" });
//       }
  
//       // Check if the store already has a shipping method
//       const existingShipping = await ShippingModal.findOne({ Store_Id, store_domain });
  
//       if (existingShipping) {
//         // Check if the ShipmentName already exists in the arrays
//         if (existingShipping.ShipmentNames.includes(ShipmentName)) {
//           return res.status(400).json({ error: "Shipping Method Already Exists" });
//         }
  
//         // Add the new ShipmentName and Price to the arrays
//         existingShipping.ShipmentNames.push(ShipmentName);
//         existingShipping.Prices.push(Price);
  
//         await existingShipping.save();
  
//         return res.status(200).json({ success: true, message: "Shipping Method Added Successfully", shipping: existingShipping });
//       } else {
//         // Create a new shipping method if it doesn't exist
//         const shipping = await ShippingModal.create({
//           ShipmentNames: [ShipmentName],
//           Prices: [Price],
//           Store_Id,
//           store_domain,
//         });
  
//         return res.status(200).json({ success: true, message: "Shipping Method Created Successfully", shipping });
//       }
//     } catch (error) {
//       console.log("Error:", error);
//       return res.status(500).json({ error: error.message });
//     }
//   };

export const GetShipping = async (req, res) => {
    try {
        const { Store_Id, store_domain } = req.query;

        if (!Store_Id && !store_domain) {
            return res.status(400).json({ message: "Either Store_Id or store_domain is required" });
        }

        const shipping = await ShippingModal.find({
            $or: [{ Store_Id }, { store_domain }]
        });
        if (!shipping) {
            return res.status(404).json({ message: "Shipping Method Not Found" });
        }
        if (shipping.length > 0) {
            return res.status(200).json({ success: true, shipping });
        } else {
            return res.status(404).json({ message: "Shipping Method Not Found" });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const DeleteShipping = async (req, res) => {
    try {
        const { ShipmentName, Store_Id } = req.query;

        if (!ShipmentName || !Store_Id) {
            return res.status(400).json({ error: "ShipmentName and Store_Id are required" });
        }

        const deletedShipping = await ShippingModal.findOneAndDelete({ ShipmentName, Store_Id });

        if (!deletedShipping) {
            return res.status(404).json({ error: "Shipping Method Not Found" });
        }

        return res.status(200).json({ message: "Shipping Method Deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};