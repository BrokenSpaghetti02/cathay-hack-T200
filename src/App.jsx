import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = os.env.API_KEY;
const flights = [{"Instructions": "You are Syd, a travel buddy for users at Cathay Pacific Airways. Your role is to assist users with flight details, hotel bookings, and travel insurance. When a user asks for flight details, you should extract the flight information such as flight numbers, departure times, arrival times, and pricing options from the dataset provided. If the flight details the user is asking is not available in the dataset, then you can give fictional but realistic flight details, but do not tell the user that the data is fictional at all. If a user asks about hotel stays, you should generate fictional hotel information including hotel names, available room types, prices, and amenities. Similarly, if a user inquires about travel insurance, you should provide details about fictional insurance plans, coverage options, policy details, and pricing. If the user's question is ambiguous, ask the user what the user meant. After providing the necessary details, you can provide the user with links where they can continue the booking, payment, or purchase process. Remember to always prioritize the user's needs and provide helpful and engaging responses. If the user is asking something else other than flight, hotel, or insurance, you must respond with, 'I do not understand what you mean, please try again'. Your asnwers will be based on this dataset. Don't mention that you will give fictional data. Also never keep tell the user to wait. Reply immediately."},
  { "Departure": "Hong Kong", "Arrival": "Dhaka", "Flight Number": "CX667", "Time of Departure": "21:30", "Time of Arrival": "23:55", "price": "$7000"},
  { "Departure": "Hong Kong", "Arrival": "Los Angeles", "Flight Number": "CX880", "Time of Departure": "0:15", "Time of Arrival": "20:55" },
  { "Departure": "Hong Kong", "Arrival": "Los Angeles", "Flight Number": "CX884", "Time of Departure": "12:25", "Time of Arrival": "9:05" },
  { "Departure": "Hong Kong", "Arrival": "Los Angeles", "Flight Number": "CX882", "Time of Departure": "16:40", "Time of Arrival": "13:20" },
  { "Departure": "Hong Kong", "Arrival": "New York", "Flight Number": "CX844", "Time of Departure": "9:30", "Time of Arrival": "6:00" },
  { "Departure": "Hong Kong", "Arrival": "New York", "Flight Number": "CX830", "Time of Departure": "9:30", "Time of Arrival": "12:10" },
  { "Departure": "Hong Kong", "Arrival": "New York", "Flight Number": "CX840", "Time of Departure": "16:20", "Time of Arrival": "19:05" },
  { "Departure": "Hong Kong", "Arrival": "Bangkok", "Flight Number": "CX705", "Time of Departure": "8:30", "Time of Arrival": "10:40" },
  { "Departure": "Hong Kong", "Arrival": "Bangkok", "Flight Number": "CX615", "Time of Departure": "9:55", "Time of Arrival": "12:05" },
  { "Departure": "Hong Kong", "Arrival": "Bangkok", "Flight Number": "CX653", "Time of Departure": "12:00", "Time of Arrival": "14:05" },
  { "Departure": "Hong Kong", "Arrival": "Bangkok", "Flight Number": "CX751", "Time of Departure": "14:30", "Time of Arrival": "16:40" },
  { "Departure": "Hong Kong", "Arrival": "Da Nang", "Flight Number": "CX5552", "Time of Departure": "8:25", "Time of Arrival": "9:20" },
  { "Departure": "Hong Kong", "Arrival": "Da Nang", "Flight Number": "CX5558", "Time of Departure": "16:30", "Time of Arrival": "17:25" },
  { "Departure": "Hong Kong", "Arrival": "Cebu", "Flight Number": "CX921", "Time of Departure": "8:20", "Time of Arrival": "11:10" },
  { "Departure": "Hong Kong", "Arrival": "Cebu", "Flight Number": "CX925", "Time of Departure": "15:45", "Time of Arrival": "18:35" },
  {"Location": "Dhaka", "Hotel": "Sonar Ga", "Price": "$200/night", "Insurance": "$100"},
  {"Location": "Los Angeles", "Hotel": "Hollywood Inn Suites Hotel", "price": "$500/night","Insurance": "$300"},
  {"Location": "New York", "Hotel": "DoubleTree by Hilton New York Downtown", "price": "1100/night", "Insurance": "$500"},
  {"Location": "Bangkok", "Hotel": "Amara Bangkok", "price": "$1000/night", "Insurance": "$500"},
  {"Location": "Da Nang", "Hotel": "Da Nang Bay Hotel", "price": "$95/night", "Insurance": "$500"},
  {"Location": "Cebu", "Hotel": "Radisson Blu Cebu", "price": "$1000/night", "Insurance": "$700"},
];

const flightsDict = { "flights": flights };

const jsonString = JSON.stringify(flightsDict);

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": jsonString
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Syd! How can I help you?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Syd is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
