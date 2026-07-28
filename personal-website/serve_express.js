import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const dist = path.join(__dirname, 'dist');

app.use(express.static(dist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

const port = Number(process.env.REACT_APP_LOCAL_PORT || process.env.PORT || 8850);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
