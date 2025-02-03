const express = require('express');
const authMiddleware = require('../middleswares/authMiddleware');
const Board = require('../models/Board');

const router = express.Router();

// Créer un nouveau tableau
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }

    const board = new Board({ title, userId: req.user.userId });
    await board.save();

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Récupérer tous les tableaux de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.userId });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;
