const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const pdf = require("html-pdf");
const config = require("../config");

const ensureOutputDir = () => {
  fs.mkdirSync(config.pdf.outputDir, { recursive: true });
};

const renderTemplate = (templateData) =>
  new Promise((resolve, reject) => {
    ejs.renderFile(config.pdf.templatePath, templateData, (err, html) => {
      if (err) {
        return reject(err);
      }
      return resolve(html);
    });
  });

const writePdf = (html, pdfPath) =>
  new Promise((resolve, reject) => {
    pdf.create(html).toFile(pdfPath, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(pdfPath);
    });
  });

const generateInvoice = async (filename, templateData) => {
  ensureOutputDir();
  const pdfPath = path.join(config.pdf.outputDir, `${filename}.pdf`);
  const html = await renderTemplate(templateData);
  await writePdf(html, pdfPath);
  return pdfPath;
};

const getPdfPath = (filename) => path.join(config.pdf.outputDir, `${filename}.pdf`);

module.exports = {
  generateInvoice,
  getPdfPath,
};

