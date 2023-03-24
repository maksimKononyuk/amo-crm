import express from 'express';
import router from './routes/leads.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(cors());
app.use('/api/', router);
if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    });
}
const PORT = +process.env.PORT || 5000;
const start = async () => {
    try {
        app.listen(PORT, () => console.log('Сервер запущен на ' +
            PORT +
            ' порту...' +
            ` в режиме ${process.env.NODE_ENV}`));
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
};
start();
