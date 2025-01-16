import Payment from "../Models/Payment.js";

export const CreatePayment = async (req, res) => {
  try {
    const {
      client_Id,
      client_secret,
      Payment_Type,
      store_Id,
      store_domain,
      store_name,
    } = req.body;
    if (
      !client_Id ||
      !client_secret ||
      !Payment_Type ||
      !store_Id ||
      !store_domain ||
      !store_name
    ) {
      return res.status(400).json({
        status: 400,
        message: `${
          !client_Id
            ? "client_Id is required"
            : !client_secret
            ? "client_secret is required"
            : !Payment_Type
            ? "Payment_Type is required"
            : !store_Id
            ? "store_Id is required"
            : !store_domain
            ? "store_domain is required"
            : !store_name
            ? "store_name is required"
            : ""
        } is required`,
      });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { store_Id },
      {
        client_Id,
        client_secret,
        Payment_Type,
        store_Id,
        store_domain,
        store_name,
      },
      { new: true }
    );

    if (updatedPayment) {
      return res.status(200).json(updatedPayment);
    }

    const payment = await Payment.create({
      client_Id,
      client_secret,
      Payment_Type,
      store_Id,
      store_domain,
      store_name,
    });
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetPayment = async (req, res) => {
  try {
    const { store_Id } = req.query;
    const payment = await Payment.findOne(store_Id);
    if (payment) {
      res.status(200).json(payment);
    } else {
      res.status(404).json({ error: "Payment not found" });
    }
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
