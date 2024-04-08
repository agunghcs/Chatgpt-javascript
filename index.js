const express = require('express');
const cors = require('cors');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());

const token = '7137550780:AAGrSYuhtjs6Houo8y_S_byr2vzEdOuiHOk';
const bot = new TelegramBot(token, { polling: true });

   // Handler function for /start command
   bot.onText(/\/start/, async (msg) => {
       bot.sendMessage(msg.chat.id, 'Hello! I am a chatbot powered by GPT-3. Send me a question.');
   });

   // Handler function for incoming messages
   bot.on('message', async (msg) => {
       const messageText = msg.text;
       const maxChunkLength = 4000;

       let chunks;
  
       if (messageText.length > maxChunkLength) {
           chunks = messageText.match(new RegExp(`.{1,${maxChunkLength}}`, 'g'));
       } else {
           chunks = [messageText];
       }

       for (const chunk of chunks) {
           bot.sendChatAction(msg.chat.id, 'typing');
           const response = await getChatGptResponse(chunk);
           bot.sendMessage(msg.chat.id, response);
       }
   });
 
// Function to get response from GPT-3 API
const getChatGptResponse = async (question) => {
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const payload = {
        'prompt': `Question: ${question}`,
        'max_tokens': 4000
    };

    try {
        const response = await axios.post(url, payload, { headers });
        return response.data.choices[0].text.trim();
    } catch (error) {
        return `An error occurred: ${error}`;
    }
};

// API endpoint to get response from GPT-3
app.get('/get_chatgpt_response', async (req, res) => {
    const { question } = req.query;
    const response = await getChatGptResponse(question);
    res.send(response);
});

// Handler function for /start command
const start = async (update, context) => {
    update.message.replyText('Hello! I am a chatbot powered by GPT-3. Send me a question.');
};

// Handler function for incoming messages
const handleMessage = async (update, context) => {
    const messageText = update.message.text;
    const maxChunkLength = 4000;

    let chunks;
  
    if (messageText.length > maxChunkLength) {
        chunks = messageText.match(new RegExp(`.{1,${maxChunkLength}}`, 'g'));
    } else {
        chunks = [messageText];
    }

    for (const chunk of chunks) {
        await context.bot.sendChatAction(update.effective_chat.id, 'typing');
        const response = await getChatGptResponse(chunk);
        update.message.replyText(response);
    }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

