const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ✅ MongoDB Atlas Connection
mongoose.connect(
  'mongodb+srv://22pa1a1285:22pa1a1285@pavansir.ftnes7d.mongodb.net/pavansir?retryWrites=true&w=majority&appName=pavansir',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

app.use('/api/students', studentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
