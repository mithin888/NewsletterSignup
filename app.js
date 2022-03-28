require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const capitalize = require("capitalize"); // Capitalize the first letter of a string, or all words in a string.

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mailchimp.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.SERVER,
  listID: process.env.LIST_ID,
});

const run = async (req, res) => {
  await mailchimp.lists
    .batchListMembers(mailchimp.config.listID, {
      members: [
        {
          email_address: req.body.email.toLowerCase(),
          status: "subscribed",
          merge_fields: {
            FNAME: capitalize.words(req.body.firstName),
            LNAME: capitalize.words(req.body.lastName),
          },
        },
      ],
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", (req, res) => {
  run(req, res)
    .then(() => {
      if (res.statusCode === 200) {
        res.sendFile(`${__dirname}/success.html`);
        console.log(
          `Succesfully signed up ${capitalize.words(
            req.body.firstName
          )} ${capitalize.words(req.body.lastName)} to the newsletter`
        );
      }
    })
    .catch((err) => {
      res.sendFile(`${__dirname}/failure.html`);
      console.log(err);
      console.log("Error! Status Code:", err.status);
    });
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
