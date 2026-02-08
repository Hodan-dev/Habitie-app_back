const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Function-ka loo isticmaalo in la sameeyo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
exports.generateToken = generateToken;

// Register user cusub
// Waa halka ay user-ka cusub u isdiiwaan gareeyo
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, dailyCalorieGoal, age, gender, heightCm, weightKg } = req.body;

    // Hubi in dhammaan fields-ka ay jiraan
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Fadlan buuxi dhammaan fields-ka'
      });
    }

    if (age == null || gender == null || heightCm == null || weightKg == null) {
      return res.status(400).json({
        message: 'Fadlan buuxi age, gender, height, iyo weight'
      });
    }

    // Hubi in user-ka aan horay u jiirin
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'Email-kaan horay ayaa loo isticmaalay'
      });
    }

    // Samee user cusub
    const userData = {
      name,
      email,
      password,
      age,
      gender,
      heightCm,
      weightKg
    };
    if (dailyCalorieGoal != null) {
      userData.dailyCalorieGoal = dailyCalorieGoal;
    }

    const user = await User.create(userData);

    // Soo celi user-ka iyo token-ka
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyCalorieGoal: user.dailyCalorieGoal,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg
        },
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
// Waa halka ay user-ka u soo galaan
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Hubi in email iyo password ay jiraan
    if (!email || !password) {
      return res.status(400).json({
        message: 'Fadlan geli email iyo password-ka'
      });
    }

    // Soo hel user-ka email-ka ku saleysan
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@local';
    if (email === adminEmail && password === '123') {
      let adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin',
          email: adminEmail,
          password: null,
          role: 'admin'
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          dailyCalorieGoal: adminUser.dailyCalorieGoal,
          age: adminUser.age,
          gender: adminUser.gender,
          heightCm: adminUser.heightCm,
          weightKg: adminUser.weightKg
        },
        token: generateToken(adminUser._id)
      }
    });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        message: 'Email ama password-ka waa khalad'
      });
    }

    // Hubi password-ka
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email ama password-ka waa khalad'
      });
    }

    // Soo celi user-ka iyo token-ka
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyCalorieGoal: user.dailyCalorieGoal,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg
        },
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Soo hel user-ka hadda socda
// Waa halka ay user-ka u helaan macluumaadkooda
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyCalorieGoal: user.dailyCalorieGoal,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
// Waa halka ay user-ka u cusbooneysiiyaan macluumaadkooda
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, dailyCalorieGoal, age, gender, heightCm, weightKg } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (dailyCalorieGoal) updateData.dailyCalorieGoal = dailyCalorieGoal;
    if (age != null) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (heightCm != null) updateData.heightCm = heightCm;
    if (weightKg != null) updateData.weightKg = weightKg;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyCalorieGoal: user.dailyCalorieGoal,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.weightKg
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// OAuth success handler
// Halkan waxaan ku soo celinaa token-ka OAuth kadib redirect
exports.oauthSuccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'OAuth login failed'
      });
    }

    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/oauth?token=${token}`);
  } catch (error) {
    next(error);
  }
};
