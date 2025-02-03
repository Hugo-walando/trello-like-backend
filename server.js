const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Charger les variables d’environnement
dotenv.config();

// Connexion à MongoDB
connectDB()
  .then(() => {
    console.log('✅ MongoDB connecté !');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB :', error);
  });

const app = express();
app.use(express.json()); // Pour lire du JSON dans les requêtes
app.use(cors()); // Autoriser les requêtes CORS
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Trello-like fonctionnelle !');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
