const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const {
  json
} = require("stream/consumers");

router.post("/GenerateReport", authentication.authenticateToken, (req, res) => {
      let GernerateId = uuid.v1();
      const orderDetails = req.body;
      // var ProductDetailsReport = JSON.parse(orderDetails.productDetails);


      query = "SELECT sum(user_cart.total_price) as Total,users.phone,users.name,users.email,user_cart.cartId as userCartID FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id and user_cart.userCheckOut=1 INNER JOIN users ON user_cart.user_id=users.id and users.id=?";

      myConnection.query(query, [orderDetails.id], (err, dataFinalTotal) => {
        let recreateJson = () => {
          let original = orderDetails.productInfo.result
          original.push({
            resultPriceTotal: orderDetails.productInfo.resultPriceTotal
          });
          return JSON.stringify(original);
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

            myConnection.query(query, [orderDetails.id], (errs, productData) => {

              if (errs) {
                return res.status(500).json(err);
              }

              ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                productDetails: productData,
                name: dataFinalTotal[0].name,
                email: dataFinalTotal[0].email,
                phone: dataFinalTotal[0].phone,
                PaymentType: orderDetails.paymentType,
                totalAmount: dataFinalTotal[0].Total
              }, (err, results) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  pdf.create(results).toFile("./Generatedpdf/" + GernerateId + ".pdf", (err, data) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).json(err);
                    } else {
                      var pdfAttach = fs.readFileSync('./Generatedpdf/' + GernerateId + '.pdf');
                      const transporter = nodemailer.createTransport({
                        ssl: {
                          rejectUnauthorized: false,
                        },
                        tls: {
                          rejectUnauthorized: false,
                        },
                        port: 587,
                        service: "gmail",
                        auth: {
                          user: "YourEmail", // generated ethereal user
                          pass: "YourPassword", // generated ethereal password
                        },
                      });

                      const mailingOptions = {
                        from: "SendingFromEmail", // sender address
                        to: "SendingToEmail", // list of receivers
                        subject: "Order Payment:", // Subject line
                        html: "thank U For Shopping with us ", // html body
                        attachments: [{
                          filename: GernerateId + '.pdf',
                          // path: __dirname + '../Generatedpdf/'+GernerateId+'.pdf'
                          path: './Generatedpdf/' + GernerateId + '.pdf'
                        }],
                      };

                      query = "UPDATE user_cart SET userCheckOut=? where user_id=? and userCheckOut=?";
                      myConnection.query(query, [2, orderDetails.id, 1], (err, results) => {
                        if (err) {
                          return res.status(500).json(err);
                        } else {
                          if (results.affectedRows == 0) {
                            return res.status(404).json({
                              message: "Invalid Data provided!"
                            });
                          }
                        }

                        transporter.sendMail(mailingOptions, (error, info) => {
                          if (error) {
                            console.log(error);
                            query = "INSERT INTO emailSent (emailResults,log) VALUES (?,?)";
                            myConnection.query(query, [error.message,JSON.stringify(info)], (err, results) => {
                              if (err) {
                                return res.status(500).json(err);
                              } else {}
                            });
                          } else {
                            query = "INSERT INTO emailSent (emailResults,log) VALUES (?,?)";
                            myConnection.query(query, [info.response,JSON.stringify(info)], (err, results) => {
                              if (err) {
                                return res.status(500).json(err);
                              } else {}
                            });
                            console.log(`email sent : ${info.response}`);
                          }
                        });
                        query = "DELETE FROM user_cart WHERE user_id = ? AND userCheckOut = ?;";
                        myConnection.query(query, [orderDetails.id, 2], (err, results) => {
                          if (err) {
                            return res.status(500).json(err);
                          } else {
                            if (results.affectedRows == 0) {
                              return res.status(404).json({
                                message: "Invalid Data provided!"
                              });
                            } else {
                              return res.status(200).json({
                                uuid: GernerateId,
                                message: "Thank U for Shoping with US "
                              });
                            }
                          }
                        });
          
                      });
                    }
                  });
                }
              });
            });
          }
        });
      });
    });




      router.post("/getPdf", authentication.authenticateToken, (req, res) => {

        const orderDetails = req.body;
        // return res.status(500).json(orderDetails.id);
        const pdfPath = "./Generatedpdf/" + orderDetails.id + ".pdf";
        if (fs.existsSync(pdfPath)) {
          res.contentType("application/pdf");
          fs.createReadStream(pdfPath).pipe(res);
        } else {

    
          if (orderDetails.role === 'user') {
            query = "select * from bill INNER JOIN users ON bill.userId=users.id and users.id=? and bill.uuid=?;";
            myConnection.query(query, [orderDetails.userId, orderDetails.id], (err, dataFinalTotal) => {
              let resultPriceTotalObject;
              let filteredData = JSON.parse(dataFinalTotal[0].productData).filter(item => {
                if ("resultPriceTotal" in item) {
                  resultPriceTotalObject = {
                    resultPriceTotal: item.resultPriceTotal
                  };
                  return false;
                }
                return true;
              });

              // const filteredData = JSON.parse(dataFinalTotal[0].productData).filter(item => !("resultPriceTotal" in item));
              ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                productDetails: filteredData,
                name: dataFinalTotal[0].name,
                email: dataFinalTotal[0].email,
                phone: dataFinalTotal[0].phone,
                PaymentType: dataFinalTotal[0].paymentMethod,
                totalAmount: resultPriceTotalObject.resultPriceTotal
              }, (err, results) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json(err);
                } else {
                  pdf.create(results).toFile(pdfPath, (err, data) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).json(err);
                    } else {
                      let timeSet = {
                        modifiedDate: new Date(Date.now()),
                        PDFGeneratedTimes:dataFinalTotal[0].PDFGeneratedTimes + 1
                      }
                      query = "UPDATE bill SET ? WHERE bill.uuid = ?";
                      myConnection.query(query, [timeSet, orderDetails.id], (errorsForBill, modifyingBill) => {
                        if (errorsForBill) {
                          return res.status(500).json(errorsForBill);
                        }
                      });
                      res.contentType("application/pdf");
                      fs.createReadStream(pdfPath).pipe(res);
                    }
                  });
                }
              });
            });

          } else {

            query = "select * from bill where bill.uuid=?;";
            myConnection.query(query, [orderDetails.id], (err, responseForAdmin) => {
              let resultPriceTotalObject;
              let filteredData = JSON.parse(responseForAdmin[0].productData).filter(item => {
                if ("resultPriceTotal" in item) {
                  resultPriceTotalObject = {
                    resultPriceTotal: item.resultPriceTotal
                  };
                  return false;
                }
                return true;
              });

              // const filteredData = JSON.parse(dataFinalTotal[0].productData).filter(item => !("resultPriceTotal" in item));
              ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                productDetails: filteredData,
                name: responseForAdmin[0].name,
                email: responseForAdmin[0].email,
                phone: responseForAdmin[0].phone,
                PaymentType: responseForAdmin[0].paymentMethod,
                totalAmount: resultPriceTotalObject.resultPriceTotal
              }, (err, results) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json(err);
                } else {
                  pdf.create(results).toFile(pdfPath, (err, data) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).json(err);
                    } else {
                      let timeSet = {
                        modifiedDate: new Date(Date.now()),
                        PDFGeneratedTimes:responseForAdmin[0].PDFGeneratedTimes + 1
                      }  
                      query = "UPDATE bill SET ? WHERE bill.uuid = ?";
                      myConnection.query(query, [timeSet, orderDetails.id], (errorsForBill, modifyingBill) => {
                        if (errorsForBill) {
                          return res.status(500).json(errorsForBill);
                        }
                      });
                      res.contentType("application/pdf");
                      fs.createReadStream(pdfPath).pipe(res);
                    }
                  });
                }
              });
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
