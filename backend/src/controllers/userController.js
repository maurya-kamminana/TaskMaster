const { User } = require('../models');

exports.getUserById = async (req, res) => {
  try {
    if(req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden you can only get your user data not others' });
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }  // Exclude the password_hash field
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};