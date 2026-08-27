// Ohne persönliches Profil verwendet die App weiterhin 1.490 kcal.
const DEFAULT_BUDGET = 1490;
const STORAGE_KEY = "fitAppDays";
const PROFILE_STORAGE_KEY = "fitAppProfile";
const GPS_DRAFT_STORAGE_KEY = "fitAppGpsTrackingDraft";
const INTAKE_PLANS_STORAGE_KEY = "fitAppIntakePlans";
const MAX_GPS_ACCURACY_METERS = 50;
const MAX_PLAUSIBLE_SPEED_KMH = 45;
const GPS_SAVE_INTERVAL_MS = 5000;

// Öffentliche Push-Konfiguration: Der VAPID Public Key ist kein Secret.
// Endpunkt und Schlüssel bleiben leer, bis ein separater Benachrichtigungsdienst bereitsteht.
const PUSH_CONFIG = {
  publicVapidKey: "",
  subscriptionEndpoint: ""
};

const gpsSports = {
  walking: {
    name: "Spazieren / Gehen",
    calorieFactor: 0.5
  },
  running: {
    name: "Laufen",
    calorieFactor: 1
  }
};

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
  hausarbeit: 4,
  tischtennis: 5,
  tennis: 8,
  "spazieren-gehen": 4,
  tanzen: 6
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
const profileEditor = document.querySelector("#profile-editor");
const profileSummary = document.querySelector("#profile-summary");
const profileSummaryGoal = document.querySelector("#profile-summary-goal");
const profileSummaryFitnessGoal = document.querySelector("#profile-summary-fitness-goal");
const profileCollapseButton = document.querySelector("#profile-collapse-button");
const profileEditButton = document.querySelector("#profile-edit-button");
const maintenanceResult = document.querySelector("#maintenance-result");
const fitnessGoalResult = document.querySelector("#fitness-goal-result");
const dailyGoalResult = document.querySelector("#daily-goal-result");
const goalEffect = document.querySelector("#goal-effect");
const mealForm = document.querySelector("#meal-form");
const activityForm = document.querySelector("#activity-form");
const mealMessage = document.querySelector("#meal-message");
const activityMessage = document.querySelector("#activity-message");
const mealList = document.querySelector("#meal-list");
const activityList = document.querySelector("#activity-list");
const mealTotal = document.querySelector("#meal-total");
const activityTotal = document.querySelector("#activity-total");
const mealListHeading = document.querySelector("#meal-list-heading");
const activityListHeading = document.querySelector("#activity-list-heading");
const mealHeading = document.querySelector("#meal-heading");
const activityHeading = document.querySelector("#activity-heading");
const todayButton = document.querySelector("#today-button");
const calendarButton = document.querySelector("#calendar-button");
const calendarPicker = document.querySelector("#calendar-picker");
const calendarDate = document.querySelector("#calendar-date");
const selectedDayLabel = document.querySelector("#selected-day-label");
const pastDayNote = document.querySelector("#past-day-note");
const gpsSportArea = document.querySelector("#gps-sport-area");
const gpsSetup = document.querySelector("#gps-setup");
const showGpsChoiceButton = document.querySelector("#show-gps-choice");
const gpsChoice = document.querySelector("#gps-choice");
const gpsSportInputs = document.querySelectorAll('input[name="gps-sport"]');
const startGpsTrackingButton = document.querySelector("#start-gps-tracking");
const gpsSetupMessage = document.querySelector("#gps-setup-message");
const gpsTrackingPanel = document.querySelector("#gps-tracking-panel");
const trackingSportName = document.querySelector("#tracking-sport-name");
const trackingStatus = document.querySelector("#tracking-status");
const trackingTime = document.querySelector("#tracking-time");
const trackingDistance = document.querySelector("#tracking-distance");
const trackingCurrentSpeed = document.querySelector("#tracking-current-speed");
const trackingAverageSpeed = document.querySelector("#tracking-average-speed");
const trackingCalories = document.querySelector("#tracking-calories");
const trackingWeightNote = document.querySelector("#tracking-weight-note");
const trackingMessage = document.querySelector("#tracking-message");
const liveRouteMapElement = document.querySelector("#live-route-map");
const pauseGpsTrackingButton = document.querySelector("#pause-gps-tracking");
const stopGpsTrackingButton = document.querySelector("#stop-gps-tracking");
const intakeCard = document.querySelector("#intake-card");
const intakePlanForm = document.querySelector("#intake-plan-form");
const intakePlanIdInput = document.querySelector("#intake-plan-id");
const intakeNameInput = document.querySelector("#intake-name");
const intakeTypeSelect = document.querySelector("#intake-type");
const intakeNoteInput = document.querySelector("#intake-note");
const intakeStartDateInput = document.querySelector("#intake-start-date");
const intakeTimeInput = document.querySelector("#intake-time");
const intakeRecurrenceSelect = document.querySelector("#intake-recurrence");
const intakeEndDateInput = document.querySelector("#intake-end-date");
const intakeWeekdaysField = document.querySelector("#intake-weekdays-field");
const intakeWeekdayInputs = document.querySelectorAll('input[name="intake-weekday"]');
const saveIntakePlanButton = document.querySelector("#save-intake-plan");
const cancelIntakeEditButton = document.querySelector("#cancel-intake-edit");
const intakeFormMessage = document.querySelector("#intake-form-message");
const intakeDayHeading = document.querySelector("#intake-day-heading");
const intakeDayStatus = document.querySelector("#intake-day-status");
const intakeDayList = document.querySelector("#intake-day-list");
const intakePlanCount = document.querySelector("#intake-plan-count");
const intakePlanList = document.querySelector("#intake-plan-list");
const enablePushRemindersButton = document.querySelector("#enable-push-reminders");
const pushReminderStatus = document.querySelector("#push-reminder-status");

let gpsWatchId = null;
let gpsTimerId = null;
let gpsDraftSaveId = null;
let gpsTrackingState = null;
let liveMap = null;
let liveRouteLine = null;
let livePositionMarker = null;
const savedActivityMaps = [];
let intakePlans = [];
let targetedIntakeOccurrenceId = new URLSearchParams(window.location.search).get("intake");
let targetedIntakeWasFocused = false;

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
    intakeConfirmations: {}
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

  if (
    !appData[date].intakeConfirmations ||
    typeof appData[date].intakeConfirmations !== "object" ||
    Array.isArray(appData[date].intakeConfirmations)
  ) {
    appData[date].intakeConfirmations = {};
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

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function formatDecimal(value, digits) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return safeValue.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

// Haversine-Distanz zwischen zwei Koordinaten in Metern.
function calculateHaversineDistance(firstPoint, secondPoint) {
  const earthRadiusMeters = 6371000;
  const toRadians = function (degrees) {
    return degrees * Math.PI / 180;
  };
  const latitudeDifference = toRadians(secondPoint.latitude - firstPoint.latitude);
  const longitudeDifference = toRadians(secondPoint.longitude - firstPoint.longitude);
  const firstLatitude = toRadians(firstPoint.latitude);
  const secondLatitude = toRadians(secondPoint.latitude);
  const haversineValue = Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) *
    Math.sin(longitudeDifference / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(
    Math.sqrt(haversineValue),
    Math.sqrt(1 - haversineValue)
  );
}

function getProfileWeight() {
  const weight = Number(profileData.weight);
  return Number.isFinite(weight) && weight > 0 ? weight : null;
}

function calculateGpsCalories(sportKey, distanceKm) {
  const weight = getProfileWeight();
  const sport = gpsSports[sportKey];

  if (!weight || !sport || !Number.isFinite(distanceKm)) {
    return null;
  }

  return Math.round(weight * distanceKm * sport.calorieFactor);
}

function getGpsElapsedSeconds() {
  if (!gpsTrackingState) {
    return 0;
  }

  let elapsedSeconds = Number(gpsTrackingState.elapsedSeconds) || 0;

  if (gpsTrackingState.status === "active" && gpsTrackingState.timerStartedAt) {
    elapsedSeconds += (Date.now() - gpsTrackingState.timerStartedAt) / 1000;
  }

  return Math.max(0, elapsedSeconds);
}

function setGpsMessage(element, message, isError) {
  element.textContent = message;
  element.classList.toggle("is-error", Boolean(isError));
}

function addOpenStreetMapLayer(map) {
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

function destroyLiveMap() {
  if (liveMap) {
    liveMap.remove();
  }

  liveMap = null;
  liveRouteLine = null;
  livePositionMarker = null;
  liveRouteMapElement.textContent = "";
  liveRouteMapElement.classList.remove("route-map-unavailable");
}

function initializeLiveMap() {
  destroyLiveMap();

  if (!window.L) {
    liveRouteMapElement.classList.add("route-map-unavailable");
    liveRouteMapElement.textContent = "Die Karte konnte nicht geladen werden. Die GPS-Aufzeichnung funktioniert weiterhin.";
    return;
  }

  liveMap = window.L.map(liveRouteMapElement, {
    zoomControl: true,
    tap: true
  }).setView([51.1657, 10.4515], 6);
  addOpenStreetMapLayer(liveMap);
  liveRouteLine = window.L.polyline([], {
    color: "#34785c",
    weight: 5,
    opacity: 0.9,
    lineCap: "round"
  }).addTo(liveMap);

  window.setTimeout(function () {
    if (liveMap) {
      liveMap.invalidateSize();
    }
  }, 0);
}

function updateLiveMap(point, shouldCenter) {
  if (!liveMap || !point) {
    return;
  }

  const coordinates = [point.latitude, point.longitude];
  const routeCoordinates = gpsTrackingState.points.map(function (routePoint) {
    return [routePoint.latitude, routePoint.longitude];
  });
  liveRouteLine.setLatLngs(routeCoordinates);

  if (!livePositionMarker) {
    livePositionMarker = window.L.circleMarker(coordinates, {
      radius: 8,
      color: "#ffffff",
      weight: 3,
      fillColor: "#34785c",
      fillOpacity: 1
    }).addTo(liveMap);
  } else {
    livePositionMarker.setLatLng(coordinates);
  }

  if (shouldCenter || routeCoordinates.length === 1) {
    liveMap.setView(coordinates, 17);
  } else {
    liveMap.panTo(coordinates, { animate: true, duration: 0.4 });
  }
}

function updateGpsLiveValues() {
  if (!gpsTrackingState) {
    return;
  }

  const elapsedSeconds = getGpsElapsedSeconds();
  const elapsedHours = elapsedSeconds / 3600;
  const averageSpeed = elapsedHours > 0 ? gpsTrackingState.distanceKm / elapsedHours : 0;

  if (
    gpsTrackingState.lastGpsTimestamp &&
    Date.now() - gpsTrackingState.lastGpsTimestamp > 10000
  ) {
    gpsTrackingState.currentSpeedKmh = 0;
  }

  const calories = calculateGpsCalories(gpsTrackingState.sportKey, gpsTrackingState.distanceKm);
  trackingSportName.textContent = gpsSports[gpsTrackingState.sportKey].name;
  trackingTime.textContent = formatDuration(elapsedSeconds);
  trackingDistance.textContent = formatDecimal(gpsTrackingState.distanceKm, 2);
  trackingCurrentSpeed.textContent = formatDecimal(gpsTrackingState.currentSpeedKmh, 1);
  trackingAverageSpeed.textContent = formatDecimal(averageSpeed, 1);
  trackingCalories.textContent = calories === null ? "– kcal" : `${formatCalories(calories)} kcal`;
  trackingWeightNote.hidden = calories !== null;
}

// Der laufende Zustand wird regelmäßig separat gespeichert und erst beim Beenden zur Tagesaktivität.
function persistGpsDraft() {
  if (!gpsTrackingState) {
    return;
  }

  const draft = {
    version: 1,
    date: gpsTrackingState.date,
    sportKey: gpsTrackingState.sportKey,
    activityStartedAt: gpsTrackingState.activityStartedAt,
    elapsedSeconds: getGpsElapsedSeconds(),
    distanceKm: gpsTrackingState.distanceKm,
    currentSpeedKmh: gpsTrackingState.currentSpeedKmh,
    lastGpsTimestamp: gpsTrackingState.lastGpsTimestamp,
    lastKnownPosition: gpsTrackingState.lastKnownPosition,
    lastPosition: gpsTrackingState.lastPosition,
    points: gpsTrackingState.points,
    status: gpsTrackingState.status,
    savedAt: Date.now()
  };

  try {
    localStorage.setItem(GPS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    setGpsMessage(trackingMessage, "Der Zwischenstand konnte nicht gespeichert werden. Bitte beende die Aktivität, bevor du die Seite verlässt.", true);
    console.warn("Der GPS-Zwischenstand konnte nicht gespeichert werden.", error);
  }
}

function removeGpsDraft() {
  localStorage.removeItem(GPS_DRAFT_STORAGE_KEY);
}

function stopGpsSources() {
  if (gpsWatchId !== null && "geolocation" in navigator) {
    navigator.geolocation.clearWatch(gpsWatchId);
  }

  window.clearInterval(gpsTimerId);
  window.clearInterval(gpsDraftSaveId);
  gpsWatchId = null;
  gpsTimerId = null;
  gpsDraftSaveId = null;
}

function showGpsTrackingPanel() {
  gpsSetup.hidden = true;
  gpsTrackingPanel.hidden = false;
  updateGpsLiveValues();
}

function resetGpsSetup(message, isError) {
  stopGpsSources();
  destroyLiveMap();
  gpsTrackingState = null;
  gpsTrackingPanel.hidden = true;
  gpsSetup.hidden = false;
  gpsChoice.hidden = true;
  showGpsChoiceButton.hidden = false;
  startGpsTrackingButton.disabled = true;
  pauseGpsTrackingButton.disabled = false;
  gpsSportInputs.forEach(function (input) {
    input.checked = false;
  });
  setGpsMessage(gpsSetupMessage, message || "", isError);
}

function abortGpsTracking(message) {
  removeGpsDraft();
  resetGpsSetup(message, true);
}

function handleGpsError(error) {
  if (!gpsTrackingState) {
    return;
  }

  if (error.code === 1) {
    abortGpsTracking("Die Standortberechtigung wurde verweigert. Erlaube den Standortzugriff in den Browser-Einstellungen und starte das Tracking erneut.");
    return;
  }

  if (error.code === 2) {
    setGpsMessage(trackingMessage, "GPS bzw. der Standort ist momentan nicht verfügbar. Die App wartet weiter auf ein Signal.", true);
  } else if (error.code === 3) {
    setGpsMessage(trackingMessage, "Der Standort konnte nicht bestimmt werden. Die App versucht es weiter.", true);
  } else {
    setGpsMessage(trackingMessage, "Beim Ermitteln des Standorts ist ein unbekannter Fehler aufgetreten.", true);
  }

  trackingStatus.textContent = "Kein GPS-Signal";
}

// Filtert ungenaue Punkte und GPS-Zittern, bevor Strecke und Route erweitert werden.
function processGpsPosition(position) {
  if (!gpsTrackingState || gpsTrackingState.status !== "active") {
    return;
  }

  const coordinates = position.coords;
  const point = {
    latitude: Number(coordinates.latitude),
    longitude: Number(coordinates.longitude),
    timestamp: Number(position.timestamp) || Date.now(),
    accuracy: Number(coordinates.accuracy)
  };

  if (
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    !Number.isFinite(point.accuracy) ||
    point.accuracy > MAX_GPS_ACCURACY_METERS
  ) {
    trackingStatus.textContent = "GPS zu ungenau";
    setGpsMessage(trackingMessage, "Das GPS-Signal ist noch zu ungenau. Dieser Standortpunkt wird nicht zur Strecke addiert.", false);
    return;
  }

  const previousPoint = gpsTrackingState.lastPosition;

  if (!previousPoint) {
    gpsTrackingState.lastGpsTimestamp = point.timestamp;
    gpsTrackingState.lastKnownPosition = point;
    gpsTrackingState.points.push(point);
    gpsTrackingState.lastPosition = point;
    gpsTrackingState.currentSpeedKmh = 0;
    trackingStatus.textContent = `GPS aktiv · ± ${Math.round(point.accuracy)} m`;
    setGpsMessage(trackingMessage, "Standort gefunden. Die Route wird aufgezeichnet.", false);
    updateLiveMap(point, true);
    persistGpsDraft();
    updateGpsLiveValues();
    return;
  }

  const intervalSeconds = (point.timestamp - previousPoint.timestamp) / 1000;

  if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
    return;
  }

  const distanceMeters = calculateHaversineDistance(previousPoint, point);
  const calculatedSpeedKmh = distanceMeters / intervalSeconds * 3.6;
  const minimumMovementMeters = Math.max(
    3,
    Math.min(10, (previousPoint.accuracy + point.accuracy) * 0.12)
  );
  const deviceSpeedKmh = Number.isFinite(coordinates.speed) && coordinates.speed >= 0
    ? coordinates.speed * 3.6
    : null;

  if (calculatedSpeedKmh > MAX_PLAUSIBLE_SPEED_KMH) {
    trackingStatus.textContent = "GPS-Sprung ignoriert";
    setGpsMessage(trackingMessage, "Ein unplausibler Standortwechsel wurde nicht zur Strecke addiert.", false);
    return;
  }

  gpsTrackingState.lastGpsTimestamp = point.timestamp;
  gpsTrackingState.lastKnownPosition = point;

  if (distanceMeters < minimumMovementMeters) {
    gpsTrackingState.currentSpeedKmh = deviceSpeedKmh !== null && deviceSpeedKmh <= MAX_PLAUSIBLE_SPEED_KMH
      ? deviceSpeedKmh
      : 0;
    trackingStatus.textContent = `GPS aktiv · ± ${Math.round(point.accuracy)} m`;
    setGpsMessage(trackingMessage, "Kleine GPS-Schwankungen im Stillstand werden herausgefiltert.", false);
    updateLiveMap(point, false);
    updateGpsLiveValues();
    return;
  }

  gpsTrackingState.distanceKm += distanceMeters / 1000;
  gpsTrackingState.currentSpeedKmh = deviceSpeedKmh !== null && deviceSpeedKmh <= MAX_PLAUSIBLE_SPEED_KMH
    ? deviceSpeedKmh
    : calculatedSpeedKmh;
  gpsTrackingState.points.push(point);
  gpsTrackingState.lastPosition = point;
  trackingStatus.textContent = `GPS aktiv · ± ${Math.round(point.accuracy)} m`;
  setGpsMessage(trackingMessage, "", false);
  updateLiveMap(point, false);
  updateGpsLiveValues();
  persistGpsDraft();
}

function startGpsSources() {
  if (!("geolocation" in navigator)) {
    abortGpsTracking("Dieser Browser unterstützt Geolocation nicht. Die übrigen FitApp-Funktionen stehen weiterhin zur Verfügung.");
    return false;
  }

  gpsWatchId = navigator.geolocation.watchPosition(
    processGpsPosition,
    handleGpsError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
  gpsTimerId = window.setInterval(updateGpsLiveValues, 1000);
  gpsDraftSaveId = window.setInterval(persistGpsDraft, GPS_SAVE_INTERVAL_MS);
  return true;
}

function startGpsTracking() {
  const selectedSport = document.querySelector('input[name="gps-sport"]:checked');

  if (!selectedSport || !gpsSports[selectedSport.value]) {
    setGpsMessage(gpsSetupMessage, "Bitte wähle zuerst eine Sportart aus.", true);
    return;
  }

  if (!("geolocation" in navigator)) {
    setGpsMessage(gpsSetupMessage, "Dieser Browser unterstützt Geolocation nicht. Die übrigen FitApp-Funktionen stehen weiterhin zur Verfügung.", true);
    return;
  }

  const now = Date.now();
  gpsTrackingState = {
    date: todayDate,
    sportKey: selectedSport.value,
    activityStartedAt: now,
    elapsedSeconds: 0,
    timerStartedAt: now,
    distanceKm: 0,
    currentSpeedKmh: 0,
    lastGpsTimestamp: null,
    lastKnownPosition: null,
    lastPosition: null,
    points: [],
    status: "active"
  };

  showGpsTrackingPanel();
  initializeLiveMap();
  trackingStatus.textContent = "GPS wird gesucht …";
  pauseGpsTrackingButton.textContent = "Pausieren";
  setGpsMessage(trackingMessage, "Bitte bestätige die Standortfreigabe deines Browsers.", false);
  persistGpsDraft();
  startGpsSources();
}

function pauseGpsTracking() {
  if (!gpsTrackingState) {
    return;
  }

  if (gpsTrackingState.status === "paused") {
    gpsTrackingState.status = "active";
    gpsTrackingState.timerStartedAt = Date.now();
    gpsTrackingState.currentSpeedKmh = 0;
    trackingStatus.textContent = "GPS wird gesucht …";
    pauseGpsTrackingButton.textContent = "Pausieren";
    setGpsMessage(trackingMessage, "Tracking wird fortgesetzt.", false);
    startGpsSources();
    persistGpsDraft();
    return;
  }

  gpsTrackingState.elapsedSeconds = getGpsElapsedSeconds();
  gpsTrackingState.timerStartedAt = null;
  gpsTrackingState.status = "paused";
  gpsTrackingState.currentSpeedKmh = 0;
  stopGpsSources();
  trackingStatus.textContent = "Pausiert";
  pauseGpsTrackingButton.textContent = "Fortsetzen";
  setGpsMessage(trackingMessage, "Die Zeit und GPS-Aufzeichnung sind pausiert.", false);
  updateGpsLiveValues();
  persistGpsDraft();
}

function stopGpsTracking() {
  if (!gpsTrackingState) {
    return;
  }

  const finishedState = gpsTrackingState;
  const elapsedSeconds = Math.max(0, Math.round(getGpsElapsedSeconds()));
  const elapsedHours = elapsedSeconds / 3600;
  const averageSpeedKmh = elapsedHours > 0 ? finishedState.distanceKm / elapsedHours : 0;
  const calories = calculateGpsCalories(finishedState.sportKey, finishedState.distanceKm);
  stopGpsSources();

  if (finishedState.points.length === 0) {
    removeGpsDraft();
    resetGpsSetup("Die Aktivität wurde nicht gespeichert, weil kein gültiger GPS-Punkt empfangen wurde.", true);
    return;
  }

  const activity = {
    name: gpsSports[finishedState.sportKey].name,
    duration: Math.round(elapsedSeconds / 60),
    durationSeconds: elapsedSeconds,
    distanceKm: Number(finishedState.distanceKm.toFixed(3)),
    averageSpeedKmh: Number(averageSpeedKmh.toFixed(2)),
    calories: calories === null ? 0 : calories,
    calorieEstimateAvailable: calories !== null,
    gpsTracked: true,
    sportType: finishedState.sportKey,
    startedAt: finishedState.activityStartedAt,
    route: finishedState.points.map(function (point) {
      return {
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        accuracy: point.accuracy
      };
    })
  };

  getDayData(finishedState.date).activities.push(activity);
  saveAppData();
  removeGpsDraft();
  resetGpsSetup("", false);
  const savedDateNote = finishedState.date === todayDate ? "" : ` für den ${formatDate(finishedState.date)}`;
  activityMessage.textContent = calories === null
    ? `${activity.name} wurde${savedDateNote} per GPS gespeichert. Für eine Kalorienschätzung fehlt das Gewicht im Profil.`
    : `${activity.name}: ${formatCalories(calories)} kcal wurden${savedDateNote} per GPS gespeichert.`;
  renderSelectedDay();
}

function restoreGpsDraft() {
  const savedDraft = localStorage.getItem(GPS_DRAFT_STORAGE_KEY);

  if (!savedDraft) {
    return;
  }

  try {
    const draft = JSON.parse(savedDraft);

    if (!draft || !gpsSports[draft.sportKey] || !Array.isArray(draft.points)) {
      removeGpsDraft();
      return;
    }

    const draftIsFromToday = draft.date === todayDate;

    gpsTrackingState = {
      date: draft.date,
      sportKey: draft.sportKey,
      activityStartedAt: Number(draft.activityStartedAt) || Date.now(),
      elapsedSeconds: Math.max(0, Number(draft.elapsedSeconds) || 0),
      timerStartedAt: null,
      distanceKm: Math.max(0, Number(draft.distanceKm) || 0),
      currentSpeedKmh: 0,
      lastGpsTimestamp: Number(draft.lastGpsTimestamp) || null,
      lastKnownPosition: draft.lastKnownPosition || draft.lastPosition || draft.points[draft.points.length - 1] || null,
      lastPosition: draft.lastPosition || draft.points[draft.points.length - 1] || null,
      points: draft.points,
      status: "paused"
    };

    showGpsTrackingPanel();
    initializeLiveMap();
    trackingStatus.textContent = draftIsFromToday ? "Unterbrochen" : "Früherer Zwischenstand";
    pauseGpsTrackingButton.disabled = !draftIsFromToday;
    pauseGpsTrackingButton.textContent = draftIsFromToday ? "Tracking fortsetzen" : "Nicht fortsetzbar";
    setGpsMessage(
      trackingMessage,
      draftIsFromToday
        ? "Ein gespeicherter Zwischenstand wurde wiederhergestellt. Zeit und GPS bleiben pausiert, bis du fortsetzt."
        : `Der Zwischenstand vom ${formatDate(draft.date)} kann nicht weiter aufgezeichnet, aber noch beendet und gespeichert werden.`,
      false
    );
    updateGpsLiveValues();

    if (gpsTrackingState.lastKnownPosition) {
      updateLiveMap(gpsTrackingState.lastKnownPosition, true);
    }
  } catch (error) {
    console.warn("Der GPS-Zwischenstand konnte nicht geladen werden.", error);
    removeGpsDraft();
  }
}

function loadIntakePlans() {
  const savedPlans = localStorage.getItem(INTAKE_PLANS_STORAGE_KEY);

  if (!savedPlans) {
    return [];
  }

  try {
    const parsedPlans = JSON.parse(savedPlans);

    if (!Array.isArray(parsedPlans)) {
      return [];
    }

    return parsedPlans.filter(function (plan) {
      return Boolean(
        plan &&
        typeof plan.id === "string" &&
        typeof plan.name === "string" &&
        ["supplement", "medication"].includes(plan.type) &&
        /^\d{4}-\d{2}-\d{2}$/.test(plan.startDate) &&
        /^\d{2}:\d{2}$/.test(plan.time) &&
        ["once", "daily", "weekdays"].includes(plan.recurrence)
      );
    }).map(function (plan) {
      return {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        note: typeof plan.note === "string" ? plan.note : "",
        startDate: plan.startDate,
        time: plan.time,
        recurrence: plan.recurrence,
        weekdays: Array.isArray(plan.weekdays) ? plan.weekdays.map(Number).filter(function (day) {
          return day >= 0 && day <= 6;
        }) : [],
        endDate: /^\d{4}-\d{2}-\d{2}$/.test(plan.endDate || "") ? plan.endDate : "",
        createdAt: Number(plan.createdAt) || Date.now(),
        updatedAt: Number(plan.updatedAt) || Date.now()
      };
    });
  } catch (error) {
    console.warn("Die lokalen Einnahmepläne konnten nicht geladen werden.", error);
    return [];
  }
}

function saveIntakePlans() {
  try {
    localStorage.setItem(INTAKE_PLANS_STORAGE_KEY, JSON.stringify(intakePlans));
    return true;
  } catch (error) {
    console.warn("Die lokalen Einnahmepläne konnten nicht gespeichert werden.", error);
    intakeFormMessage.textContent = "Der Einnahmeplan konnte nicht lokal gespeichert werden.";
    return false;
  }
}

function createIntakePlanId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `intake-${window.crypto.randomUUID()}`;
  }

  return `intake-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createIntakeOccurrenceId(planId, date) {
  return `${planId}::${date}`;
}

function getDateFromOccurrenceId(occurrenceId) {
  if (typeof occurrenceId !== "string") {
    return null;
  }

  const separatorIndex = occurrenceId.lastIndexOf("::");
  const date = separatorIndex >= 0 ? occurrenceId.slice(separatorIndex + 2) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function isIntakeScheduledForDate(plan, date) {
  if (date < plan.startDate || (plan.endDate && date > plan.endDate)) {
    return false;
  }

  if (plan.recurrence === "once") {
    return date === plan.startDate;
  }

  if (plan.recurrence === "daily") {
    return true;
  }

  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  return plan.weekdays.includes(dayOfWeek);
}

function getScheduledIntakesForDate(date) {
  const confirmations = getDayData(date).intakeConfirmations;

  return intakePlans
    .filter(function (plan) {
      return isIntakeScheduledForDate(plan, date);
    })
    .map(function (plan) {
      const occurrenceId = createIntakeOccurrenceId(plan.id, date);
      return {
        occurrenceId: occurrenceId,
        date: date,
        plan: plan,
        confirmedAt: typeof confirmations[occurrenceId] === "string"
          ? confirmations[occurrenceId]
          : null
      };
    })
    .sort(function (first, second) {
      const timeComparison = first.plan.time.localeCompare(second.plan.time);
      return timeComparison || first.plan.name.localeCompare(second.plan.name, "de");
    });
}

function formatIntakeType(type) {
  return type === "medication" ? "Medikament" : "Supplement";
}

function formatIntakeRecurrence(plan) {
  if (plan.recurrence === "once") {
    return `Einmalig am ${formatDate(plan.startDate)}`;
  }

  if (plan.recurrence === "daily") {
    return plan.endDate
      ? `Täglich · ${formatDate(plan.startDate)} bis ${formatDate(plan.endDate)}`
      : `Täglich ab ${formatDate(plan.startDate)}`;
  }

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const selectedDays = plan.weekdays.slice().sort(function (first, second) {
    const mondayFirst = function (day) {
      return day === 0 ? 7 : day;
    };
    return mondayFirst(first) - mondayFirst(second);
  }).map(function (day) {
    return dayNames[day];
  }).join(", ");
  const endText = plan.endDate ? ` bis ${formatDate(plan.endDate)}` : "";
  return `${selectedDays} ab ${formatDate(plan.startDate)}${endText}`;
}

function formatConfirmationTime(confirmedAt) {
  const date = new Date(confirmedAt);

  if (Number.isNaN(date.getTime())) {
    return "Zeitpunkt nicht verfügbar";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function toggleIntakeConfirmation(occurrence) {
  const dayData = getDayData(occurrence.date);

  if (dayData.intakeConfirmations[occurrence.occurrenceId]) {
    delete dayData.intakeConfirmations[occurrence.occurrenceId];
  } else {
    dayData.intakeConfirmations[occurrence.occurrenceId] = new Date().toISOString();
  }

  saveAppData();
  renderIntakesForDate(selectedDate);
}

function renderIntakesForDate(date) {
  const occurrences = getScheduledIntakesForDate(date);
  const completedCount = occurrences.filter(function (occurrence) {
    return Boolean(occurrence.confirmedAt);
  }).length;

  intakeDayHeading.textContent = date === todayDate
    ? "Heutige Einnahmen"
    : `Einnahmen am ${new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`))}`;
  intakeDayStatus.textContent = `${occurrences.length} geplant · ${completedCount} erledigt`;
  intakeDayList.textContent = "";

  if (occurrences.length === 0) {
    intakeDayList.append(createEmptyEntry("Für diesen Tag ist keine Einnahme geplant."));
    return;
  }

  occurrences.forEach(function (occurrence) {
    const listItem = document.createElement("li");
    const time = document.createElement("span");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const meta = document.createElement("div");
    const type = document.createElement("span");
    const status = document.createElement("span");
    const confirmButton = document.createElement("button");

    listItem.className = `entry intake-entry${occurrence.confirmedAt ? " is-completed" : ""}`;
    listItem.tabIndex = -1;
    time.className = "intake-time";
    time.textContent = occurrence.plan.time;
    details.className = "entry-details";
    name.textContent = occurrence.plan.name;
    meta.className = "intake-entry-meta";
    type.className = "intake-type-badge";
    type.textContent = formatIntakeType(occurrence.plan.type);
    status.className = "intake-status-badge";
    status.textContent = occurrence.confirmedAt ? "Erledigt" : "Offen";
    meta.append(type, status);
    details.append(name, meta);

    if (occurrence.plan.note) {
      const note = document.createElement("span");
      note.className = "intake-note-text";
      note.textContent = occurrence.plan.note;
      details.append(note);
    }

    if (occurrence.confirmedAt) {
      const confirmedAt = document.createElement("span");
      confirmedAt.className = "intake-confirmed-at";
      confirmedAt.textContent = `Bestätigt: ${formatConfirmationTime(occurrence.confirmedAt)}`;
      details.append(confirmedAt);
    }

    confirmButton.type = "button";
    confirmButton.className = `intake-confirm-button${occurrence.confirmedAt ? " is-undo" : ""}`;
    confirmButton.textContent = occurrence.confirmedAt ? "Zurücknehmen" : "Als erledigt markieren";
    confirmButton.setAttribute(
      "aria-label",
      occurrence.confirmedAt
        ? `Bestätigung für ${occurrence.plan.name} zurücknehmen`
        : `${occurrence.plan.name} als erledigt markieren`
    );
    confirmButton.addEventListener("click", function () {
      toggleIntakeConfirmation(occurrence);
    });

    if (occurrence.occurrenceId === targetedIntakeOccurrenceId) {
      listItem.classList.add("is-targeted");

      if (!targetedIntakeWasFocused) {
        targetedIntakeWasFocused = true;
        window.setTimeout(function () {
          listItem.scrollIntoView({ behavior: "smooth", block: "center" });
          listItem.focus({ preventScroll: true });
        }, 100);
      }
    }

    listItem.append(time, details, confirmButton);
    intakeDayList.append(listItem);
  });
}

function renderIntakePlans() {
  intakePlanList.textContent = "";
  intakePlanCount.textContent = `${intakePlans.length} ${intakePlans.length === 1 ? "Plan" : "Pläne"}`;

  if (intakePlans.length === 0) {
    intakePlanList.append(createEmptyEntry("Noch kein Einnahmeplan gespeichert."));
    return;
  }

  intakePlans.slice().sort(function (first, second) {
    return first.startDate.localeCompare(second.startDate) || first.time.localeCompare(second.time);
  }).forEach(function (plan) {
    const listItem = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const schedule = document.createElement("span");
    const meta = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    listItem.className = "entry intake-plan-entry";
    details.className = "entry-details";
    name.textContent = plan.name;
    schedule.className = "intake-plan-schedule";
    schedule.textContent = `${plan.time} Uhr · ${formatIntakeRecurrence(plan)}`;
    meta.textContent = formatIntakeType(plan.type) + (plan.note ? ` · ${plan.note}` : "");
    actions.className = "intake-plan-actions";
    editButton.type = "button";
    editButton.className = "intake-edit-button";
    editButton.textContent = "Bearbeiten";
    editButton.setAttribute("aria-label", `${plan.name} bearbeiten`);
    editButton.addEventListener("click", function () {
      editIntakePlan(plan.id);
    });
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Löschen";
    deleteButton.setAttribute("aria-label", `${plan.name} löschen`);
    deleteButton.addEventListener("click", function () {
      deleteIntakePlan(plan.id);
    });
    details.append(name, schedule, meta);
    actions.append(editButton, deleteButton);
    listItem.append(details, actions);
    intakePlanList.append(listItem);
  });
}

function updateIntakeRecurrenceFields() {
  intakeWeekdaysField.hidden = intakeRecurrenceSelect.value !== "weekdays";
}

function updateIntakeEndDateMinimum() {
  intakeEndDateInput.min = intakeStartDateInput.value || "";

  if (intakeEndDateInput.value && intakeEndDateInput.value < intakeStartDateInput.value) {
    intakeEndDateInput.value = "";
  }
}

function resetIntakePlanForm() {
  intakePlanForm.reset();
  intakePlanIdInput.value = "";
  intakeTypeSelect.value = "supplement";
  intakeRecurrenceSelect.value = "once";
  intakeStartDateInput.value = selectedDate || todayDate;
  intakeTimeInput.value = "08:00";
  saveIntakePlanButton.textContent = "Einnahmeplan speichern";
  cancelIntakeEditButton.hidden = true;
  intakeWeekdayInputs.forEach(function (input) {
    input.checked = false;
  });
  updateIntakeRecurrenceFields();
  updateIntakeEndDateMinimum();
}

function editIntakePlan(planId) {
  const plan = intakePlans.find(function (entry) {
    return entry.id === planId;
  });

  if (!plan) {
    return;
  }

  intakePlanIdInput.value = plan.id;
  intakeNameInput.value = plan.name;
  intakeTypeSelect.value = plan.type;
  intakeNoteInput.value = plan.note;
  intakeStartDateInput.value = plan.startDate;
  intakeTimeInput.value = plan.time;
  intakeRecurrenceSelect.value = plan.recurrence;
  intakeEndDateInput.value = plan.endDate;
  intakeWeekdayInputs.forEach(function (input) {
    input.checked = plan.weekdays.includes(Number(input.value));
  });
  saveIntakePlanButton.textContent = "Änderungen speichern";
  cancelIntakeEditButton.hidden = false;
  intakeFormMessage.textContent = "Einnahmeplan wird bearbeitet.";
  updateIntakeRecurrenceFields();
  updateIntakeEndDateMinimum();
  intakePlanForm.scrollIntoView({ behavior: "smooth", block: "start" });
  intakeNameInput.focus({ preventScroll: true });
}

function removePlanConfirmations(planId) {
  const occurrencePrefix = `${planId}::`;

  Object.keys(appData).forEach(function (date) {
    const dayData = appData[date];

    if (!dayData || !dayData.intakeConfirmations || typeof dayData.intakeConfirmations !== "object") {
      return;
    }

    Object.keys(dayData.intakeConfirmations).forEach(function (occurrenceId) {
      if (occurrenceId.startsWith(occurrencePrefix)) {
        delete dayData.intakeConfirmations[occurrenceId];
      }
    });
  });
}

function deleteIntakePlan(planId) {
  const plan = intakePlans.find(function (entry) {
    return entry.id === planId;
  });

  if (!plan || !window.confirm(`„${plan.name}“ wirklich aus dem Einnahmeplan löschen?`)) {
    return;
  }

  intakePlans = intakePlans.filter(function (entry) {
    return entry.id !== planId;
  });
  removePlanConfirmations(planId);
  saveIntakePlans();
  saveAppData();

  if (intakePlanIdInput.value === planId) {
    resetIntakePlanForm();
  }

  intakeFormMessage.textContent = "Der Einnahmeplan wurde gelöscht.";
  renderIntakePlans();
  renderIntakesForDate(selectedDate);
  syncPushReminderSchedule();
}

function setPushReminderStatus(message, isError) {
  pushReminderStatus.textContent = message;
  pushReminderStatus.classList.toggle("is-error", Boolean(isError));
}

function supportsPushReminders() {
  return "serviceWorker" in navigator &&
    "Notification" in window &&
    "PushManager" in window;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, function (character) {
    return character.charCodeAt(0);
  });
}

function addDaysToDate(dateString, numberOfDays) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + numberOfDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Enthält bewusst weder Namen noch Notizen, sondern nur Termin-ID und Fälligkeitszeit.
function buildPushReminderSchedule(numberOfDays) {
  const reminders = [];

  for (let dayOffset = 0; dayOffset <= numberOfDays; dayOffset += 1) {
    const date = addDaysToDate(todayDate, dayOffset);

    intakePlans.forEach(function (plan) {
      if (!isIntakeScheduledForDate(plan, date)) {
        return;
      }

      reminders.push({
        occurrenceId: createIntakeOccurrenceId(plan.id, date),
        scheduledAt: new Date(`${date}T${plan.time}:00`).toISOString()
      });
    });
  }

  return reminders;
}

async function sendPushConfiguration(subscription) {
  if (!PUSH_CONFIG.subscriptionEndpoint) {
    setPushReminderStatus("Push-Erinnerungen sind vorbereitet, benötigen aber noch den Benachrichtigungsdienst.", false);
    return false;
  }

  const response = await fetch(PUSH_CONFIG.subscriptionEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      reminders: buildPushReminderSchedule(90)
    })
  });

  if (!response.ok) {
    throw new Error("Push-Konfiguration konnte nicht übertragen werden.");
  }

  return true;
}

async function activatePushReminders() {
  if (!supportsPushReminders()) {
    setPushReminderStatus("Push-Erinnerungen werden von diesem Browser oder Betriebssystem nicht unterstützt.", true);
    return;
  }

  try {
    let permission = window.Notification.permission;

    if (permission === "default") {
      permission = await window.Notification.requestPermission();
    }

    if (permission !== "granted") {
      setPushReminderStatus("Benachrichtigungen wurden nicht erlaubt. Die lokale Einnahmeplanung funktioniert weiterhin.", true);
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription && !PUSH_CONFIG.publicVapidKey) {
      setPushReminderStatus("Push-Erinnerungen sind vorbereitet, benötigen aber noch den Benachrichtigungsdienst.", false);
      return;
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUSH_CONFIG.publicVapidKey)
      });
    }

    const wasSent = await sendPushConfiguration(subscription);
    setPushReminderStatus(
      wasSent
        ? "Push-Erinnerungen sind aktiviert."
        : "Push-Erinnerungen sind vorbereitet, benötigen aber noch den Benachrichtigungsdienst.",
      false
    );
  } catch (error) {
    console.warn("Push-Erinnerungen konnten nicht aktiviert werden.", error);
    setPushReminderStatus("Push-Erinnerungen konnten nicht aktiviert werden. Die lokale Planung funktioniert weiterhin.", true);
  }
}

async function syncPushReminderSchedule() {
  if (
    !supportsPushReminders() ||
    window.Notification.permission !== "granted" ||
    !PUSH_CONFIG.subscriptionEndpoint
  ) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await sendPushConfiguration(subscription);
    }
  } catch (error) {
    console.warn("Der Push-Zeitplan konnte nicht synchronisiert werden.", error);
    setPushReminderStatus("Der Push-Zeitplan konnte nicht aktualisiert werden. Die lokale Planung bleibt gespeichert.", true);
  }
}

function openTargetedIntakeFromUrl() {
  const targetDate = getDateFromOccurrenceId(targetedIntakeOccurrenceId);

  if (!targetDate) {
    return;
  }

  selectedDate = targetDate;
  calendarIsOpen = targetDate !== todayDate;
  calendarDate.value = targetDate;
  renderSelectedDay();
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
  updateProfileSummary();
}

function hasSavedProfile() {
  return Boolean(
    profileData.age &&
    Number.isFinite(Number(profileData.dailyGoal)) &&
    profileData.fitnessGoal &&
    fitnessGoals[profileData.fitnessGoal]
  );
}

function updateProfileSummary() {
  const selectedGoal = fitnessGoals[profileData.fitnessGoal];
  const dailyGoal = Number(profileData.dailyGoal);

  profileSummaryGoal.textContent = Number.isFinite(dailyGoal)
    ? `${formatCalories(dailyGoal)} kcal`
    : `${formatCalories(DEFAULT_BUDGET)} kcal`;
  profileSummaryFitnessGoal.textContent = selectedGoal ? selectedGoal.label : "Noch nicht festgelegt";
}

// Zeigt entweder die kompakte Zusammenfassung oder den vollständigen Profileditor.
function setProfileCollapsed(shouldCollapse, moveFocus) {
  const isCollapsed = Boolean(shouldCollapse);

  profileEditor.hidden = isCollapsed;
  profileSummary.hidden = !isCollapsed;
  profileCollapseButton.hidden = isCollapsed;
  profileCollapseButton.setAttribute("aria-expanded", String(!isCollapsed));
  profileEditButton.setAttribute("aria-expanded", String(!isCollapsed));
  profileEditor.setAttribute("aria-hidden", String(isCollapsed));
  document.querySelector(".profile-card").classList.toggle("is-collapsed", isCollapsed);
  document.querySelector("#profile-heading").textContent = isCollapsed
    ? "Dein Kalorienziel"
    : "Kalorienziel berechnen";

  if (moveFocus === "summary" && isCollapsed) {
    window.setTimeout(function () {
      profileEditButton.focus();
    }, 0);
  } else if (moveFocus === "editor" && !isCollapsed) {
    window.setTimeout(function () {
      document.querySelector("#age").focus();
    }, 0);
  }
}

function fillProfileForm() {
  if (!profileData.age) {
    updateProfileSummary();
    setProfileCollapsed(false);
    return;
  }

  document.querySelector("#age").value = profileData.age;
  document.querySelector("#height").value = profileData.height;
  document.querySelector("#weight").value = profileData.weight;
  document.querySelector("#gender").value = profileData.gender;
  document.querySelector("#activity-level").value = profileData.activityLevel;

  if (hasSavedProfile() && Number.isFinite(profileData.maintenanceCalories)) {
    document.querySelector("#fitness-goal").value = profileData.fitnessGoal;
    showProfileResult(profileData.maintenanceCalories, profileData.fitnessGoal, profileData.dailyGoal);
    profileMessage.textContent = "Gespeichertes Profil und Kalorienziel wurden geladen.";
    setProfileCollapsed(true);
  } else {
    profileMessage.textContent = "Bitte wähle noch dein persönliches Fitnessziel aus.";
    setProfileCollapsed(false);
  }
}

function clearMessages() {
  mealMessage.textContent = "";
  activityMessage.textContent = "";
  intakeFormMessage.textContent = "";
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

function destroySavedActivityMaps() {
  savedActivityMaps.forEach(function (map) {
    map.remove();
  });
  savedActivityMaps.length = 0;
}

function initializeSavedRouteMap(mapElement, route) {
  if (!window.L) {
    mapElement.classList.add("route-map-unavailable");
    mapElement.textContent = "Die Karte konnte nicht geladen werden. Die gespeicherten Routendaten bleiben erhalten.";
    return;
  }

  const coordinates = route
    .filter(function (point) {
      return Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude));
    })
    .map(function (point) {
      return [Number(point.latitude), Number(point.longitude)];
    });

  if (coordinates.length === 0) {
    mapElement.classList.add("route-map-unavailable");
    mapElement.textContent = "Für diese Aktivität ist keine darstellbare Route vorhanden.";
    return;
  }

  const map = window.L.map(mapElement, { tap: true });
  addOpenStreetMapLayer(map);
  window.L.polyline(coordinates, {
    color: "#34785c",
    weight: 5,
    opacity: 0.9,
    lineCap: "round"
  }).addTo(map);
  window.L.circleMarker(coordinates[0], {
    radius: 6,
    color: "#ffffff",
    weight: 2,
    fillColor: "#34785c",
    fillOpacity: 1
  }).addTo(map).bindTooltip("Start");
  window.L.circleMarker(coordinates[coordinates.length - 1], {
    radius: 6,
    color: "#ffffff",
    weight: 2,
    fillColor: "#a6465b",
    fillOpacity: 1
  }).addTo(map).bindTooltip("Ziel");

  if (coordinates.length === 1) {
    map.setView(coordinates[0], 17);
  } else {
    map.fitBounds(coordinates, { padding: [24, 24], maxZoom: 17 });
  }

  savedActivityMaps.push(map);
  window.setTimeout(function () {
    map.invalidateSize();
  }, 0);
}

function renderActivities(dayData, isToday) {
  destroySavedActivityMaps();
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
    const isGpsActivity = activity.gpsTracked === true;
    let savedRouteWrap = null;

    listItem.className = isGpsActivity ? "entry gps-entry" : "entry";
    details.className = isGpsActivity ? "entry-details gps-entry-summary" : "entry-details";
    actions.className = "entry-actions";
    calories.className = "entry-calories activity-calories";
    name.textContent = activity.name;

    if (isGpsActivity) {
      const metrics = document.createElement("div");
      const distance = document.createElement("span");
      const averageSpeed = document.createElement("span");
      const gpsBadge = document.createElement("span");
      const durationMinutes = Number.isFinite(Number(activity.durationSeconds))
        ? Math.round(Number(activity.durationSeconds) / 60)
        : Number(activity.duration) || 0;

      metrics.className = "gps-entry-metrics";
      duration.textContent = `${durationMinutes} Minuten`;
      distance.textContent = `${formatDecimal(activity.distanceKm, 2)} km`;
      averageSpeed.textContent = `Ø ${formatDecimal(activity.averageSpeedKmh, 1)} km/h`;
      gpsBadge.className = "gps-badge";
      gpsBadge.textContent = "Per GPS aufgezeichnet";
      metrics.append(duration, distance, averageSpeed);
      details.append(name, metrics, gpsBadge);

      if (Array.isArray(activity.route) && activity.route.length > 0) {
        const routeButton = document.createElement("button");
        const routeWrap = document.createElement("div");
        const routeMap = document.createElement("div");
        let mapWasInitialized = false;

        routeButton.type = "button";
        routeButton.className = "route-toggle-button";
        routeButton.textContent = "Route anzeigen";
        routeButton.setAttribute("aria-expanded", "false");
        routeWrap.className = "saved-route-wrap";
        routeWrap.hidden = true;
        routeMap.className = "route-map";
        routeMap.setAttribute("role", "img");
        routeMap.setAttribute("aria-label", `Gespeicherte Route: ${activity.name}`);
        routeWrap.append(routeMap);
        savedRouteWrap = routeWrap;

        routeButton.addEventListener("click", function () {
          const willOpen = routeWrap.hidden;
          routeWrap.hidden = !willOpen;
          routeButton.textContent = willOpen ? "Route ausblenden" : "Route anzeigen";
          routeButton.setAttribute("aria-expanded", String(willOpen));

          if (willOpen && !mapWasInitialized) {
            mapWasInitialized = true;
            window.setTimeout(function () {
              initializeSavedRouteMap(routeMap, activity.route);
            }, 0);
          }
        });
        details.append(routeButton);
      }

      calories.textContent = activity.calorieEstimateAvailable === false
        ? "Gewicht fehlt"
        : `+ ${formatCalories(Number(activity.calories) || 0)} kcal`;
    } else {
      duration.textContent = `${activity.duration} Minuten`;
      details.append(name, duration);
      calories.textContent = `+ ${formatCalories(Number(activity.calories) || 0)} kcal`;
    }

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
    if (savedRouteWrap) {
      listItem.append(savedRouteWrap);
    }
    activityList.append(listItem);
  });
}

function updateDayNavigation(isToday) {
  todayButton.classList.toggle("active", isToday && !calendarIsOpen);
  calendarButton.classList.toggle("active", calendarIsOpen || !isToday);
  calendarButton.setAttribute("aria-expanded", String(calendarIsOpen));
  calendarPicker.hidden = !calendarIsOpen;
  pastDayNote.hidden = isToday;
  pastDayNote.textContent = selectedDate < todayDate
    ? "Vergangene Tage werden nur angezeigt. Einnahmebestätigungen können weiterhin korrigiert werden."
    : "Sport-, Mahlzeiten- und GPS-Eingaben sind nur für heute verfügbar.";

  mealForm.hidden = !isToday;
  activityForm.hidden = !isToday;
  gpsSportArea.hidden = !isToday;

  selectedDayLabel.textContent = isToday ? `Heute · ${formatDate(selectedDate)}` : formatDate(selectedDate);
  calorieHeading.textContent = isToday ? "Heute noch verfügbar" : "An diesem Tag verfügbar";
  mealListHeading.textContent = isToday ? "Heutige Mahlzeiten" : "Mahlzeiten an diesem Tag";
  activityListHeading.textContent = isToday ? "Heutige Aktivitäten" : "Aktivitäten an diesem Tag";
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
  renderIntakesForDate(selectedDate);
  renderIntakePlans();
}

showGpsChoiceButton.addEventListener("click", function () {
  showGpsChoiceButton.hidden = true;
  gpsChoice.hidden = false;
  setGpsMessage(gpsSetupMessage, "", false);
});

gpsSportInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    startGpsTrackingButton.disabled = false;
    setGpsMessage(gpsSetupMessage, "", false);
  });
});

startGpsTrackingButton.addEventListener("click", startGpsTracking);
pauseGpsTrackingButton.addEventListener("click", pauseGpsTracking);
stopGpsTrackingButton.addEventListener("click", stopGpsTracking);
profileEditButton.addEventListener("click", function () {
  setProfileCollapsed(false, "editor");
});
profileCollapseButton.addEventListener("click", function () {
  setProfileCollapsed(true, "summary");
});
intakeRecurrenceSelect.addEventListener("change", updateIntakeRecurrenceFields);
intakeStartDateInput.addEventListener("change", updateIntakeEndDateMinimum);
cancelIntakeEditButton.addEventListener("click", function () {
  resetIntakePlanForm();
  intakeFormMessage.textContent = "Bearbeiten wurde abgebrochen.";
});
enablePushRemindersButton.addEventListener("click", activatePushReminders);

intakePlanForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = intakeNameInput.value.trim();
  const selectedWeekdays = Array.from(intakeWeekdayInputs)
    .filter(function (input) {
      return input.checked;
    })
    .map(function (input) {
      return Number(input.value);
    });

  if (intakeRecurrenceSelect.value === "weekdays" && selectedWeekdays.length === 0) {
    intakeFormMessage.textContent = "Bitte wähle mindestens einen Wochentag aus.";
    return;
  }

  if (intakeEndDateInput.value && intakeEndDateInput.value < intakeStartDateInput.value) {
    intakeFormMessage.textContent = "Das Enddatum darf nicht vor dem Startdatum liegen.";
    return;
  }

  const existingPlan = intakePlans.find(function (plan) {
    return plan.id === intakePlanIdInput.value;
  });
  const now = Date.now();
  const plan = {
    id: existingPlan ? existingPlan.id : createIntakePlanId(),
    name: name,
    type: intakeTypeSelect.value,
    note: intakeNoteInput.value.trim(),
    startDate: intakeStartDateInput.value,
    time: intakeTimeInput.value,
    recurrence: intakeRecurrenceSelect.value,
    weekdays: intakeRecurrenceSelect.value === "weekdays" ? selectedWeekdays : [],
    endDate: intakeEndDateInput.value,
    createdAt: existingPlan ? existingPlan.createdAt : now,
    updatedAt: now
  };

  if (existingPlan) {
    intakePlans = intakePlans.map(function (entry) {
      return entry.id === plan.id ? plan : entry;
    });
  } else {
    intakePlans.push(plan);
  }

  if (!saveIntakePlans()) {
    return;
  }

  const successMessage = existingPlan
    ? "Der Einnahmeplan wurde aktualisiert."
    : "Der Einnahmeplan wurde gespeichert.";
  resetIntakePlanForm();
  intakeFormMessage.textContent = successMessage;
  renderIntakePlans();
  renderIntakesForDate(selectedDate);
  syncPushReminderSchedule();
});

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
  updateGpsLiveValues();
  renderSelectedDay();
  setProfileCollapsed(true, "summary");
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
  const caloriesRate = Number(caloriesPerMinute[sportSelect.value]);
  const burnedCalories = Math.round(duration * (Number.isFinite(caloriesRate) ? caloriesRate : 5));
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

calendarDate.value = todayDate;
intakePlans = loadIntakePlans();
resetIntakePlanForm();

if (!supportsPushReminders()) {
  setPushReminderStatus("Push-Erinnerungen werden von diesem Browser oder Betriebssystem nicht unterstützt. Die lokale Planung funktioniert weiterhin.", true);
}

fillProfileForm();
renderSelectedDay();
restoreGpsDraft();
openTargetedIntakeFromUrl();

// Beim Verlassen wird nur ein Zwischenstand gespeichert, keine unfertige Aktivität.
window.addEventListener("pagehide", persistGpsDraft);

// Der Service Worker ermöglicht den Start der App aus dem Offline-Cache.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
      console.warn("Der Service Worker konnte nicht registriert werden.", error);
    });
  });
}
