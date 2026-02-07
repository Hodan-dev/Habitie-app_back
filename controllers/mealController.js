const Meal = require('../models/Meal');

// Soo hel dhammaan cuntada user-ka
// Waa halka ay user-ka u helaan dhammaan cuntadooda
exports.getMeals = async (req, res, next) => {
  try {
    const { date, type } = req.query;
    const query = { user: req.user.id };

    // Haddii la soo diray taariikh, filter garee
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Haddii la soo diray nooca, filter garee
    if (type) {
      query.type = type;
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals
    });
  } catch (error) {
    next(error);
  }
};

// Soo hel cunto gaar ah
// Waa halka ay user-ka u helaan cunto gaar ah
exports.getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        message: 'Cuntadan ma heli karo'
      });
    }

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// Samee cunto cusub
// Waa halka ay user-ka u sameeyaan cunto cusub
exports.createMeal = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    const meal = await Meal.create(req.body);

    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// Update cunto
// Waa halka ay user-ka u cusbooneysiiyaan cunto
exports.updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        message: 'Cuntadan ma heli karo'
      });
    }

    // Hubi in user-ku leeyahay cuntadan
    if (meal.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Ma aad xaq u leh inaad cusbooneysiiso cuntadan'
      });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// Tirtir cunto
// Waa halka ay user-ka u tirtiraan cunto
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        message: 'Cuntadan ma heli karo'
      });
    }

    // Hubi in user-ku leeyahay cuntadan
    if (meal.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Ma aad xaq u leh inaad tirtirto cuntadan'
      });
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Cuntada waa la tirtiray'
    });
  } catch (error) {
    next(error);
  }
};
