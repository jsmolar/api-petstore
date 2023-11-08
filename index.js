const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const fs = require("fs");
const YAML = require('yaml');
const path = require('path');

require('dotenv').config();


const port = 8080;

app.use(express.json());
app.use('/static', express.static('static'));

const file = fs.readFileSync('./openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

var options = {
  swaggerOptions: {
    showExtensions: true
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));


app.get('/', function(req, res) {
  res.redirect('/docs');
});

let pets = [
  { id: 1, name: 'Max', type: 'Dog', status: 'available' },
  { id: 2, name: 'Doggo', type: 'Dog', status: 'available' }
];

app.get('/server/details', function (req, res) {
  const region = process.env.REGION;
  if (region) {
    // Construct the path to the SVG file based on the region.
    const svgFilePath = `/static/${region}.svg`; // Make sure the path matches your static files setup.

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Details</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            background: url('${svgFilePath}') no-repeat center center fixed;
            background-size: cover; /* Cover the entire viewport */
          }
        </style>
      </head>
      <body>
        <!-- The body background image is now the SVG -->
      </body>
      </html>
    `;
    res.send(htmlResponse);
  } else {
    res.status(404).send('REGION environment variable not found.');
  }
});

app.get('/api/v3/pet/findByStatus', (req, res) => {
  const status = req.query.status || 'available';
  const filteredPets = pets.filter(p => p.status === status);
  res.status(200).json(filteredPets);
});

app.get('/api/v3/user/login', (req, res) => {
  const { username, password } = req.query;
  if (username === 'admin' && password === 'admin') {
    res.status(200).json({ message: "User logged in successfully" });
  } else {
    res.status(400).json({ message: "Invalid username/password supplied" });
  }
});

app.get('/api/v3/store/inventory', (req, res) => {
  const inventory = {
    available: 10,
    pending: 5,
    sold: 3
  };
  res.status(200).json(inventory);
});

app.get('/api/v3/store/admin', (req, res) => {
  const msg = {
    message: 'You are an admin!'
  };
  res.status(200).json(msg);
});


app.listen(port, () => {
  console.log(`Petstore API server listening at http://localhost:${port}`);
  console.log(`Swagger UI Docs: http://localhost:${port}/docs/`);
});

process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  process.exit(1);
});