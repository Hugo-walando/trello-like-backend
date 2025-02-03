const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté !');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB :', error);
    process.exit(1); // Stoppe l’application en cas d’échec
  }
};

module.exports = connectDB;
