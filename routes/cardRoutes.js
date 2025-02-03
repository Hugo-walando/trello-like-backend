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
    const { cardId } = req.params;
    const { title, status } = req.body; // Ici, title est la nouvelle valeur, et status est optionnel

    // On récupère la carte
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Carte non trouvée' });
    }

    // Vérifier que le tableau auquel appartient la carte est bien celui de l'utilisateur connecté
    const board = await Board.findOne({
      _id: card.boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    // Mettre à jour les champs souhaités
    if (title) card.title = title;
    // On peut aussi autoriser la mise à jour du statut si besoin
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      card.status = status;
    }

    await card.save();
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

router.delete('/:cardId', authMiddleware, async (req, res) => {
  try {
    const { cardId } = req.params;

    // Récupérer la carte
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Carte non trouvée' });
    }

    // Vérifier que le tableau associé appartient bien à l'utilisateur connecté
    const board = await Board.findOne({
      _id: card.boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(403).json({ message: 'Accès interdit au tableau' });
    }

    // Supprimer la carte
    await Card.findByIdAndDelete(cardId); // Utilisation de findByIdAndDelete au lieu de card.remove()

    res.json({ message: 'Carte supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;
