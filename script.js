// Ohne persönliches Profil verwendet die App weiterhin 1.490 kcal.
const DEFAULT_BUDGET = 1490;
const STORAGE_KEY = "fitAppDays";
const PROFILE_STORAGE_KEY = "fitAppProfile";

// Durchschnittlich verbrannte Kalorien pro Minute.
const caloriesPerMinute = {
  laufen: 10,
  radfahren: 8,
  schwimmen: 9,
  krafttraining: 6,
  wandern: 5,
  dressurreiten: 5,
  "pferd-longieren": 4,
  "pferd-striegeln": 3,
  hausarbeit: 4
};

const activityFactors = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725
};

const fitnessGoals = {
  lose: {
    label: "Gewicht abnehmen",
    adjustment: -500,
    effect: "Dieses Ziel entspricht einem geschätzten Kaloriendefizit von 500 kcal."
  },
  maintain: {
    label: "Gewicht halten",
    adjustment: 0,
    effect: "Dieses Ziel entspricht dem geschätzten Erhaltungsbedarf."
  },
  gain: {
    label: "Muskeln aufbauen",
    adjustment: 300,
    effect: "Dieses Ziel entspricht einem moderaten Kalorienüberschuss von 300 kcal."
  }
};

const calorieValue = document.querySelector("#calorie-value");
const calorieNumber = calorieValue.querySelector("strong");
const calorieHeading = document.querySelector("#calorie-heading");
const budgetNote = document.querySelector("#budget-note");
const profileForm = document.querySelector("#profile-form");
const profileMessage = document.querySelector("#profile-message");
const profileResult = document.querySelector("#profile-result");
const maintenanceResult = document.querySelector("#maintenance-result");
const fitnessGoalResult = document.querySelector("#fitness-goal-result");
const dailyGoalResult = document.querySelector("#daily-goal-result");
const goalEffect = document.querySelector("#goal-effect");
const mealForm = document.querySelector("#meal-form");
const activityForm = document.querySelector("#activity-form");
const heartRateForm = document.querySelector("#heart-rate-form");
const mealMessage = document.querySelector("#meal-message");
const activityMessage = document.querySelector("#activity-message");
const heartRateMessage = document.querySelector("#heart-rate-message");
const mealList = document.querySelector("#meal-list");
const activityList = document.querySelector("#activity-list");
const heartRateList = document.querySelector("#heart-rate-list");
const mealTotal = document.querySelector("#meal-total");
const activityTotal = document.querySelector("#activity-total");
const mealListHeading = document.querySelector("#meal-list-heading");
const activityListHeading = document.querySelector("#activity-list-heading");
const heartRateListHeading = document.querySelector("#heart-rate-list-heading");
const mealHeading = document.querySelector("#meal-heading");
const activityHeading = document.querySelector("#activity-heading");
const todayButton = document.querySelector("#today-button");
const calendarButton = document.querySelector("#calendar-button");
const calendarPicker = document.querySelector("#calendar-picker");
const calendarDate = document.querySelector("#calendar-date");
const selectedDayLabel = document.querySelector("#selected-day-label");
const pastDayNote = document.querySelector("#past-day-note");

// Erstellt ein Datum im Format JJJJ-MM-TT in der lokalen Zeitzone.
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const todayDate = getTodayDate();
let selectedDate = todayDate;
let calendarIsOpen = false;

// Lädt alle gespeicherten Tage beim Start aus localStorage.
function loadAppData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return {};
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (parsedData && typeof parsedData === "object" && !Array.isArray(parsedData)) {
      return parsedData;
    }

    return {};
  } catch (error) {
    console.warn("Die gespeicherten FitApp-Daten konnten nicht geladen werden.", error);
    return {};
  }
}

let appData = loadAppData();

// Lädt das Profil, das aktuelle Ziel und frühere Zieländerungen.
function loadProfileData() {
  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!savedProfile) {
    return {
      dailyGoal: DEFAULT_BUDGET,
      goalHistory: []
    };
  }

  try {
    const parsedProfile = JSON.parse(savedProfile);

    if (!parsedProfile || typeof parsedProfile !== "object" || Array.isArray(parsedProfile)) {
      return {
        dailyGoal: DEFAULT_BUDGET,
        goalHistory: []
      };
    }

    if (!Array.isArray(parsedProfile.goalHistory)) {
      parsedProfile.goalHistory = [];
    }

    if (!Number.isFinite(parsedProfile.dailyGoal)) {
      parsedProfile.dailyGoal = DEFAULT_BUDGET;
    }

    return parsedProfile;
  } catch (error) {
    console.warn("Das gespeicherte Profil konnte nicht geladen werden.", error);
    return {
      dailyGoal: DEFAULT_BUDGET,
      goalHistory: []
    };
  }
}

let profileData = loadProfileData();

// Speichert Profildaten und Tagesziel dauerhaft im Browser.
function saveProfileData() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
}

// Ermittelt, welches persönliche Ziel an einem bestimmten Datum gültig war.
function getGoalForDate(date) {
  let goal = DEFAULT_BUDGET;
  const sortedHistory = profileData.goalHistory.slice().sort(function (first, second) {
    return first.date.localeCompare(second.date);
  });

  sortedHistory.forEach(function (entry) {
    if (entry.date <= date) {
      goal = entry.goal;
    }
  });

  return goal;
}

function createEmptyDay(date) {
  return {
    dailyGoal: getGoalForDate(date),
    meals: [],
    activities: [],
    heartRates: []
  };
}

// Jeder Datumsschlüssel erhält eigene Listen für seine Tagesdaten.
function getDayData(date) {
  if (!appData[date]) {
    appData[date] = createEmptyDay(date);
  }

  // Ältere gespeicherte Tage erhalten einmalig das damals gültige Ziel.
  if (!Number.isFinite(appData[date].dailyGoal)) {
    appData[date].dailyGoal = getGoalForDate(date);
  }

  if (!Array.isArray(appData[date].meals)) {
    appData[date].meals = [];
  }

  if (!Array.isArray(appData[date].activities)) {
    appData[date].activities = [];
  }

  if (!Array.isArray(appData[date].heartRates)) {
    appData[date].heartRates = [];
  }

  return appData[date];
}

// Nach jeder Änderung werden alle Tage dauerhaft im Browser gespeichert.
function saveAppData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function formatCalories(value) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function formatDate(date) {
  const localDate = new Date(`${date}T00:00:00`);

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(localDate);
}

// Berechnet den Grundumsatz nach Mifflin-St. Jeor.
function calculateMaintenanceCalories(age, height, weight, gender, activityLevel) {
  let basalMetabolicRate = 10 * weight + 6.25 * height - 5 * age;

  if (gender === "male") {
    basalMetabolicRate += 5;
  } else {
    basalMetabolicRate -= 161;
  }

  // Der Aktivitätsfaktor ergibt den geschätzten Erhaltungsbedarf.
  return Math.round(basalMetabolicRate * activityFactors[activityLevel]);
}

function calculateDailyGoal(maintenanceCalories, fitnessGoal) {
  return Math.round(maintenanceCalories + fitnessGoals[fitnessGoal].adjustment);
}

function showProfileResult(maintenanceCalories, fitnessGoal, dailyGoal) {
  const selectedGoal = fitnessGoals[fitnessGoal];

  maintenanceResult.textContent = `${formatCalories(maintenanceCalories)} kcal`;
  fitnessGoalResult.textContent = selectedGoal.label;
  dailyGoalResult.textContent = `${formatCalories(dailyGoal)} kcal`;
  goalEffect.textContent = selectedGoal.effect;
  profileResult.hidden = false;
}

function fillProfileForm() {
  if (!profileData.age) {
    return;
  }

  document.querySelector("#age").value = profileData.age;
  document.querySelector("#height").value = profileData.height;
  document.querySelector("#weight").value = profileData.weight;
  document.querySelector("#gender").value = profileData.gender;
  document.querySelector("#activity-level").value = profileData.activityLevel;

  if (
    profileData.fitnessGoal &&
    fitnessGoals[profileData.fitnessGoal] &&
    Number.isFinite(profileData.maintenanceCalories)
  ) {
    document.querySelector("#fitness-goal").value = profileData.fitnessGoal;
    showProfileResult(profileData.maintenanceCalories, profileData.fitnessGoal, profileData.dailyGoal);
    profileMessage.textContent = "Gespeichertes Profil und Kalorienziel wurden geladen.";
  } else {
    profileMessage.textContent = "Bitte wähle noch dein persönliches Fitnessziel aus.";
  }
}

function clearMessages() {
  mealMessage.textContent = "";
  activityMessage.textContent = "";
  heartRateMessage.textContent = "";
}

function updateBudget(dayData) {
  const totalMealCalories = dayData.meals.reduce(function (sum, meal) {
    return sum + meal.calories;
  }, 0);

  const totalActivityCalories = dayData.activities.reduce(function (sum, activity) {
    return sum + activity.calories;
  }, 0);

  const remainingBudget = dayData.dailyGoal - totalMealCalories + totalActivityCalories;

  calorieNumber.textContent = formatCalories(remainingBudget);
  calorieValue.setAttribute("aria-label", `${formatCalories(remainingBudget)} Kilokalorien`);
  budgetNote.textContent = `Tagesziel (Schätzwert): ${formatCalories(dayData.dailyGoal)} kcal`;
  mealTotal.textContent = `${formatCalories(totalMealCalories)} kcal`;
  activityTotal.textContent = `${formatCalories(totalActivityCalories)} kcal`;
}

function createEmptyEntry(text) {
  const emptyEntry = document.createElement("li");
  emptyEntry.className = "empty-entry";
  emptyEntry.textContent = text;
  return emptyEntry;
}

function createDeleteButton(label, deleteEntry) {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Löschen";
  deleteButton.setAttribute("aria-label", `${label} löschen`);
  deleteButton.addEventListener("click", deleteEntry);
  return deleteButton;
}

function renderMeals(dayData, isToday) {
  mealList.textContent = "";

  if (dayData.meals.length === 0) {
    mealList.append(createEmptyEntry("Noch keine Mahlzeit gespeichert."));
    return;
  }

  dayData.meals.forEach(function (meal, index) {
    const listItem = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const actions = document.createElement("div");
    const calories = document.createElement("span");

    listItem.className = "entry";
    details.className = "entry-details";
    actions.className = "entry-actions";
    calories.className = "entry-calories meal-calories";
    name.textContent = meal.name;
    calories.textContent = `− ${formatCalories(meal.calories)} kcal`;

    details.append(name);
    actions.append(calories);

    if (isToday) {
      const deleteButton = createDeleteButton(meal.name, function () {
        dayData.meals.splice(index, 1);
        saveAppData();
        mealMessage.textContent = `${meal.name} wurde gelöscht.`;
        renderSelectedDay();
      });
      actions.append(deleteButton);
    }

    listItem.append(details, actions);
    mealList.append(listItem);
  });
}

function renderActivities(dayData, isToday) {
  activityList.textContent = "";

  if (dayData.activities.length === 0) {
    activityList.append(createEmptyEntry("Noch keine Aktivität gespeichert."));
    return;
  }

  dayData.activities.forEach(function (activity, index) {
    const listItem = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const duration = document.createElement("span");
    const actions = document.createElement("div");
    const calories = document.createElement("span");

    listItem.className = "entry";
    details.className = "entry-details";
    actions.className = "entry-actions";
    calories.className = "entry-calories activity-calories";
    name.textContent = activity.name;
    duration.textContent = `${activity.duration} Minuten`;
    calories.textContent = `+ ${formatCalories(activity.calories)} kcal`;

    details.append(name, duration);
    actions.append(calories);

    if (isToday) {
      const deleteButton = createDeleteButton(activity.name, function () {
        dayData.activities.splice(index, 1);
        saveAppData();
        activityMessage.textContent = `${activity.name} wurde gelöscht.`;
        renderSelectedDay();
      });
      actions.append(deleteButton);
    }

    listItem.append(details, actions);
    activityList.append(listItem);
  });
}

function renderHeartRates(dayData) {
  heartRateList.textContent = "";

  if (dayData.heartRates.length === 0) {
    heartRateList.append(createEmptyEntry("Noch keine Herzfrequenz gespeichert."));
    return;
  }

  dayData.heartRates.forEach(function (heartRate, index) {
    const listItem = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const value = document.createElement("span");

    listItem.className = "entry";
    details.className = "entry-details";
    name.textContent = `Messung ${index + 1}`;
    value.className = "heart-rate-value";
    value.textContent = `${heartRate.bpm} BPM`;

    details.append(name);
    listItem.append(details, value);
    heartRateList.append(listItem);
  });
}

function updateDayNavigation(isToday) {
  todayButton.classList.toggle("active", isToday && !calendarIsOpen);
  calendarButton.classList.toggle("active", calendarIsOpen || !isToday);
  calendarButton.setAttribute("aria-expanded", String(calendarIsOpen));
  calendarPicker.hidden = !calendarIsOpen;
  pastDayNote.hidden = isToday;

  mealForm.hidden = !isToday;
  activityForm.hidden = !isToday;
  heartRateForm.hidden = !isToday;

  selectedDayLabel.textContent = isToday ? `Heute · ${formatDate(selectedDate)}` : formatDate(selectedDate);
  calorieHeading.textContent = isToday ? "Heute noch verfügbar" : "An diesem Tag verfügbar";
  mealListHeading.textContent = isToday ? "Heutige Mahlzeiten" : "Mahlzeiten an diesem Tag";
  activityListHeading.textContent = isToday ? "Heutige Aktivitäten" : "Aktivitäten an diesem Tag";
  heartRateListHeading.textContent = isToday ? "Heutige Herzfrequenz" : "Herzfrequenz an diesem Tag";
  mealHeading.textContent = isToday ? "Mahlzeit hinzufügen" : "Mahlzeiten";
  activityHeading.textContent = isToday ? "Sportart hinzufügen" : "Sportaktivitäten";
}

function renderSelectedDay() {
  const dayData = getDayData(selectedDate);
  const isToday = selectedDate === todayDate;

  updateDayNavigation(isToday);
  updateBudget(dayData);
  renderMeals(dayData, isToday);
  renderActivities(dayData, isToday);
  renderHeartRates(dayData);
}

profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const age = Number(document.querySelector("#age").value);
  const height = Number(document.querySelector("#height").value);
  const weight = Number(document.querySelector("#weight").value);
  const gender = document.querySelector("#gender").value;
  const activityLevel = document.querySelector("#activity-level").value;
  const fitnessGoal = document.querySelector("#fitness-goal").value;
  const maintenanceCalories = calculateMaintenanceCalories(age, height, weight, gender, activityLevel);
  const dailyGoal = calculateDailyGoal(maintenanceCalories, fitnessGoal);

  // Eine neue Berechnung ersetzt nur das Ziel ab dem heutigen Datum.
  const goalHistory = profileData.goalHistory.filter(function (entry) {
    return entry.date !== todayDate;
  });
  goalHistory.push({
    date: todayDate,
    goal: dailyGoal,
    maintenanceCalories: maintenanceCalories,
    fitnessGoal: fitnessGoal
  });

  profileData = {
    age: age,
    height: height,
    weight: weight,
    gender: gender,
    activityLevel: activityLevel,
    fitnessGoal: fitnessGoal,
    maintenanceCalories: maintenanceCalories,
    dailyGoal: dailyGoal,
    goalHistory: goalHistory
  };

  saveProfileData();

  // Der heutige Tag übernimmt das neue Ziel; frühere Tageswerte bleiben bestehen.
  const todayData = getDayData(todayDate);
  todayData.dailyGoal = dailyGoal;
  saveAppData();

  showProfileResult(maintenanceCalories, fitnessGoal, dailyGoal);
  profileMessage.textContent = "Profil und geschätztes Kalorienziel wurden gespeichert.";
  renderSelectedDay();
});

mealForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nameInput = document.querySelector("#meal-name");
  const caloriesInput = document.querySelector("#meal-calories");
  const mealName = nameInput.value.trim();
  const calories = Number(caloriesInput.value);
  const dayData = getDayData(todayDate);

  dayData.meals.push({ name: mealName, calories: calories });
  saveAppData();
  mealForm.reset();
  mealMessage.textContent = `${mealName}: ${formatCalories(calories)} kcal wurden gespeichert.`;
  renderSelectedDay();
});

activityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const sportSelect = document.querySelector("#sport");
  const durationInput = document.querySelector("#duration");
  const sportName = sportSelect.options[sportSelect.selectedIndex].text;
  const duration = Number(durationInput.value);
  const burnedCalories = Math.round(duration * caloriesPerMinute[sportSelect.value]);
  const dayData = getDayData(todayDate);

  dayData.activities.push({
    name: sportName,
    duration: duration,
    calories: burnedCalories
  });

  saveAppData();
  activityForm.reset();
  activityMessage.textContent = `${sportName}: ${formatCalories(burnedCalories)} kcal wurden gespeichert.`;
  renderSelectedDay();
});

heartRateForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const heartRateInput = document.querySelector("#heart-rate");
  const bpm = Number(heartRateInput.value);
  const dayData = getDayData(todayDate);

  dayData.heartRates.push({ bpm: bpm });
  saveAppData();
  heartRateForm.reset();
  heartRateMessage.textContent = `${bpm} BPM wurden gespeichert.`;
  renderSelectedDay();
});

todayButton.addEventListener("click", function () {
  selectedDate = todayDate;
  calendarIsOpen = false;
  calendarDate.value = todayDate;
  clearMessages();
  renderSelectedDay();
});

calendarButton.addEventListener("click", function () {
  calendarIsOpen = true;
  updateDayNavigation(selectedDate === todayDate);
  calendarDate.focus();
});

calendarDate.addEventListener("change", function () {
  if (!calendarDate.value) {
    return;
  }

  selectedDate = calendarDate.value;
  clearMessages();
  renderSelectedDay();
});

// Der Browserkalender erlaubt nur heute und vergangene Tage.
calendarDate.max = todayDate;
calendarDate.value = todayDate;
fillProfileForm();
renderSelectedDay();

// Der Service Worker ermöglicht den Start der App aus dem Offline-Cache.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
      console.warn("Der Service Worker konnte nicht registriert werden.", error);
    });
  });
}
