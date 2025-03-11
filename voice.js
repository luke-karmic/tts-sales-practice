const googleTTS = require('google-tts-api');

// Function to change the voice
module.exports.getVoiceSettings = (text, language = 'en', gender = 'male') => {
  return googleTTS.getAudioUrl(text, {
    lang: language,  // For example, 'en' for English, 'en-GB' for British English, 'en-US' for American English
    slow: false, // Speed of speech
    host: 'https://translate.google.com'
  });
}