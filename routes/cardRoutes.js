const express = require('express');
const authMiddleware = require('../middleswares/authMiddleware');
const Card = require('../models/Card');
const Board = require('../models/Board');

const router = express.Router();

// Créer une carte dans un tableau
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      return res
        .status(400)
        .json({ message: 'Le titre et le boardId sont requis' });
    }

    // Vérifier si le tableau appartient à l'utilisateur
    const board = await Board.findOne({
      _id: boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(403).json({ message: 'Accès interdit au tableau' });
    }

    const card = new Card({ title, boardId });
    await card.save();

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Récupérer les cartes d'un tableau
router.get('/:boardId', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;

    // Vérifier si le tableau appartient à l'utilisateur
    const board = await Board.findOne({
      _id: boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(403).json({ message: 'Accès interdit au tableau' });
    }

    const cards = await Card.find({ boardId });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Modifier le statut d'une carte
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

    // Vérifier si la carte appartient bien à un tableau de l'utilisateur
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
