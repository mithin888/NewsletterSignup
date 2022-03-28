const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const listId = "4918a7b52e";
mailchimp.setConfig({
  apiKey: "a4e03e45a92d5bfa5842cdc71cc9bf55-us14",
  server: "us14",
});

const run = async (req, res) => {
  await mailchimp.lists
    .batchListMembers(listId, {
      members: [
        {
          email_address: req.body.email,
          status: "subscribed",
          merge_fields: {
            FNAME: req.body.firstName,
            LNAME: req.body.lastName,
          },
        },
      ],
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
        console.log(res.statusCode, res);
        res.sendFile(`${__dirname}/success.html`);
        console.log(
          `Succesfully signed up ${res.req.body.firstName} ${res.req.body.lastName} to the newsletter`
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});
