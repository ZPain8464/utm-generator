const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;

const app = express();

require('dotenv').config();

const PORT = "3000";

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}))
    .use(cors())
    .use(express.json())
    .use(express.urlencoded())
    .use(express.static('public'));

    const API_KEY = process.env.GOOGLE_API_KEY;
    const SHEETS_URL = process.env.SHEETS_URL;
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const SCOPES = process.env.SCOPES;
    const DISCOVERY_DOCS = process.env.DISCOVERY_DOCS;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/main/index.html'));
});

app.get('/googleauth', (req, res) => {
    res.status(200).json({API_KEY, SHEETS_URL, CLIENT_ID, SCOPES, DISCOVERY_DOCS})
})

app.get('/fields_data', async (req, res) => {
    let fields_data = __dirname + '/field_options/dropdown_fields.json';
    try {
        const dropdown_list = await fs.readFile(fields_data, 'utf-8', (err, data) => data);
        res.status(200).send(dropdown_list);
    } catch(error) {
        return res.status(409).json({error: "Couldn't read file"});
    }
    
})

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});