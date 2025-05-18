const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieparser());

app.use('/api/auth', require('./routes/autheRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/learning-path', require('./routes/learningPathRoutes'));
app.use('/api/resume', require('./routes/resumeroutes'));
app.use('/api/mock-interview', require('./routes/MockInterviewRoutes'));

const port = process.env.PORT || 6000;

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
