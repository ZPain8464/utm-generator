const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;
const { NODE_ENV } = require("./config");

const app = express();

require('dotenv').config();

const PORT = process.env.PORT;

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}))
    .use(cors())
    .use(express.json())
    .use(express.urlencoded())
    .use(express.static('public'));

app.get("/", (req, res) => {
    console.log("hello, you hit the utm gen server");
})

app.get('/apps_script', (req, res) => {
    if (NODE_ENV === "development") {
        const sheetsUrl = process.env.SHEETS_URL_TESTING;
        res.status(200).json(sheetsUrl);
    }
    if (NODE_ENV === "production") { 
        const sheetsUrl = process.env.SHEETS_URL_PROD;
        res.status(200).json(sheetsUrl);
    }
})

app.get('/fields_data', async (req, res) => {
    let fields_data = __dirname + '/field_options/dropdown_fields.json';
    try {
        const dropdown_list = await fs.readFile(fields_data, 'utf-8', (err, data) => data);
        res.status(200).send(dropdown_list);
    } catch(error) {
        return res.status(409).json({error: "Couldn't read file"});
    }
    
});

app.listen(PORT, () => {
    console.log(NODE_ENV);
    console.log(`server running successfully: ${NODE_ENV}`);
});