const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");
const fs = require("fs");
const uuid = require("uuid");
const pdfService = require("../services/pdfService");
const emailService = require("../services/emailService");

const buildTemplatePayload = (productDetails, meta) => ({
  productDetails,
  name: meta.name,
  email: meta.email,
  phone: meta.phone,
  PaymentType: meta.paymentType,
  totalAmount: meta.total,
});

const extractProductData = (serializedProductData) => {
  let totalAmount = 0;
  const parsed = JSON.parse(serializedProductData || "[]");
  const filteredData = parsed.filter((item) => {
    if (item && Object.prototype.hasOwnProperty.call(item, "resultPriceTotal")) {
      totalAmount = item.resultPriceTotal;
      return false;
    }
    return true;
  });
  return {
    filteredData,
    totalAmount,
  };
};

router.post("/GenerateReport", authentication.authenticateToken, (req, res) => {
      let GernerateId = uuid.v1();
      const orderDetails = req.body;
      // var ProductDetailsReport = JSON.parse(orderDetails.productDetails);


      query = "SELECT sum(user_cart.total_price) as Total,users.phone,users.name,users.email,user_cart.cartId as userCartID FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id and user_cart.userCheckOut=1 INNER JOIN users ON user_cart.user_id=users.id and users.id=?";

      myConnection.query(query, [orderDetails.id], (err, dataFinalTotal) => {
        const safeStringify = (obj) => {
          const seen = new WeakSet();
          return JSON.stringify(obj, function (key, value) {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return; // drop circular reference
              seen.add(value);
            }
            return value;
          });
        };

        let recreateJson = () => {
          const original = Array.isArray(orderDetails.productInfo && orderDetails.productInfo.result) ? orderDetails.productInfo.result : [];
          // create a shallow copy of items to avoid mutating the original input
          const copy = original.map(item => (item && typeof item === 'object') ? Object.assign({}, item) : item);
          copy.push({ resultPriceTotal: orderDetails.productInfo && orderDetails.productInfo.resultPriceTotal });
          return safeStringify(copy);
        }
        if (dataFinalTotal[0].userCartID) {} else {
          return res.status(404).json({
            error: true,
            errorMessage: "Bad Request Something went wrong"
          });
        }

        query = "INSERT INTO bill (uuid,name,email,phone,paymentMethod,total,userId,productData,createdBy,PDFGeneratedTimes) VALUES (?,?,?,?,?,?,?,?,?,?)";
        myConnection.query(query, [GernerateId, dataFinalTotal[0].name, dataFinalTotal[0].email, dataFinalTotal[0].phone, orderDetails.paymentType, dataFinalTotal[0].Total, orderDetails.id, recreateJson(), dataFinalTotal[0].email,1], (err, data) => {

          if (err) {
            console.log(err);
            return res.status(500).json(err);
          } else {

            query = "SELECT user_cart.cartId,user_cart.user_id,user_cart.total_price as totalAmount,user_cart.quantity,product.id,product.name,product.price,product.description,product.categoryId,category.name as category,product.status FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id and user_cart.userCheckOut=1 and user_cart.user_id=?";

            myConnection.query(query, [orderDetails.id], async (errs, productData) => {

              if (errs) {
                return res.status(500).json(errs);
              }

              try {
                const pdfPath = await pdfService.generateInvoice(
                  GernerateId,
                  buildTemplatePayload(productData, {
                    name: dataFinalTotal[0].name,
                    email: dataFinalTotal[0].email,
                    phone: dataFinalTotal[0].phone,
                    paymentType: orderDetails.paymentType,
                    total: dataFinalTotal[0].Total,
                  })
                );

                query = "UPDATE user_cart SET userCheckOut=? where user_id=? and userCheckOut=?";
                myConnection.query(query, [2, orderDetails.id, 1], (err, results) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else if (results.affectedRows == 0) {
                    return res.status(404).json({
                      message: "Invalid Data provided!"
                    });
                  }

                  const mailingOptions = {
                    to: dataFinalTotal[0].email,
                    subject: "Order Payment:",
                    html: "Thank you for shopping with us.",
                    attachments: [{
                      filename: GernerateId + '.pdf',
                      path: pdfPath
                    }],
                  };

                  const logEmailResult = (status, info) => {
                    query = "INSERT INTO emailSent (emailResults,log) VALUES (?,?)";
                    myConnection.query(query, [status, JSON.stringify(info)], () => {});
                  };

                  if (emailService.isEmailEnabled()) {
                    emailService.sendMail(mailingOptions)
                      .then((info) => {
                        const responseMessage = info.response || "Email dispatched";
                        logEmailResult(responseMessage, info);
                        console.log(`email sent : ${responseMessage}`);
                      })
                      .catch((error) => {
                        console.log(error);
                        logEmailResult(error.message, { error });
                      });
                  } else {
                    logEmailResult("Email skipped", { reason: "Email disabled in demo build." });
                  }

                  query = "DELETE FROM user_cart WHERE user_id = ? AND userCheckOut = ?;";
                  myConnection.query(query, [orderDetails.id, 2], (err, results) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else if (results.affectedRows == 0) {
                      return res.status(404).json({
                        message: "Invalid Data provided!"
                      });
                    }
                    return res.status(200).json({
                      uuid: GernerateId,
                      message: "Thank U for Shoping with US "
                    });
                  });
                });
              } catch (error) {
                console.log(error);
                return res.status(500).json(error);
              }
            });
          }
        });
      });
    });




      router.post("/getPdf", authentication.authenticateToken, (req, res) => {

        const orderDetails = req.body;
        const pdfPath = pdfService.getPdfPath(orderDetails.id);
        if (fs.existsSync(pdfPath)) {
          res.contentType("application/pdf");
          fs.createReadStream(pdfPath).pipe(res);
        } else {

    
          if (orderDetails.role === 'user') {
            query = "select * from bill INNER JOIN users ON bill.userId=users.id and users.id=? and bill.uuid=?;";
            myConnection.query(query, [orderDetails.userId, orderDetails.id], async (err, dataFinalTotal) => {
              if (err) {
                return res.status(500).json(err);
              }
              if (!dataFinalTotal.length) {
                return res.status(404).json({ message: "Bill not found" });
              }

              const { filteredData, totalAmount } = extractProductData(dataFinalTotal[0].productData);
              try {
                await pdfService.generateInvoice(orderDetails.id, buildTemplatePayload(filteredData, {
                  name: dataFinalTotal[0].name,
                  email: dataFinalTotal[0].email,
                  phone: dataFinalTotal[0].phone,
                  paymentType: dataFinalTotal[0].paymentMethod,
                  total: totalAmount,
                }));
                let timeSet = {
                  modifiedDate: new Date(Date.now()),
                  PDFGeneratedTimes:dataFinalTotal[0].PDFGeneratedTimes + 1
                }
                query = "UPDATE bill SET ? WHERE bill.uuid = ?";
                myConnection.query(query, [timeSet, orderDetails.id], (errorsForBill) => {
                  if (errorsForBill) {
                    return res.status(500).json(errorsForBill);
                  }
                  res.contentType("application/pdf");
                  fs.createReadStream(pdfPath).pipe(res);
                });
              } catch (error) {
                console.log(error);
                return res.status(500).json(error);
              }
            });

          } else {

            query = "select * from bill where bill.uuid=?;";
            myConnection.query(query, [orderDetails.id], async (err, responseForAdmin) => {
              if (err) {
                return res.status(500).json(err);
              }
              if (!responseForAdmin.length) {
                return res.status(404).json({ message: "Bill not found" });
              }

              const { filteredData, totalAmount } = extractProductData(responseForAdmin[0].productData);

              try {
                await pdfService.generateInvoice(orderDetails.id, buildTemplatePayload(filteredData, {
                  name: responseForAdmin[0].name,
                  email: responseForAdmin[0].email,
                  phone: responseForAdmin[0].phone,
                  paymentType: responseForAdmin[0].paymentMethod,
                  total: totalAmount,
                }));
                let timeSet = {
                  modifiedDate: new Date(Date.now()),
                  PDFGeneratedTimes:responseForAdmin[0].PDFGeneratedTimes + 1
                }  
                query = "UPDATE bill SET ? WHERE bill.uuid = ?";
                myConnection.query(query, [timeSet, orderDetails.id], (errorsForBill) => {
                  if (errorsForBill) {
                    return res.status(500).json(errorsForBill);
                  }
                  res.contentType("application/pdf");
                  fs.createReadStream(pdfPath).pipe(res);
                });
              } catch (error) {
                console.log(error);
                return res.status(500).json(error);
              }
            });
          }
        }
      });


      router.get("/getBills", authentication.authenticateToken, (req, res) => {
        query = "SELECT * from bill ORDER BY id DESC";
        myConnection.query(query, (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          } else {
            return res.status(200).json(data);
          }
        });
      });

      router.get("/getBillsUsers/:id", authentication.authenticateToken, (req, res) => {
        const id = req.params.id;
        query = "SELECT * from bill where userId= ?";
        myConnection.query(query, [id], (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          } else {
            return res.status(200).json(data);
          }
        });
      });


      router.delete("/delete/:id", authentication.authenticateToken, (req, res, next) => {
        const id = req.params.id;
        query = "DELETE FROM bill where uuid=?";
        myConnection.query(query, [id], (err, data) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            if (data.affectedRows == 0) {
              return res.status(404).json({
                message: "Invalid Data provided!"
              });
            }
            return res.status(200).json({
              message: "Bill Deleted Successfully !"
            });
          }

        });
      });

      module.exports = router;
