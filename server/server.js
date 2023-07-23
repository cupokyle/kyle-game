const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/completion', async (req, res) => {
  const data = {
    'model': 'gpt-3.5-turbo',
    'messages': req.body.messages,
    'temperature': 0.7,
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error in OpenAI API request' });
  }
});

app.listen(5001, () => {
  console.log('Server running on port 5001');
});
