// ================= CONFIG =================
const totalQuestions = 50;
const timePerQuestion = 180;
let remainingTime = totalQuestions * timePerQuestion;

// ================= STATE =================
let questions = [];
let correctAnswers = [];

let currentQuestion = 0;
let answers = Array(totalQuestions).fill(null);
let guessed = Array(totalQuestions).fill(false);
let perQuestionTimers = Array(totalQuestions).fill(0);

let timerInterval = null;
let isPaused = false;

// Time tracking
let questionStartTime = null;

// ================= UTILS =================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ================= TIMER =================
function startTimer() {
  updateTimer();
  timerInterval = setInterval(() => {
    if (isPaused) return;

    remainingTime--;
    updateTimer();

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  document.getElementById("timer").textContent =
    `⏰ Time Left: ${m}:${s < 10 ? "0" : ""}${s}`;
}

// ================= PAUSE =================
function togglePause() {
  const btn = document.getElementById("pauseBtn");

  if (!isPaused) {
    saveTimeSpent();
    isPaused = true;
    btn.textContent = "▶ Resume";
  } else {
    isPaused = false;
    questionStartTime = Date.now();
    btn.textContent = "⏸ Pause";
  }
}

// ================= TIME TRACK =================
function saveTimeSpent() {
  if (questionStartTime === null || isPaused) return;

  const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
  perQuestionTimers[currentQuestion] += elapsed;
}

// ================= QUESTIONS =================
function loadQuestion(index) {
  saveTimeSpent();

  currentQuestion = index;
  questionStartTime = Date.now();

  const q = questions[index];
  document.getElementById("questionImage").src = q.img;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      answers[index] = opt;
      loadQuestion(index);
    };

    if (answers[index] === opt) {
      btn.style.background = "#4CAF50";
      btn.style.color = "white";
    }
    optionsDiv.appendChild(btn);
  });

  const g = document.getElementById("guessCheckbox");
  g.checked = guessed[index];
  g.onchange = () => guessed[index] = g.checked;

  updateUnanswered();
}

// ================= NAV =================
function nextQuestion() {
  if (currentQuestion < totalQuestions - 1)
    loadQuestion(currentQuestion + 1);
}

function prevQuestion() {
  if (currentQuestion > 0)
    loadQuestion(currentQuestion - 1);
}

// ================= STATUS =================
function updateUnanswered() {
  const div = document.getElementById("unansweredList");
  div.innerHTML = "";

  answers.forEach((a, i) => {
    const s = document.createElement("span");
    s.textContent = i + 1;
    s.style.margin = "5px";
    s.style.cursor = "pointer";
    s.style.fontWeight = "bold";
    s.style.color = a === null ? "red" : "green";
    if (guessed[i]) s.style.border = "2px dashed orange";
    s.onclick = () => loadQuestion(i);
    div.appendChild(s);
  });
}

// ================= SUBMIT =================
function submitTest() {
  clearInterval(timerInterval);
  saveTimeSpent();

  let correct = 0;
  answers.forEach((a, i) => {
    if (a === correctAnswers[i]) correct++;
  });

  alert(
    `Test Completed\n\nCorrect: ${correct}\nWrong: ${totalQuestions - correct}`
  );
}

// ================= LOAD & SHUFFLE =================
async function initTest() {
  const res = await fetch("answers.txt");
  const ans = (await res.text()).trim().split("\n").map(Number);

  questions = Array.from({ length: totalQuestions }, (_, i) => ({
    img: `questions/${i + 1}.PNG`,
    options: [1, 2, 3, 4, 5],
    correct: ans[i]
  }));

  shuffleArray(questions);
  correctAnswers = questions.map(q => q.correct);

  loadQuestion(0);
  startTimer();
}

// ================= START =================
window.onload = initTest;
