var messages = [], // array to hold the chat history
  lastUserMessage = "", // keeps track of the latest user input
  botMessage = "", // keeps track of chatbot's response
  botName = 'Chatbot', // chatbot's name
  step = 0, // to track the current step in the conversation
  userDetails = {}; // object to store user details

// This function calls the Flask backend for workout recommendations
function getWorkoutRecommendation() {
  // Validate user details before sending the request
  if (!userDetails.gender || !userDetails.age || !userDetails.weight || !userDetails.height) {
    botMessage = "Please provide all details before we can recommend a workout.";
    messages.push("<b>" + botName + ":</b> " + botMessage);
    updateChatUI();
    return;
  }

  // Send the data to the Flask backend
  fetch('http://127.0.0.1:5000/get_recommendation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userDetails)
  })
    .then(response => response.json())
    .then(data => {
      // Process and display the workout plan received from Flask
      const { BMI, BMIcase, RecommendedExercisePlan } = data;
      botMessage = `Your BMI is: ${BMI}.<br>
    Your BMI case is: ${BMIcase}. <br>
    Here's your recommended workout plan: <br>
    Goal: ${RecommendedExercisePlan.Goal},<br>
    Warm-up: ${RecommendedExercisePlan['Warm-up']},<br>
    Strength Training: ${RecommendedExercisePlan['Strength Training']},<br>
    Cardio: ${RecommendedExercisePlan.Cardio},<br>
    Cool Down: ${RecommendedExercisePlan['Cool Down']}`;

      // Add bot response to the messages array and update the UI
      messages.push("<b>" + botName + ":</b> " + botMessage);
      updateChatUI();
    })
    .catch(error => {
      botMessage = 'Sorry, there was an error while fetching the recommendation. Please try again later.';
      messages.push("<b>" + botName + ":</b> " + botMessage);
      updateChatUI();
    });
}

// Function to update the chat UI with the latest messages
function updateChatUI() {
  // Output the latest messages to the HTML chat log
  for (var i = 1; i < 8; i++) {
    if (messages[messages.length - i]) {
      document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
    }
  }
}

// Function to convert bot message into speech
function Speech(say) {
  if ('speechSynthesis' in window) {
    console.log("Speech synthesis is supported");
    var utterance = new SpeechSynthesisUtterance(say);
    speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
}


// Function to handle new user input
function newEntry() {
  if (document.getElementById("chatbox").value != "") {
    lastUserMessage = document.getElementById("chatbox").value;
    document.getElementById("chatbox").value = ""; // clear the input box
    document.getElementById("chatbox").placeholder = ""; // clear placeholder
    messages.push(lastUserMessage);

    if (step === 0) {
      if (lastUserMessage.toLowerCase().includes('recommend workout')) {
        botMessage = "Please enter your gender (Male/Female)";
        messages.push("<b>" + botName + ":</b> " + botMessage);
        step = 1;
      } else {
        botMessage = "Sorry, I didn't quite understand that. Type 'recommend workout' to start.";
        messages.push("<b>" + botName + ":</b> " + botMessage);
      }
    } else if (step === 1) {
      userDetails.gender = lastUserMessage;
      botMessage = "Please enter your age";
      messages.push("<b>" + botName + ":</b> " + botMessage);
      step = 2;
    } else if (step === 2) {
      userDetails.age = parseInt(lastUserMessage);
      botMessage = "Please enter your weight in kg";
      messages.push("<b>" + botName + ":</b> " + botMessage);
      step = 3;
    } else if (step === 3) {
      userDetails.weight = parseFloat(lastUserMessage);
      botMessage = "Please enter your height in meters ";
      messages.push("<b>" + botName + ":</b> " + botMessage);
      step = 4;
    } else if (step === 4) {
      userDetails.height = parseFloat(lastUserMessage);
      console.log("User details:", userDetails);

      // All details are now collected, call the Flask API for workout recommendation
      getWorkoutRecommendation();
      step = 0; // Reset the process for a new round of recommendations
      return; // Prevent additional speech calls for this input
    }

    // Update the chat UI and call Speech for intermediate steps
    updateChatUI();
    Speech(botMessage);
  }
}

// Runs each time enter is pressed
document.onkeypress = keyPress;

function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key == 13 || key == 3) {
    newEntry(); // Runs when Enter is pressed
  }
}
