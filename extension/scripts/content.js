const API_KEY = "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";


function removeTwoLines(str){
    return str.replace(/^.*\n.*\n/,'');
}
function removePeriod(json) {
    json.forEach(function (element, index) {
        if (element === ".") {
            json.splice(index, 1);
        }
    });
    return json;
}

function createResponse(json) {
    let response = "";
    let choices = removePeriod(json.choices);
    if (choices.length > 0) {
        response = json.choices[0].text

    }

    return response;
}

async function openAi(question){
    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY
            },
            body: JSON.stringify({
                'model': "text-davinci-003",
                'prompt': question,
                'temperature': 0,
                'max_tokens': 1000
            })
        });

        if (!response.ok) {
            console.error("HTTP ERROR: " + response.status + "\n" + response.statusText);
        } else {
            const data = await response.json();
            console.log(createResponse(data));
            return removeTwoLines(createResponse(data));
        }
    } catch (error) {
        console.error("ERROR something broke: " + error);
    }
}

function multipleChoice(element, text){
    let question = "This is a multiple choice question. Only return a number that corresponds with the choice. Here is the question: " + text;
    const parent = element.parentNode.parentNode;
    const answers = parent.querySelectorAll(".answer");

    answers.forEach(answer => {
        const label = answer.querySelector("label");
        const labelText = label.textContent;
        console.log(labelText);
        question += "-" + labelText;
    });
    console.log(question);
    let answer = "";
    openAi(question).then(function(data){
        answer = parseInt(data);
        let finalAnswer = answers[answer-1];
        let radioInput = finalAnswer.querySelector("input[type='radio']");
        radioInput.checked = true;
    });
}

function shortAnswer(element, text){
    answer = ""
    let question = text;
    openAi(question).then(function(data){
        answer = data;
        const parent = element.parentNode.parentNode;
        const answerDiv = parent.querySelector('.answer');
        let textArea = answerDiv.querySelector("textArea");
        textArea.value = answer;

    });
}

function output(element){
    const parent = element.parentNode;
    const question = parent.querySelector("label");
    const questionText = question.innerText;
    console.log(questionText);

    if(question.classList.contains("mc")){
        console.log("THIS IS A MC QUESTION");
        multipleChoice(question, questionText);
    } else if (question.classList.contains("sa")){
        console.log("THIS IS A SA QUESTION");
        shortAnswer(question, questionText)

    }
}


const newElement = document.createElement('button');
newElement.innerHTML = "Answer";
newElement.type = "button";
newElement.title = "Click to generate an answer";

document.querySelectorAll('.question').forEach( element => {
    let answerButton = newElement.cloneNode(true);
    element.appendChild(answerButton);
    answerButton.addEventListener('click', function(event){
        output(event.currentTarget);
    });
    
});





