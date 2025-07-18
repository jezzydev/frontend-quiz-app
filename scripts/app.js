const root = document.querySelector(':root');
const themeCheckbox = document.querySelector('#theme-checkbox');
const main = document.querySelector('main');
const menuContainer = document.querySelector('.menu-container');
const quizContainer = document.querySelector('.quiz-container');
const quizEndContainer = document.querySelector('.quiz-end-container');
const questionNum = document.querySelector('.question-num');
const allTotalQuestionsNum = document.querySelectorAll('.total-questions-num');
const questionText = document.querySelector('.question-text');
const progressBar = document.querySelector('.progress-bar');
const choicesContainer = document.querySelector('.choices-container');
const submitAnswerBtn = document.querySelector('.submit-answer-btn');
const playAgainBtn = document.querySelector('.play-again-btn');
const choiceLetters = ['A', 'B', 'C', 'D'];
const iconCorrectUrl = './assets/images/icon-correct.svg';
const iconIncorrectUrl = './assets/images/icon-incorrect.svg';
const showContainerClassName = 'show-container';
const errorMsg = document.querySelector('.error-msg');
const submitAnswerDefaultText = 'Submit Answer';
const nextQuestionText = 'Next Question';
let quizzes = [];
let selectedSubject = {};
let currentQuestionIndex = -1;
let score = 0;
let answered = false;

//load current or default theme
const currentTheme = localStorage.getItem('theme');
setTheme(currentTheme);

function setTheme(newTheme) {
    if (newTheme === 'dark') {
        themeCheckbox.checked = true;
        root.classList = 'dark';
        localStorage.setItem('theme', 'dark');

    }
    else {
        themeCheckbox.checked = false;
        root.className = 'light';
        localStorage.setItem('theme', 'light');

    }
}

themeCheckbox.addEventListener('change', function () {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        setTheme('light');
    }
    else {
        setTheme('dark');
    }
});

playAgainBtn.addEventListener('click', function () {
    quizEndContainer.classList.remove(showContainerClassName);
    menuContainer.classList.add(showContainerClassName);
    resetValues();
});

submitAnswerBtn.addEventListener('click', function () {
    if (answered) {
        if (currentQuestionIndex + 1 < selectedSubject.questions.length) {
            prepareForNextQuestion();
            loadQuestion(selectedSubject, currentQuestionIndex + 1);
            this.innerText = submitAnswerDefaultText;
        }
        else {
            endGame();
        }
    }
    else {
        //validate answer
        const selected = choicesContainer.querySelector('.choice-btn.selected');
        const question = selectedSubject.questions[currentQuestionIndex];
        const index = question.options.findIndex(op => op === question.answer);

        //no answer is selected
        if (selected == null) {
            errorMsg.style.display = 'flex';
            return;
        }
        //correct answer is selected
        else if (selected.getAttribute('data-option-index') == index) {
            selected.classList.add('correct');
            score += 1;
        }
        //wrong answer is selected
        else {
            selected.classList.add('wrong');
            const correctAnswerIcon = choicesContainer.querySelector(`.choice-btn[data-option-index='${index}'] .choice-result-icon`);
            correctAnswerIcon.style.display = 'inline-block';
        }

        choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
        });

        answered = true;
        this.innerText = nextQuestionText;
    }
});

//load subjects from json file
fetch('data.json')
    .then(response => {
        if (!response.ok) {
            alert('Error encountered while fetching the data.');
            throw new Error(response.status);
        }
        else {
            return response.json();
        }
    })
    .then(jsonData => {
        const subjectContainer = document.querySelector('.subjects-container');
        quizzes = jsonData.quizzes;

        for (let i = 0; i < quizzes.length; i++) {
            const data = quizzes[i];

            const subject = document.createElement('li');
            subject.className = 'subject';

            const subjectButton = document.createElement('button');
            subjectButton.type = 'button';
            subjectButton.id = 'subjectButton' + i;
            subjectButton.name = 'subjectButton' + i;
            subjectButton.className = 'subject-btn';
            subjectButton.setAttribute('data-subject', data.title.toLowerCase());
            subjectButton.addEventListener('click', function () {
                selectedSubject = data;
                updateCurrentSubjectContainers(this);
                updateTotalQuestions(selectedSubject.questions.length);
                loadQuestion(selectedSubject, 0);

                menuContainer.classList.remove(showContainerClassName);
                quizContainer.classList.add(showContainerClassName);
            });

            const subjectTitle = document.createElement('p');
            subjectTitle.className = 'subject-title';
            subjectTitle.innerText = data.title;

            const subjectIconContainer = document.createElement('span');
            subjectIconContainer.className = 'subject-icon-container';

            const subjectIcon = document.createElement('img');
            subjectIcon.className = 'subject-icon';
            subjectIcon.alt = data.title + ' icon';
            subjectIcon.src = data.icon;

            subjectIconContainer.append(subjectIcon);
            subjectButton.append(subjectIconContainer, subjectTitle);
            subject.append(subjectButton);
            subjectContainer.append(subject);
        }
    })
    .catch(error => {
        alert('Failed loading subjects into the page.');
        alert(error);
    })

function updateTotalQuestions(total) {
    allTotalQuestionsNum.forEach(elem => {
        elem.innerText = total;
    });
}

function updateCurrentSubjectContainers(selectedSubjectBtn) {
    const currentSubjectContainers = document.querySelectorAll('.current-subject-container');

    currentSubjectContainers.forEach(container => {
        const iconContainer = selectedSubjectBtn.querySelector('.subject-icon-container').cloneNode(true);
        const title = selectedSubjectBtn.querySelector('.subject-title').cloneNode(true);
        container.innerHTML = "";
        container.append(iconContainer, title);
        container.setAttribute('data-subject', selectedSubjectBtn.dataset.subject);
    });
}

function prepareForNextQuestion() {
    questionText.innerText = '';
    choicesContainer.innerHTML = '';
    errorMsg.style.display = 'none';
    answered = false;
}

function loadQuestion(subject, questionIndex) {
    //get question 
    currentQuestionIndex = questionIndex;
    const question = subject.questions[questionIndex];
    const answer = question.answer;

    //display question
    questionNum.innerHTML = questionIndex + 1;
    questionText.innerText = question.question;
    choicesContainer.innerHTML = '';

    //update progressbar
    const progress = (questionIndex + 1) / subject.questions.length * 100;
    progressBar.style.setProperty('--progress', progress.toString() + '%');

    //display choices
    for (let i = 0; i < question.options.length; i++) {
        const choiceValue = question.options[i];
        const choice = document.createElement('li');
        choice.className = 'choice';

        const choiceButton = document.createElement('button');
        choiceButton.className = 'choice-btn';
        choiceButton.type = 'button';
        choiceButton.setAttribute('data-option-index', i);
        choiceButton.addEventListener('click', function () {

            //unselect currently selected choice, if any
            const selected = choicesContainer.querySelector('.choice-btn.selected');

            if (selected) {
                selected.classList.remove('selected');
            }
            else {
                errorMsg.style.display = 'none';
            }

            choiceButton.classList.add('selected');
        });

        const choiceLetter = document.createElement('span');
        choiceLetter.className = 'choice-letter';
        choiceLetter.innerText = choiceLetters[i];

        const choiceText = document.createElement('p');
        choiceText.className = 'choice-text';
        choiceText.innerText = choiceValue;

        const choiceResultIcon = document.createElement('img');
        choiceResultIcon.className = 'choice-result-icon';
        choiceResultIcon.alt = 'choice result icon' + i;

        if (answer === choiceValue) {
            choiceResultIcon.src = iconCorrectUrl;
        }
        else {
            choiceResultIcon.src = iconIncorrectUrl;
        }

        choiceButton.append(choiceLetter, choiceText, choiceResultIcon);
        choice.append(choiceButton);
        choicesContainer.append(choice);
    }
}

function endGame() {
    quizContainer.classList.remove(showContainerClassName);

    quizEndContainer.classList.add(showContainerClassName);
    const finalScore = document.querySelector('.final-score');
    finalScore.innerText = score;
}

function resetValues() {
    quizzes = [];
    selectedSubject = {};
    currentQuestionIndex = -1;
    questionNum.innerText = "";
    updateTotalQuestions(0);
    progressBar.style.setProperty('--progress', '0px');
    errorMsg.style.display = 'none';
    score = 0;
    submitAnswerBtn.innerText = submitAnswerDefaultText;
    answered = false;
}
