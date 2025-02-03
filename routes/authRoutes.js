const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authMiddleware = require('../middleswares/authMiddleware');

const router = express.Router();

// Route pour enregistrer un utilisateur
router.post('/register', async (req, res) => {
  console.log('Requête reçue : ', req.body); // Log du corps de la requête

  const { username, email, password } = req.body;

  // Vérification des champs requis
  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    console.log('Champs manquants'); // Log si des champs sont manquants
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    console.log('Recherche utilisateur avec email :', email);
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Utilisateur déjà existant');
      return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    console.log('Création du nouvel utilisateur');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    console.log('Enregistrement dans la base de données');
    await newUser.save();
    console.log('Utilisateur créé avec succès');
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparer le mot de passe avec le mot de passe haché dans la base de données
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Créer un JWT avec un payload qui contient l'ID de l'utilisateur
    console.log('Clé secrète : ', process.env.JWT_SECRET); // Ajoute cette ligne pour vérifier si la clé est chargée
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Ici, tu peux récupérer l'utilisateur de la base de données en utilisant req.userId
    console.log('User dans la route:', req.user);

    const user = await User.findById(req.user.userId);

    // Si l'utilisateur est trouvé, on renvoie ses informations
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

router.put('/:cardId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const { cardId } = req.params;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Carte non trouvée' });
    }

    // Vérifier que le tableau auquel appartient la carte appartient bien à l'utilisateur
    const board = await Board.findOne({
      _id: card.boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    card.status = status;
    await card.save();

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;
