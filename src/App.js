import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [text, setText] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [turnCounter, setTurnCounter] = useState(0);
  const [formInputs, setFormInputs] = useState(Array(8).fill(''));  // To manage 8 input fields
  const [questions, setQuestions] = useState([]);  // To store the questions returned from the API
  const [responseString, setResponseString] = useState('');  // To store the environment description
  const [choices, setChoices] = useState([]);  // To store the player choices

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data = {
      'messages': [{'role':'system', 'content': text}],
    };

    if (turnCounter === 0) {
      data = {
        'messages': [{
          'role':'system', 
          'content':`You need to create an entire Dungeons & Dragons style world and adventure based on this prompt: ${text}. In order to develop an interesting adventure and unique world, please return a JavaScript array of exactly 8 questions that would help you develop an interesting world based on the answers. Each question can be no longer than 10 words in length, and each should either be a yes-or-no question, or should require an answer less than 8 words in length. The answers required should not contain spoilers, and should be considered common knowledge in the world you're creating.`
        }],
      };
    } else if (turnCounter === 1 || turnCounter === 2 || turnCounter === 3) {
      const messages = questions.map((question, index) => {
        return {
          'role':'user',
          'content':`${question}: ${formInputs[index]}`
        };
      });

      const systemContent = turnCounter === 1
      ? 'Now it\'s time for character creation. Please return a new array of 8 questions but this time, they should be pivotal questions when creating the player character. Keep the questions under 15 words in length, and ask for specific character details that would correspond to a Role Playing game in this world. We want the player to feel like they\'ve built a great, original character, so ensure that they get to have some fun with it. Keep the yes-or-no questions to a minimum.'
      : turnCounter === 2
        ? `You are now the game's Dungeon Master. Please think of a fun and original Dungeons & Dragons style campaign that takes place in the world we just created, with the player being the character we jsut created. Please respond as the Dungeon Master beginning the game. Each turn you should format your response in this exact way: a JSON object with two key:value pairs. One key is called "responseString" and contains a string that is a fairly detailed description of the player's environment or situation. The other key is called "choices" which contains an array of 3 actions the player can complete. Each action should be concise, and no more than 12 words.`
        : '';
      
        messages.unshift({ 'role':'user', 'content': systemContent });

        data = { 'messages': messages };
    }

    try {
      const response = await axios.post('http://localhost:5001/api/completion', data);
      console.log(response.data);
      setResponseData(response.data);
  
      if (turnCounter < 2) {
        const responseQuestions = response.data.choices[0].message.content.split('\n');
        setQuestions(responseQuestions);
        setFormInputs(Array(8).fill(''));
       } else if (turnCounter >= 2) {
          const responseContent = JSON.parse(response.data.choices[0].message.content);
        
          // Remove 'responseString = ' and 'choices = ' from the strings, and remove the quotation marks around the choices
          const cleanedResponseString = responseContent.responseString;
          const choicesArray = responseContent.choices;
        
          setResponseString(cleanedResponseString);
          setChoices(choicesArray);
        }
  
      setTurnCounter(turnCounter + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChoice = async (choice) => {
    const data = {
      'messages': [
        { 'role': 'system', 'content': responseString },
        { 'role': 'user', 'content': `My choice: ${choice}. What happens next? Please respond with a perfectly formatted JSON object. One key is called "responseString" and contains a string that explains what happens next in the story. The other key is called "choices" which contains an array of 3 new actions (each are a string) the player can complete.` }
      ]
    };
    
    try {
      const response = await axios.post('http://localhost:5001/api/completion', data);
      console.log(response.data);
      setResponseData(response.data);
    
      const responseContent = JSON.parse(response.data.choices[0].message.content);
    
      // With the parsed content, you can directly access the responseString and choices
      const cleanedResponseString = responseContent.responseString;
      const choicesArray = responseContent.choices;
    
      setResponseString(cleanedResponseString);
      setChoices(choicesArray);
    } catch (error) {
      console.error(error);
    }
  };
  

  
  const handleChange = (e, index) => {
    const newFormInputs = [...formInputs];
    newFormInputs[index] = e.target.value;
    setFormInputs(newFormInputs);
};

  

return (
  <div className="App">
    <h1>Kyle Game</h1>
    {turnCounter >= 0 && turnCounter <= 2 && (
      <form onSubmit={handleSubmit}>
        {turnCounter === 0 && (
          <>
            <p>Please input a prompt</p>
            <input
              type="text"
              className="input-field"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </>
        )}
        {(turnCounter >= 1 && turnCounter <= 3) && (
          <>
            <h2>{turnCounter === 1 ? 'World Creator' : turnCounter === 2 ? 'Character Creator' : 'Game Begins'}</h2>
            {formInputs.map((inputValue, index) => (
              <div key={index} className="form-group">
                <label>{questions[index]}</label>
                <input
                  className="input-field"
                  type="text"
                  value={inputValue}
                  onChange={e => handleChange(e, index)}
                />
              </div>
            ))}
          </>
        )}
        <button type="submit">Submit</button>
      </form>
    )}

    {turnCounter >= 2 && (
      <div>
        <p>{responseString}</p>
        {choices.map((choice, index) => (
  <button key={index} onClick={() => handleChoice(choice)}>
    {choice}
  </button>
))}
      </div>
    )}
  </div>
);

        }


export default App;
