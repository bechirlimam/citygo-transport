const express = require('express');
const bodyParser = require('body-parser');
const payments = require('./routes/payments');
const reservations = require('./routes/reservations');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/payment', payments);
app.use('/api/reservations', reservations);

app.get('/', (req, res) => res.send('CityGo Transport backend'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
