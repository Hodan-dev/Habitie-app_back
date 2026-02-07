const Meal = require('../models/Meal');
const Habit = require('../models/Habit');
const User = require('../models/User');

// Soo hel analytics-ka maalinta
// Waa halka ay user-ka u helaan warbixinta maalinta
exports.getDailyAnalytics = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Soo hel user-ka si aad u hesho calorie goal-ka
    const user = await User.findById(req.user.id);
    const dailyCalorieGoal = user.dailyCalorieGoal || 2000;

    // Soo hel dhammaan cuntada maalinta
    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Hubi healthy breakfast (quraac <= 400 calories)
    const healthyBreakfast = meals.some(
      (m) => m.type === 'breakfast' && m.calories <= 400
    );

    // Xisaabi wadarta calorie-ka
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    // Go'aami heerka calorie-ka
    let calorieStatus = 'on_track';
    const percentage = (totalCalories / dailyCalorieGoal) * 100;
    
    if (percentage >= 100) {
      calorieStatus = 'over_limit';
    } else if (percentage >= 80) {
      calorieStatus = 'near_limit';
    }

    // Soo hel dhammaan habit-ka maalinta
    const habits = await Habit.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Hubi water goal (8 glasses)
    const waterHabit = habits.find((h) => h.name === 'water');
    const waterTarget = waterHabit?.targetValue != null ? waterHabit.targetValue : 8;
    const waterGoalMet = waterHabit
      ? (waterHabit.value || 0) >= waterTarget || waterHabit.completed === true
      : false;

    // Xisaabi habit completion rate
    const completedHabits = habits.filter(h => h.completed).length;
    const totalHabits = habits.length;
    const habitCompletionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    // Healthy day haddii breakfast iyo water goal la buuxiyo
    const healthyDay = healthyBreakfast && waterGoalMet;

    res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        calories: {
          total: totalCalories,
          goal: dailyCalorieGoal,
          remaining: Math.max(0, dailyCalorieGoal - totalCalories),
          percentage: Math.min(100, percentage),
          status: calorieStatus
        },
        meals: {
          total: meals.length,
          breakdown: {
            breakfast: meals.filter(m => m.type === 'breakfast').length,
            lunch: meals.filter(m => m.type === 'lunch').length,
            snack: meals.filter(m => m.type === 'snack').length,
            dinner: meals.filter(m => m.type === 'dinner').length
          }
        },
        habits: {
          total: totalHabits,
          completed: completedHabits,
          completionRate: Math.round(habitCompletionRate)
        },
        healthy: {
          breakfast: healthyBreakfast,
          waterGoalMet: waterGoalMet,
          healthyDay: healthyDay
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Soo hel analytics-ka toddobaadka
// Waa halka ay user-ka u helaan warbixinta toddobaadka
exports.getWeeklyAnalytics = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    // Soo hel taariikhda dhamaadka toddobaadka
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const user = await User.findById(req.user.id);
    const dailyCalorieGoal = user.dailyCalorieGoal || 2000;

    // Soo hel dhammaan cuntada toddobaadka
    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    // Soo hel dhammaan habit-ka toddobaadka
    const habits = await Habit.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    });

    // Xisaabi maalinta kasta
    const dailyData = [];
    let healthyDays = 0;
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.date);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      const dayHabits = habits.filter(h => {
        const habitDate = new Date(h.date);
        return habitDate >= dayStart && habitDate <= dayEnd;
      });

      const dayHealthyBreakfast = dayMeals.some(
        (m) => m.type === 'breakfast' && m.calories <= 400
      );
      const dayWaterHabit = dayHabits.find((h) => h.name === 'water');
      const dayWaterTarget =
        dayWaterHabit?.targetValue != null ? dayWaterHabit.targetValue : 8;
      const dayWaterGoalMet = dayWaterHabit
        ? (dayWaterHabit.value || 0) >= dayWaterTarget || dayWaterHabit.completed === true
        : false;
      const dayHealthy = dayHealthyBreakfast && dayWaterGoalMet;
      if (dayHealthy) healthyDays += 1;

      const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const completedHabits = dayHabits.filter(h => h.completed).length;

      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        calories: dayCalories,
        meals: dayMeals.length,
        completedHabits: completedHabits,
        totalHabits: dayHabits.length,
        healthyDay: dayHealthy,
        healthyBreakfast: dayHealthyBreakfast,
        waterGoalMet: dayWaterGoalMet
      });
    }

    // Xisaabi wadarta toddobaadka
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const averageCalories = totalCalories / 7;
    const totalCompletedHabits = habits.filter(h => h.completed).length;

    const healthyCompletionRate = (healthyDays / 7) * 100;
    const daysRemaining =
      start.toISOString().split('T')[0] <= todayKey && todayKey <= end.toISOString().split('T')[0]
        ? 6 - Math.min(6, Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24))))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        summary: {
          totalCalories: totalCalories,
          averageCalories: Math.round(averageCalories),
          dailyGoal: dailyCalorieGoal,
          totalMeals: meals.length,
          totalCompletedHabits: totalCompletedHabits,
          healthyDays: healthyDays,
          healthyCompletionRate: Math.round(healthyCompletionRate),
          daysRemaining: daysRemaining
        },
        dailyData: dailyData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Soo hel analytics-ka bilaha
// Waa halka ay user-ka u helaan warbixinta bilaha
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const targetDate = year && month ? new Date(year, month - 1, 1) : new Date();
    
    const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const user = await User.findById(req.user.id);
    const dailyCalorieGoal = user.dailyCalorieGoal || 2000;

    // Soo hel dhammaan cuntada bilaha
    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Soo hel dhammaan habit-ka bilaha
    const habits = await Habit.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Xisaabi wadarta bilaha
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const daysInMonth = endDate.getDate();
    const averageCalories = totalCalories / daysInMonth;
    
    const totalCompletedHabits = habits.filter(h => h.completed).length;
    const totalHabits = habits.length;
    const habitCompletionRate = totalHabits > 0 ? (totalCompletedHabits / totalHabits) * 100 : 0;

    // Healthy days ee bilaha (breakfast <= 400 + water >= 8)
    let healthyDays = 0;
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.date);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });
      const dayHabits = habits.filter(h => {
        const habitDate = new Date(h.date);
        return habitDate >= dayStart && habitDate <= dayEnd;
      });

      const dayHealthyBreakfast = dayMeals.some(
        (m) => m.type === 'breakfast' && m.calories <= 400
      );
      const dayWaterHabit = dayHabits.find((h) => h.name === 'water');
      const dayWaterTarget =
        dayWaterHabit?.targetValue != null ? dayWaterHabit.targetValue : 8;
      const dayWaterGoalMet = dayWaterHabit
        ? (dayWaterHabit.value || 0) >= dayWaterTarget || dayWaterHabit.completed === true
        : false;

      if (dayHealthyBreakfast && dayWaterGoalMet) healthyDays += 1;
    }

    const healthyCompletionRate = daysInMonth > 0 ? (healthyDays / daysInMonth) * 100 : 0;
    const daysRemaining =
      today.getFullYear() === targetDate.getFullYear() &&
      today.getMonth() === targetDate.getMonth()
        ? daysInMonth - today.getDate()
        : 0;

    // Xisaabi breakdown-ka noocyada cuntada
    const mealBreakdown = {
      breakfast: meals.filter(m => m.type === 'breakfast').length,
      lunch: meals.filter(m => m.type === 'lunch').length,
      snack: meals.filter(m => m.type === 'snack').length,
      dinner: meals.filter(m => m.type === 'dinner').length
    };

    res.status(200).json({
      success: true,
      data: {
        period: {
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalCalories: totalCalories,
          averageCalories: Math.round(averageCalories),
          dailyGoal: dailyCalorieGoal,
          totalMeals: meals.length,
          mealBreakdown: mealBreakdown,
          totalHabits: totalHabits,
          completedHabits: totalCompletedHabits,
          habitCompletionRate: Math.round(habitCompletionRate),
          healthyDays: healthyDays,
          healthyCompletionRate: Math.round(healthyCompletionRate),
          daysRemaining: daysRemaining
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
