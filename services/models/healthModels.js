const formatDate = (date) => date.toISOString().split('T')[0];

const isHabitCompleted = (habit) => {
  if (!habit) return false;
  const target = habit.targetValue;
  const value = habit.value;
  if (target != null && value != null) {
    return Number(value) >= Number(target);
  }
  return habit.completed === true;
};

const computeCompletionRate = (habits) => {
  const total = habits.length;
  const completed = habits.filter((h) => isHabitCompleted(h)).length;
  const rate = total > 0 ? (completed / total) * 100 : 0;
  return { total, completed, rate };
};

const calculateBmr = (gender, weightKg, heightCm, age) => {
  if (!gender || !weightKg || !heightCm || !age) return null;
  // Mifflin-St Jeor (metric)
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return null;
};

const computeStreak = (completedDates, startDate, maxDays = 60) => {
  let streak = 0;
  for (let i = 0; i < maxDays; i += 1) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    if (completedDates.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

const computeSlope = (values) => {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i += 1) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
};

const genderToNumeric = (gender) => {
  if (gender === 'male') return 1;
  if (gender === 'female') return 0;
  return 0.5;
};

const computeTendencyScore = (avgCalories, dailyGoal, completionRate, gender) => {
  const goal = dailyGoal > 0 ? dailyGoal : avgCalories;
  const goalDiff = avgCalories - goal;
  const completionFactor = (completionRate - 50) / 50;
  const genderFactor = genderToNumeric(gender);

  // Simple multiple linear regression-style score (academic-friendly weights)
  const wGoal = 1.0;
  const wCompletion = 120;
  const wGender = 60;

  return Math.round(wGoal * goalDiff + wCompletion * completionFactor + wGender * genderFactor);
};

module.exports = {
  formatDate,
  isHabitCompleted,
  computeCompletionRate,
  calculateBmr,
  computeStreak,
  computeSlope,
  computeTendencyScore,
};
