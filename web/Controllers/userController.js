import User from "../Models/user.Model.js";

export const registerUser = async (req, res) => {
  try {
    const {
      clientId,
      clientSecret,
      customerId,
      serviceId,
      Store_Id,
      store_domain,
    } = req.body;

    // Check if all required fields are present
    if (
      !clientId ||
      !clientSecret ||
      !customerId ||
      !serviceId ||
      !Store_Id ||
      !store_domain
    ) {
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
            : !store_domain
            ? "store_domain"
            : ""
        } is required`,
      });
    }

    // Check if the user already exists by customerId
    const existingUser = await User.findOne({ customerId });

    if (existingUser) {
      // If the user exists, update their details
      const updatedUser = await User.findOneAndUpdate(
        { customerId },
        {
          clientId,
          clientSecret,
          serviceId,
          Store_Id,
          store_domain,
        },
        { new: true } // Return the updated document
      );

      return res
        .status(200)
        .json({ user: updatedUser, message: "User updated successfully" });
    }

    // If the user doesn't exist, create a new one
    const newUser = await User.create({
      clientId,
      clientSecret,
      customerId,
      serviceId,
      Store_Id,
      store_domain,
    });

    res
      .status(201)
      .json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const GetUser = async (req, res) => {
  try {
    const { Store_Id } = req.query;

    const user = await User.findOne(Store_Id);
    if (user) {
      return res.status(200).json({ user: user });
    } else {
      return res.status(500).json("UserNotFound");
    }
  } catch (error) {
    console.error("error ", error);
  }
};
