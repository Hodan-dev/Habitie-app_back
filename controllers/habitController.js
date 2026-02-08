const Habit = require('../models/Habit');
const { isHabitCompleted } = require('../services/models/healthModels');

// Soo hel dhammaan habit-ka user-ka
// Waa halka ay user-ka u helaan dhammaan habit-ka
exports.getHabits = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = { user: req.user.id };
    let streakEndDate = new Date();

    // Haddii la soo diray taariikh, filter garee
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      streakEndDate = endDate;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const habits = await Habit.find(query).sort({ date: -1, name: 1 });

    // Xisaabi streak-ka habit kasta (maalmaha isku xiga ee la dhameeyay)
    const names = [...new Set(habits.map((h) => h.name))];
    const streakMap = {};

    for (const name of names) {
      const history = await Habit.find({
        user: req.user.id,
        name: name,
        date: { $lte: streakEndDate }
      }).sort({ date: -1 });

      let streak = 0;
      let lastDate = null;

      for (const h of history) {
        if (!isHabitCompleted(h)) {
          break;
        }

        const currentDate = new Date(h.date);
        currentDate.setHours(0, 0, 0, 0);

        if (lastDate == null) {
          streak = 1;
          lastDate = currentDate;
          continue;
        }

        const diffDays = Math.round(
          (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          streak += 1;
          lastDate = currentDate;
        } else {
          break;
        }
      }

      streakMap[name] = streak;
    }

    const habitsWithStreak = habits.map((habit) => {
      const streakDays = streakMap[habit.name] || 0;
      const daysToContinue = habit.daysToContinue || 0;
      const daysRemaining =
        daysToContinue > 0 ? Math.max(0, daysToContinue - streakDays) : 0;

      return {
        ...habit.toObject(),
        streakDays: streakDays,
        daysRemaining: daysRemaining
      };
    });

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habitsWithStreak
    });
  } catch (error) {
    next(error);
  }
};

// Soo hel habit gaar ah
// Waa halka ay user-ka u helaan habit gaar ah
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Habit-kaan ma heli karo'
      });
    }

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// Samee habit cusub
// Waa halka ay user-ka u sameeyaan habit cusub
exports.createHabit = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const daysToContinue = Number(req.body.daysToContinue) || 0;
    const startDate = req.body.date ? new Date(req.body.date) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const createList = [];
    const totalDays = daysToContinue > 0 ? daysToContinue : 1;

    for (let i = 0; i < totalDays; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const exists = await Habit.findOne({
        user: req.user.id,
        name: req.body.name,
        date: {
          $gte: dayStart,
          $lte: dayEnd
        }
      });

      if (exists) {
        continue;
      }

      const payload = {
        ...req.body,
        date: dayStart,
        completed: false,
        value: req.body.value || 0
      };

      // Haddii targetValue iyo value la soo diro, xisaabi completed
      if (payload.targetValue != null && payload.value != null) {
        payload.completed =
          Number(payload.value) >= Number(payload.targetValue);
      }

      createList.push(payload);
    }

    const created = createList.length > 0
      ? await Habit.insertMany(createList)
      : [];

    res.status(201).json({
      success: true,
      data: created[0] || null,
      createdCount: created.length
    });
  } catch (error) {
    next(error);
  }
};

// Update habit
// Waa halka ay user-ka u cusbooneysiiyaan habit
exports.updateHabit = async (req, res, next) => {
  try {
    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        message: 'Habit-kaan ma heli karo'
      });
    }

    // Hubi in user-ku leeyahay habit-kaan
    if (habit.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Ma aad xaq u leh inaad cusbooneysiiso habit-kaan'
      });
    }

    const updateData = { ...req.body };

    // Haddii targetValue ama value la cusbooneysiiyo, xisaabi completed
    const newTarget =
      updateData.targetValue != null ? updateData.targetValue : habit.targetValue;
    const newValue = updateData.value != null ? updateData.value : habit.value;

    if (newTarget != null && newValue != null) {
      updateData.completed = Number(newValue) >= Number(newTarget);
    }

    habit = await Habit.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// Tirtir habit
// Waa halka ay user-ka u tirtiraan habit
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        message: 'Habit-kaan ma heli karo'
      });
    }

    // Hubi in user-ku leeyahay habit-kaan
    if (habit.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Ma aad xaq u leh inaad tirtirto habit-kaan'
      });
    }

    await habit.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Habit-ka waa la tirtiray'
    });
  } catch (error) {
    next(error);
  }
};

// Mark habit as completed
// Waa halka ay user-ka u calaamadeeyaan inay habit-ka dhameeyeen
exports.toggleHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        message: 'Habit-kaan ma heli karo'
      });
    }

    // Hubi in user-ku leeyahay habit-kaan
    if (habit.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Ma aad xaq u leh inaad beddesho habit-kaan'
      });
    }

    habit.completed = !habit.completed;
    await habit.save();

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};
