const Fournisseur = require('../models/fournisseurModel');

exports.createFournisseur = (req, res) => {
  const fournisseur = new Fournisseur(req.body);
  fournisseur.save()
    .then(savedFournisseur => res.status(201).json(savedFournisseur))
    .catch(error => res.status(400).json({ error: error.message }));
};

exports.getAllFournisseurs = (req, res) => {
  Fournisseur.find()
    .then(fournisseurs => res.json(fournisseurs))
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.getFournisseurById = (req, res) => {
  Fournisseur.findById(req.params.id)
    .then(fournisseur => {
      if (!fournisseur) return res.status(404).json({ error: 'Fournisseur not found' });
      res.json(fournisseur);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.updateFournisseur = (req, res) => {
  Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(fournisseur => {
      if (!fournisseur) return res.status(404).json({ error: 'Fournisseur not found' });
      res.json(fournisseur);
    })
    .catch(error => res.status(400).json({ error: error.message }));
};

exports.deleteFournisseur = (req, res) => {
  Fournisseur.findByIdAndDelete(req.params.id)
    .then(fournisseur => {
      if (!fournisseur) return res.status(404).json({ error: 'Fournisseur not found' });
      res.json({ message: 'Fournisseur deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};