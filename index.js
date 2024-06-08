import express, { response } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "temp.pdf");
  },
});

const upload = multer({ storage: storage });

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const urlBSRE = "http://10.0.8.80";
const username = "esign";
const password = "qwerty";

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/user/status", (req, res) => {
  axios
    .get(`${urlBSRE}/api/user/status/0803202100007062`, {
      auth: {
        username: username,
        password: password,
      },
    })
    .then(function (response) {
      console.log(response.status);
      res.json(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/api/user/profile", (req, res) => {
  axios
    .get(`${urlBSRE}/api/user/profile/0803202100007062`, {
      auth: {
        username: username,
        password: password,
      },
    })
    .then(function (response) {
      console.log(response.status);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/api/sign/pdf", upload.single("pdf"), (req, res) => {
  console.log(req.file);
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  let data = new FormData();

  data.append("file", fs.createReadStream(filePath));
  data.append("nik", "0803202100007062");
  data.append("passphrase", "Hantek1234.!");
  data.append("tampilan", "invisible");

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${urlBSRE}/api/sign/pdf`,
    headers: {
      ...data.getHeaders(),
    },
    auth: {
      username: username,
      password: password,
    },
    data: data,
    responseType: 'arraybuffer',
  };

  axios
    .request(config)
    .then((response) => {
      console.log(response.status);
      fs.writeFile(`sign/${fileName}`, response.data, (err) => {
        if (err) throw err;
        console.log("File Succesfully saved!!");
        res.send("PDF signed and saved successfully!");
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
