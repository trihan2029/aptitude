// Configuration
const totalQuestions = 33;
const timePerQuestion = 60; // seconds
const totalTime = totalQuestions * timePerQuestion;

const questions = Array.from({ length: totalQuestions }, (_, i) => ({
  img: `questions/${i+1}.PNG`,
  options: [1, 2, 3, 4],
}));

let correctAnswers = Array(totalQuestions).fill(null); // Loaded later from file

let currentQuestion = 0;
let answers = Array(totalQuestions).fill(null);
let guessed = Array(totalQuestions).fill(false);
let remainingTime = totalTime;
let timerInterval;
let perQuestionTimers = Array(totalQuestions).fill(0);
let questionStartTime = Date.now();

// Start Timer
function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimer();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

// Update Main Timer
function updateTimer() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('timer').textContent = `⏰ Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  document.getElementById('timer').style.fontWeight = 'bold';
  document.getElementById('timer').style.color = 'red';
}

// Load Question
function loadQuestion(index) {
  saveTimeSpent();

  currentQuestion = index;
  const q = questions[index];
  document.getElementById('questionImage').src = q.img;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  q.options.forEach((option) => {
    const button = document.createElement('button');
    button.textContent = `${option}`;
    button.onclick = () => selectOption(index, option);
    if (answers[index] === option) {
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
    }
    optionsDiv.appendChild(button);
  });

  // Guessed checkbox
  const guessBox = document.getElementById('guessCheckbox');
  if (guessBox) {
    guessBox.checked = guessed[index];
    guessBox.onchange = () => {
      guessed[index] = guessBox.checked;
    };
  }

  updateUnanswered();
  questionStartTime = Date.now();
}

// Save time spent when moving question
function saveTimeSpent() {
  const now = Date.now();
  const timeSpent = Math.floor((now - questionStartTime) / 1000);
  if (currentQuestion >= 0 && currentQuestion < totalQuestions) {
    perQuestionTimers[currentQuestion] += timeSpent;
  }
}

// Select Option
function selectOption(questionIndex, selectedOption) {
  answers[questionIndex] = selectedOption;
  loadQuestion(questionIndex);
}

// Navigation
function nextQuestion() {
  if (currentQuestion < totalQuestions - 1) {
    currentQuestion++;
    loadQuestion(currentQuestion);
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion(currentQuestion);
  }
}

// Update Unanswered
function updateUnanswered() {
  const list = document.getElementById('unansweredList');
  list.innerHTML = '';
  answers.forEach((ans, idx) => {
    const span = document.createElement('span');
    span.textContent = `${idx + 1} `;
    span.style.cursor = "pointer";
    span.style.fontWeight = "bold";
    span.style.margin = "5px";

    if (ans) {
      span.style.color = "green"; // Answered
    } else {
      span.style.color = "red"; // Not Answered
    }

    if (guessed[idx]) {
      span.style.border = '2px dashed yellow';
    }

    span.onclick = () => {
      currentQuestion = idx;
      loadQuestion(currentQuestion);
    };

    list.appendChild(span);
  });
}

// Submit Test
function submitTest() {
  clearInterval(timerInterval);
  saveTimeSpent();

  let correct = 0;
  let wrong = 0;
  const guessedQuestions = [];

  answers.forEach((ans, idx) => {
    if (ans !== null) {
      if (ans === correctAnswers[idx]) {
        correct++;
      } else {
        wrong++;
      }
    }
    if (guessed[idx]) guessedQuestions.push(idx + 1);
  });

  const totalAttempted = correct + wrong;
  const percentage = ((correct / totalQuestions) * 100).toFixed(2);

  alert(`✅ Test Completed!\n\nTotal Questions: ${totalQuestions}\nAttempted: ${totalAttempted}\nCorrect: ${correct}\nWrong: ${wrong}\nGuessed: ${guessedQuestions.length}\nPercentage: ${percentage}%`);

  generateReport();
}

// Generate Detailed Report (Only guessed or incorrect)
function generateReport() {
  let report = "Q.No | Your Answer | Correct Answer | Time Spent | Guessed\n";
  report += "--------------------------------------------------------\n";

  for (let i = 0; i < totalQuestions; i++) {
    const userAns = answers[i];
    const correctAns = correctAnswers[i];
    const isIncorrect = userAns !== correctAns;
    const isGuessed = guessed[i];

    if (isIncorrect || isGuessed) {
      report += `Q${i+1}: ${userAns ?? 'Not Answered'} | ${correctAns} | ${perQuestionTimers[i]} sec | ${isGuessed ? 'Yes' : 'No'}\n`;
    }
  }

  downloadReport(report);
}

// Download Report as text file
function downloadReport(content) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "exam_report.txt";
  a.click();
}

// Load correct answers from a text file
function loadCorrectAnswers(fileUrl) {
  fetch(fileUrl)
    .then(response => response.text())
    .then(text => {
      correctAnswers = text.trim().split("\n").map(Number);
    })
    .catch(err => console.error("Error loading answers file:", err));
}

// Initialize
window.onload = () => {
  loadCorrectAnswers('answers.txt');
  loadQuestion(currentQuestion);
  startTimer();
};
