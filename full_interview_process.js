const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require('os');
const { getVoiceSettings } = require('./voice.js')
const { initializeRunFolder } = require('./runs')

// Define the answers for different prospect types
const skepticalAnswers = {
  "motivator": "We’ve been trying to grow, but I just don’t think ads work for our business. We’ve wasted so much money in the past, and nothing changed.",
  "expand-on-x": "We spent a ton on Facebook ads and Google, but it felt like we got nothing in return. Sales didn’t go up, and we didn’t get any new clients.",
  "growth": "It’s been flat, honestly. We’re stuck at about $50K/month, and we just can’t break through.",
  "pain-point": "We just can’t get new clients in the door. We’re stuck at the same level and can’t seem to push past it.",
  "tried-before": "We’ve tried Facebook ads, Google ads, even influencer marketing—but nothing seems to work.",
  "reason-not-solved": "Honestly, I think the targeting was off, and we didn’t have the right strategy in place.",
  "ideal-customer": "We mainly work with mid-sized eCommerce brands in health and wellness, mostly recurring orders.",
  "product-pricing": "We have both recurring subscriptions and one-time orders. AOV is about $100.",
  "cac": "$50 CAC, AOV $100 – 50%.",
  "have-you-tried-ads": "We tried Facebook and Google ads but stopped after seeing no returns.",
  "reason-not-ads": "Too afraid of wasting more money, honestly."
};

const busyAnswers = {
  "motivator": "We’re trying to increase sales, but we’re just juggling so many things. Marketing, customer service, you name it.",
  "expand-on-x": "We’re hoping to get to $100K/month in sales. Right now, we’re at $50K, so we want to double it.",
  "growth": "We’ve been stuck at $50K/month for a while now. We just need to break through.",
  "pain-point": "The biggest problem is just time. I can’t focus on the marketing because I’m stuck in operations.",
  "tried-before": "We’ve hired a marketing person, but they don’t seem to know what they’re doing with ads.",
  "reason-not-solved": "I’m not sure. Maybe we weren’t clear on our goals, or we weren’t tracking properly.",
  "ideal-customer": "They’re usually 25-45, health-conscious, and looking for natural products.",
  "product-pricing": "We mostly offer subscription-based products, and AOV is around $120.",
  "cac": "We don’t know exactly, but it’s been quite high, probably $80-100.",
  "have-you-tried-ads": "We did a little with Facebook, but I didn’t have time to manage it properly, so I stopped.",
  "reason-not-ads": "I just don’t have the time to manage it. Too many other things to worry about."
};

const analyticalAnswers = {
  "motivator": "We need .",
  "expand-on-x": "We’ve ",
  // "growth": "We want to grow by at least 50% in revenue, but the challenge is doing it efficiently without overspending on ads.",
  // "pain-point": "Our main issue is optimizing ad spend. We’ve been using Facebook and Google, but it’s still not hitting the numbers we want.",
  // "tried-before": "We’ve adjusted our targeting, tested different creatives, and analyzed the results, but it’s still not working as expected.",
  // "reason-not-solved": "I think we may not be fully optimizing our ads to the right audience. We’ve been doing a lot of trial and error without a clear strategy.",
  // "ideal-customer": "They’re generally in the 30-45 age range, middle income, and very data-driven in their purchasing habits.",
  // "product-pricing": "Our AOV is $120, and we aim to increase that by getting more high-value customers.",
  // "cac": "$100 CAC, AOV $120 – we need to bring down CAC while increasing AOV.",
  // "have-you-tried-ads": "Yes, we’ve used PPC through Facebook and Google.",
  // "reason-not-ads": "We want to optimize better and get a better ROAS, but we’ve been struggling to manage it effectively."
};

// Function to randomly select a prospect personality
function getRandomProspect() {
  const prospects = ["analytical"];
  // const prospects = ["skeptical", "busy", "analytical"];
  const randomIndex = Math.floor(Math.random() * prospects.length);
  return prospects[randomIndex];
}

// Select a random prospect personality
const selectedProspect = getRandomProspect();

// Function to retrieve answers based on selected prospect personality
function getProspectAnswers(prospectType) {
  if (prospectType === "skeptical") {
    return skepticalAnswers;
  } else if (prospectType === "busy") {
    return busyAnswers;
  } else if (prospectType === "analytical") {
    return analyticalAnswers;
  }
}

const answers = getProspectAnswers(selectedProspect);

// Global variable to store the run folder for the session and a set to track asked questions
let runFolder = null;
let askedQuestions = new Set(); // To track questions that have already been asked

const answerKeys = Object.keys(answers); // Get all keys (questions) from the busyAnswers object
let currentIndex = 0; // Start at the first index
// Function to get the next question and increment the index
function getNextQuestion() {
  if (currentIndex < answerKeys.length) {
    const currentQuestionKey = answerKeys[currentIndex];
    const questionText = answers[currentQuestionKey];
    currentIndex++; // Increment the index to move to the next question
    return { key: currentQuestionKey, text: questionText };
  }
  return null; // Return null when all questions have been asked
}

const initFolder = initializeRunFolder('questions');

// Function to ask a question and record the answer
async function askQuestion() {
  if (!runFolder) {
    const question = getNextQuestion();
    if (!question) {
      console.log("All questions have been asked. Ending process.");
      return; // All questions asked, exit the process
    }

    console.log(`AI asks: ${question.text}`);

    const filename = path.join(initFolder, `${question.key}.wav`);

    // Check if the file already exists, if so skip this question
    if (fs.existsSync(filename)) {
      console.log(`File ${filename} already exists. Skipping this question...\n`);
      return;
    }

    // Mark this question as asked
    askedQuestions.add(question.key);

    // Use Google TTS to ask the question
    const url = getVoiceSettings(question.text, 'en-GB')

    // Fetch the audio and save it to a file
    try {
      const audioStream = await fetch(url);
      const audioBuffer = await audioStream.arrayBuffer();
      const buffer = Buffer.from(audioBuffer);

      // Save the audio to a temporary file
      fs.writeFileSync(filename, buffer);

      console.log(`Audio saved to: ${filename}`);

      // Detect the platform and select the appropriate player
      let playerCommand, playerArgs;
      if (os.platform() === 'win32') {
        playerCommand = 'powershell';
        playerArgs = ['-Command', 'Start-Process', 'wmplayer', '-ArgumentList', filename];
      } else if (os.platform() === 'darwin') {
        playerCommand = 'afplay';
        playerArgs = [filename];
      } else {
        playerCommand = 'aplay';
        playerArgs = [filename];
      }

      const player = spawn(playerCommand, playerArgs);

      player.on('error', (err) => {
        console.error('Error playing audio:', err);
      });

      player.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Audio player exited with code ${code}`);
        } else {
          console.log("Audio played successfully");
          console.log("Listening for your response...");

          // Start recording the user's answer with dynamic filename
          const record = spawn("rec", [
            filename,
            "silence", "1", "0.1", "1%",
            "1", "3.0", "1%"
          ]);

          record.on("exit", () => {
            console.log(`Recording saved as: ${filename}\n`);
            // After recording, proceed to ask the next question
            setTimeout(askQuestion, 3000); // Ask another question after 3 seconds
          });

          record.on("error", (err) => {
            console.log(err);
          });
        }
      });

    } catch (err) {
      console.log('Error fetching the audio:', err);
    }
  }
}

// Start the process once
askQuestion();
