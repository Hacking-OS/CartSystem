const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
const router = express.Router();
const authentication = require("../services/authentication");
const pdfService = require("../services/pdfService");
const emailService = require("../services/emailService");
const {
  sequelize,
  Bill,
  UserCart,
  Product,
  User,
  EmailSent,
  PaymentStatus,
  Category,
} = require("../database/models");

const buildTemplatePayload = (productDetails, meta) => ({
  productDetails,
  name: meta.name,
  email: meta.email,
  phone: meta.phone,
  PaymentType: meta.paymentType,
  totalAmount: meta.total,
  invoiceId: meta.invoiceId,
});

const extractProductData = (payload) => {
  const parsed = Array.isArray(payload) ? payload : JSON.parse(payload || "[]");
  let totalAmount = 0;
  const filteredData = parsed.filter((item) => {
    if (item && Object.prototype.hasOwnProperty.call(item, "resultPriceTotal")) {
      totalAmount = item.resultPriceTotal;
      return false;
    }
    return true;
  });
  return { filteredData, totalAmount };
};

router.post("/GenerateReport", authentication.authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const GernerateId = uuid.v1();
    const orderDetails = req.body;

    const cartItems = await UserCart.findAll({
      where: { user_id: orderDetails.id, userCheckOut: 1 },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: Category, as: "category", attributes: ["name"] }],
        },
      ],
      transaction,
    });

    if (!cartItems.length) {
      await transaction.rollback();
      return res.status(404).json({ error: true, errorMessage: "No items ready for checkout." });
    }

    const user = await User.findByPk(orderDetails.id, { transaction });
    const total = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const productSnapshot = cartItems.map((item) => ({
      cartId: item.cartId,
      user_id: item.user_id,
      total: item.total_price,
      quantity: item.quantity,
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      description: item.product.description,
      categoryId: item.product.categoryId,
      category: item.product.category ? item.product.category.name : null,
      status: item.product.status,
    }));

    const paymentStatusName =
      orderDetails.paymentType === "CashOnDelivery" ? "Pending" : "Paid";

    const [paymentStatus] = await PaymentStatus.findOrCreate({
      where: { paymentStatusName },
      defaults: { paymentStatusName },
      transaction,
    });

    await Bill.create(
      {
        uuid: GernerateId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        paymentMethod: orderDetails.paymentType,
        paymentStatusID: paymentStatus.id,
        total,
        userId: String(orderDetails.id),
        productData: [...productSnapshot, { resultPriceTotal: total }],
        createdBy: user.email,
        PDFGeneratedTimes: 1,
      },
      { transaction }
    );

    const pdfPath = await pdfService.generateInvoice(
      GernerateId,
      buildTemplatePayload(productSnapshot, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        paymentType: orderDetails.paymentType,
        total,
        invoiceId: GernerateId,
      })
    );

    await UserCart.update({ userCheckOut: 2 }, { where: { user_id: orderDetails.id, userCheckOut: 1 }, transaction });
    await UserCart.destroy({ where: { user_id: orderDetails.id, userCheckOut: 2 }, transaction });

    await transaction.commit();

    if (emailService.isEmailEnabled()) {
      const mailingOptions = {
        to: user.email,
        subject: "Order Payment:",
        html: "Thank you for shopping with us.",
        attachments: [{ filename: GernerateId + ".pdf", path: pdfPath }],
      };
      emailService
        .sendMail(mailingOptions)
        .then((info) => {
          const responseMessage = info.response || "Email dispatched";
          EmailSent.create({ emailResults: responseMessage, log: JSON.stringify(info) });
        })
        .catch((error) => {
          EmailSent.create({ emailResults: error.message, log: JSON.stringify({ error }) });
        });
    } else {
      EmailSent.create({ emailResults: "Email skipped", log: JSON.stringify({ reason: "Email disabled" }) });
    }

    return res.status(200).json({ uuid: GernerateId, message: "Thank U for Shoping with US " });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).json(error);
  }
});

router.post("/getPdf", authentication.authenticateToken, async (req, res) => {
  const orderDetails = req.body;
  const pdfPath = pdfService.getPdfPath(orderDetails.id);
  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    return fs.createReadStream(pdfPath).pipe(res);
  }

  try {
    const whereClause = orderDetails.role === "user"
      ? { uuid: orderDetails.id, userId: String(orderDetails.userId) }
      : { uuid: orderDetails.id };
    const bill = await Bill.findOne({ where: whereClause });
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    const { filteredData, totalAmount } = extractProductData(bill.productData);
    await pdfService.generateInvoice(
      orderDetails.id,
      buildTemplatePayload(filteredData, {
        name: bill.name,
        email: bill.email,
        phone: bill.phone,
        paymentType: bill.paymentMethod,
        total: totalAmount,
      })
    );
    bill.PDFGeneratedTimes += 1;
    await bill.save();
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/getBills", authentication.authenticateToken, async (req, res) => {
  try {
    const bills = await Bill.findAll({ order: [["id", "DESC"]] });
    return res.status(200).json(bills);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getBillsUsers/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const bills = await Bill.findAll({ where: { userId: req.params.id } });
    return res.status(200).json(bills);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/delete/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const removed = await Bill.destroy({ where: { uuid: req.params.id } });
    if (!removed) {
      return res.status(404).json({ message: "Invalid Data provided!" });
    }
    return res.status(200).json({ message: "Bill Deleted Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
 
