// Configuration
const totalQuestions = 50;
const timePerQuestion = 180; // seconds
const totalTime = totalQuestions * timePerQuestion;

let questions = [];
let correctAnswers = [];

let currentQuestion = 0;
let answers = Array(totalQuestions).fill(null);
let guessed = Array(totalQuestions).fill(false);
let remainingTime = totalTime;
let timerInterval;
let perQuestionTimers = Array(totalQuestions).fill(0);
let questionStartTime = Date.now();
let isPaused = false;

// Fisher–Yates Shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Start Timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      updateTimer();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        submitTest();
      }
    }
  }, 1000);
}

// Update Timer Display
function updateTimer() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('timer').textContent =
    `⏰ Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  document.getElementById('timer').style.fontWeight = 'bold';
  document.getElementById('timer').style.color = 'red';
}

// Pause / Resume
function togglePause() {
  const btn = document.getElementById('pauseBtn');
  isPaused = !isPaused;

  if (isPaused) {
    saveTimeSpent();
    btn.textContent = '▶ Resume';
  } else {
    questionStartTime = Date.now();
    btn.textContent = '⏸ Pause';
  }
}

// Load Question
function loadQuestion(index) {
  saveTimeSpent();

  currentQuestion = index;
  const q = questions[index];

  document.getElementById('questionImage').src = q.img;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  q.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => selectOption(index, option);

    if (answers[index] === option) {
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
    }

    optionsDiv.appendChild(button);
  });

  const guessBox = document.getElementById('guessCheckbox');
  guessBox.checked = guessed[index];
  guessBox.onchange = () => guessed[index] = guessBox.checked;

  updateUnanswered();
  questionStartTime = Date.now();
}

// Save Time Spent
function saveTimeSpent() {
  const now = Date.now();
  const timeSpent = Math.floor((now - questionStartTime) / 1000);
  if (currentQuestion >= 0 && currentQuestion < totalQuestions) {
    perQuestionTimers[currentQuestion] += timeSpent;
  }
}

// Select Option
function selectOption(qIndex, option) {
  answers[qIndex] = option;
  loadQuestion(qIndex);
}

// Navigation
function nextQuestion() {
  if (currentQuestion < totalQuestions - 1) {
    loadQuestion(currentQuestion + 1);
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    loadQuestion(currentQuestion - 1);
  }
}

// Update Question Status
function updateUnanswered() {
  const list = document.getElementById('unansweredList');
  list.innerHTML = '';

  answers.forEach((ans, idx) => {
    const span = document.createElement('span');
    span.textContent = `${idx + 1}`;
    span.style.margin = '5px';
    span.style.cursor = 'pointer';
    span.style.fontWeight = 'bold';

    span.style.color = ans !== null ? 'green' : 'red';
    if (guessed[idx]) span.style.border = '2px dashed orange';

    span.onclick = () => loadQuestion(idx);
    list.appendChild(span);
  });
}

// Submit Test
function submitTest() {
  clearInterval(timerInterval);
  saveTimeSpent();

  let correct = 0;
  let wrong = 0;

  answers.forEach((ans, i) => {
    if (ans !== null) {
      ans === correctAnswers[i] ? correct++ : wrong++;
    }
  });

  const percentage = ((correct / totalQuestions) * 100).toFixed(2);

  alert(
    `✅ Test Completed\n\n` +
    `Total Questions: ${totalQuestions}\n` +
    `Correct: ${correct}\n` +
    `Wrong: ${wrong}\n` +
    `Percentage: ${percentage}%`
  );

  generateReport();
}

// Report
function generateReport() {
  let report = "Q | Your | Correct | Time | Guessed\n";
  report += "-------------------------------------\n";

  for (let i = 0; i < totalQuestions; i++) {
    if (answers[i] !== correctAnswers[i] || guessed[i]) {
      report +=
        `${i + 1} | ${answers[i] ?? 'NA'} | ${correctAnswers[i]} | ` +
        `${perQuestionTimers[i]}s | ${guessed[i] ? 'Yes' : 'No'}\n`;
    }
  }

  const blob = new Blob([report], { type: "text/plain" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "exam_report.txt";
  a.click();
}

// Load Answers + Shuffle Questions
function loadCorrectAnswers(fileUrl) {
  fetch(fileUrl)
    .then(res => res.text())
    .then(text => {
      const ans = text.trim().split('\n').map(Number);

      questions = Array.from({ length: totalQuestions }, (_, i) => ({
        img: `questions/${i + 1}.PNG`,
        options: [1, 2, 3, 4, 5],
        correct: ans[i]
      }));

      shuffleArray(questions);
      correctAnswers = questions.map(q => q.correct);
    });
}

// Init
window.onload = () => {
  loadCorrectAnswers('answers.txt');
  loadQuestion(0);
  startTimer();
};
