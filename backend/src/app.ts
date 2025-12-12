import express from 'express';
import messageRoutes from './routes/messageRoutes';

const app = express();

app.use(express.json());
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});