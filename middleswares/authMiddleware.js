const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token
const authMiddleware = (req, res, next) => {
  // Vérifier que l'en-tête contient le token
  const token = req.header('Authorization'); // L'Authorization header devrait contenir "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }

  try {
    // Retirer le mot "Bearer" et ne garder que le token
    const jwtToken = token.split(' ')[1];

    // Vérifier le token avec la clé secrète
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Ajouter les informations de l'utilisateur décodées au requête (pour l'utiliser dans les routes)
    req.user = decoded;

    // Passer au prochain middleware ou route
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;
