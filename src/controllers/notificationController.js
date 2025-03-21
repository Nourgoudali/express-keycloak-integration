const Notification = require('../models/notificationModel');

// Créer une nouvelle notification
exports.createNotification = (req, res) => {
  const { recipient, message, type } = req.body;
  
  const notification = new Notification({
    recipient: type === 'cible' ? recipient : null,
    message,
    type
  });

  notification.save()
    .then(savedNotification => {
      res.status(201).json({
        success: true,
        data: savedNotification
      });
    })
    .catch(error => {
      res.status(400).json({
        success: false,
        message: error.message
      });
    });
};

exports.getNotifications = (req, res) => {
  const userId = req.query.userId;
  
  Notification.find({
    $or: [
      { type: 'global' },
      { recipient: userId }
    ]
  })
    .sort({ createdAt: -1 })
    .then(notifications => {
      res.status(200).json({
        success: true,
        data: notifications
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });
};

// Obtenir une notification spécifique par ID
exports.getNotificationById = (req, res) => {
  Notification.findById(req.params.id)
    .then(notification => {
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }
      res.status(200).json({
        success: true,
        data: notification
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });
};

// Supprimer une notification
exports.deleteNotification = (req, res) => {
  Notification.findByIdAndDelete(req.params.id)
    .then(notification => {
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Notification supprimée avec succès'
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });
};

// Mettre à jour une notification
exports.updateNotification = (req, res) => {
  const { message, type, recipient } = req.body;
  
  Notification.findByIdAndUpdate(
    req.params.id,
    {
      message,
      type,
      recipient: type === 'cible' ? recipient : null
    },
    { new: true }
  )
    .then(updatedNotification => {
      if (!updatedNotification) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }
      res.status(200).json({
        success: true,
        data: updatedNotification
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });
};