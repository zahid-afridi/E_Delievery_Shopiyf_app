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
    const existingUser = await User.findOneAndUpdate(
      { Store_Id },
      {
        clientId,
        clientSecret,
        customerId,
        serviceId,
        Store_Id,
        store_domain,
      },
      { new: true }
    );

    if (existingUser) {
      return res
        .status(200)
        .json({
          error: "User already exists",
          message: "User updated successfully",
        });
    }
    const user = await User.create({
      clientId,
      clientSecret,
      customerId,
      serviceId,
      Store_Id,
      store_domain,
    });

    res.status(201).json({ user, message: "User created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { Store_Id } = req.query;
    const user = await User.findOne(Store_Id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
