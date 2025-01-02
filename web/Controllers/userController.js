import User from "../Models/user.Model.js";

export const registerUser = async (req, res) => {
  try {

    const { clientId, clientSecret, customerId, serviceId } = req.body;

    if (!clientId || !clientSecret || !customerId || !serviceId) {
        return res.status(400).json({ error: "All fields are required" });
      }
    const user = await User.create({ clientId, clientSecret, customerId, serviceId });

    res.status(201).json(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
