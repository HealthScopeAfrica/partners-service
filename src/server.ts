
import express from 'express';
import connectDB from './db/db';
const  server = express();

connectDB();
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

