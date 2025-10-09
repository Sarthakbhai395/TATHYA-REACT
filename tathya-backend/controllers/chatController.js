const Chat = require('../models/Chat');
const asyncHandler = require('express-async-handler');

// Simple POST /chat - accepts { messages: [...] } and responds with a basic assistant reply
const handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400);
    throw new Error('Invalid messages payload');
  }

  // For now, create a naive assistant response: echo last user message with a canned prefix
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const userText = lastUserMessage ? lastUserMessage.content : '';
  const assistantReply = {
    role: 'assistant',
    content: `You said: ${userText}. (This is a local assistant placeholder.)`,
  };

  // Save chat to DB
  const chat = await Chat.create({ messages: [...messages, assistantReply] });

  res.json({ reply: assistantReply, chatId: chat._id });
});

module.exports = { handleChat };
