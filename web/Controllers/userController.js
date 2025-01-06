import User from "../Models/user.Model.js";

export const registerUser = async (req, res) => {
  try {
    const { clientId, clientSecret, customerId, serviceId, Store_Id } =
      req.body;

    if (!clientId || !clientSecret || !customerId || !serviceId || !Store_Id) {
      return res.status(400).json({
        status: 400,
        message: `${
          !clientId
            ? "clientId"
            : !clientSecret
            ? "clientSecret"
            : !customerId
            ? "customerId"
            : !serviceId
            ? "serviceId"
            : !Store_Id
            ? "Store_Id"
            : ""
        } is required`,
      });
    }
    const existingUser = await User.findOne({ customerId });
    if (existingUser) {
      return res.status(200).json({ error: "User already exists" });
    }
    const user = await User.create({
      clientId,
      clientSecret,
      customerId,
      serviceId,
      Store_Id,
    });

    res.status(201).json({user, message: "User created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
