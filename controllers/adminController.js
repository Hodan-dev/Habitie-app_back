const User = require('../models/User');

// Soo hel dhammaan users (admin kaliya)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Samee user cusub (admin kaliya)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, dailyCalorieGoal } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      dailyCalorieGoal: dailyCalorieGoal || 2000
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin kaliya)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, dailyCalorieGoal } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name != null) user.name = name;
    if (email != null) user.email = email;
    if (role != null) user.role = role;
    if (dailyCalorieGoal != null) user.dailyCalorieGoal = dailyCalorieGoal;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin kaliya)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
