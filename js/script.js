let preQuestions = [];  //  Variable to hold questions object

let myProgressBar = document.querySelector(".myProgress");  // Progress Bar Background
let myBar = document.querySelector(".myBar");   //  Progress Bar
let myTimer = document.querySelector(".myTimer");   // Timer text

let showIndex = document.querySelector('#index');   // Question Index
let question = document.querySelector('.question'); //  Question
let answers = document.querySelectorAll('.list-group-item');    //  Answers
let questionBoxes = document.querySelectorAll('.questionBox');   // Question Right/Wrong boxes

let list = document.querySelector('.list'); // Question, answers view
let results = document.querySelector('.results');   // Results view
let userScorePoint = document.querySelector('.userScorePoint'); //  Current player score
let average = document.querySelector('.average')    // Average score text

let pointsElem = document.querySelector('.score');  //  Score text
let restart = document.querySelector('.restart');   //  Restart button
let index = 0;  //  Question index
let points = 0; // Player points
let aveScore = 0;   //  Average player score
let startInterval;  //  Variable to start and stop timer

createDivs();   //  Create boxes that will show history of answers
getQuestions(); // Get questions from server

function getQuestions(){ // Get questions from server
    fetch('https://quiztai.herokuapp.com/api/quiz')
        .then(resp => resp.json())
        .then(resp => {
            preQuestions = resp;
            //localStorage.removeItem("games"); // Flush local storage for testing
            //localStorage.removeItem("points"); // Flush local storage for testing
            setQuestion(index); // Set first question
            activateAnswers();  // Activate first answers

            restart.addEventListener('click', function (event) {    //  Restart button
                event.preventDefault();
                resetQuestionBox(); //  Reset Question Boxes Color
                showProgress();
                index = 0;
                points = 0;
                userScorePoint.innerHTML = points;
                setQuestion(index);
                activateAnswers();
                list.style.display = 'block';
                results.style.display = 'none';
            });    //  Restart button
        });
} // Get questions from server

function resetQuestionBox(){ //  Reset Question Boxes Color
    for(let i = 0; i < preQuestions.length; i++){
        let qBox = document.querySelector('#q'+i)
        qBox.classList.remove('correct');
        qBox.classList.remove('incorrect');
        qBox.classList.add('gray');
    }
} //  Reset Question Boxes Color

function showProgress(){    //  Show Progress Bar
    myBar.style.display = 'block';
    myProgressBar.style.display = 'block';
    myTimer.style.display = 'block';
}    //  Show Progress Bar

function hideProgress(){    //  Hide Progress Bar
    myBar.style.display = 'none';
    myProgressBar.style.display = 'none';
    myTimer.style.display = 'none';
}    //  Hide Progress Bar

function activateAnswers(){ // Activate Answers
    for(let i = 0; i < answers.length; i++){
        answers[i].addEventListener('click', doAction);
        answers[i].classList.remove('correct');
        answers[i].classList.remove('incorrect');
        answers[i].classList.remove('gray');
    }
    runProgress();
} // Activate Answers

function disableAnswers(){  //  Disable answers
    for(let i = 0; i < answers.length; i++){
        answers[i].removeEventListener('click', doAction);
    }
}  //  Disable answers

function markChecking(elem){ //  Mark checking
    elem.classList.add('check')
} //  Mark checking

function markCorrect(elem){ //  Mark correct
    elem.classList.remove('check');
    elem.classList.add('correct');
} //  Mark correct

function markInCorrect(elem){   // Mark incorrect
    elem.classList.remove('check');
    elem.classList.add('incorrect');
}   // Mark incorrect

function markNotAnswered(elem){   // Mark not answered
    elem.classList.add('gray');
}   // Mark not answered

function doAction(event) { // Answer OnClick Event
    clearInterval(startInterval);
    disableAnswers();
    markChecking(event.target);
    let markAnswer = setTimeout(wait, 2000);
    function wait(){
        let qBox = document.querySelector("#q" + index);
        if (event.target.innerHTML === preQuestions[index].correct_answer) {
            points++;
            pointsElem.innerText = points;
            markCorrect(event.target);
            qBox.classList.remove("gray");
            markCorrect(qBox);
        }
        else {
            answers.forEach(item =>{
               if(item.innerHTML ===  preQuestions[index].correct_answer){
                   markCorrect(item);
               }
            })

            markInCorrect(event.target);
            qBox.classList.remove("gray");
            markInCorrect(qBox);
        }
        clearTimeout(markAnswer);
    }
    nextQuestion();
} // Answer OnClick Event

function nextQuestion(){    //  Next question
    let checkAnswer = setTimeout(goNext, 4000);

    function goNext() { //  Next question
        index++;
        console.log("Index: " + index);
        if (index >= preQuestions.length) {
            saveScore();
            hideProgress();
            list.style.display = 'none';
            results.style.display = 'block';
            userScorePoint.innerHTML = points;
            average.innerHTML = aveScore;
        } else {
            setQuestion(index);
            activateAnswers();
        }
        clearTimeout(checkAnswer);
    }
}   //  Next question

function saveScore(){   // Save score, count average score
    let games = JSON.parse(localStorage.getItem("games")); // Get number of games played
    let prevScore = JSON.parse(localStorage.getItem("points")); // Get previous total score
    if(games == null){
        games = 0;
    }
    if(prevScore == null){
        prevScore = 0;
    }
    games += 1;
    prevScore = prevScore + points;

    localStorage.setItem("games", JSON.stringify(games)); // Save number of games played
    localStorage.setItem("points", JSON.stringify(prevScore)); // Save total score
    localStorage.setItem("average", JSON.stringify(prevScore / games)); // Save average score

    aveScore = JSON.parse(localStorage.getItem("average"));  // Get average score

    console.log("Current score: " + points);
    console.log("Games played: " + games);
    console.log("Total score: " + prevScore);
    console.log("Average score: " + aveScore);
}   // Save score, count average score

function setQuestion(index) { // Set question
    showIndex.innerHTML = (index + 1);
    question.innerHTML = preQuestions[index].question;

    answers[0].innerHTML = preQuestions[index].answers[0];
    answers[1].innerHTML = preQuestions[index].answers[1];
    answers[2].innerHTML = preQuestions[index].answers[2];
    answers[3].innerHTML = preQuestions[index].answers[3];


    if(preQuestions[index].answers.length === 2){
        answers[2].style.display = 'none';
        answers[3].style.display = 'none';
    }
    else {
        answers[2].style.display = 'block';
        answers[3].style.display = 'block';
    }
} // Set question

function runProgress(){ // Create and run timer
    let width = 100;
    let time = 10;
    myTimer.innerHTML = time + " s";
    myBar.style.backgroundColor = "cornflowerblue";
    startInterval = setInterval(frame, 1000);
    function frame() {
        if (width <= 0) {
            clearInterval(startInterval);
            disableAnswers();
            let markAnswer = setTimeout(wait, 1500);
            function wait(){
                clearTimeout(markAnswer);
            }
            nextQuestion();
        } else {
            width -= 10;
            if (time > 0) {
                time--;
            }
            if (time === 4) {
                myBar.style.backgroundColor = "red";
            }
            myBar.style.width = width + "%";
            myTimer.innerHTML = time + " s";
        }
    }
} // Create and run timer

function createDivs(){ // Create questions boxes
    let questionBar = document.querySelector(".questionBar");
    let toAdd = "";
    for(let i=0; i < 20; i++){
        let idDiv = "q" + i;
        let newDiv = '<div class="questionBox gray" id='+idDiv+'></div>';

        toAdd += newDiv;
    }

    questionBar.innerHTML = toAdd;
} // Create questions boxes
