import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    coursePreferences: [],
  });

  const courses = ["Senior Management", "Data Science", "Digital Transformation", "Product Management", "Finance"];
  const courseSuggestions = {
    "Senior Management": "https://accredian.com/programs/senior-management-program",
    "Data Science": "https://accredian.com/programs/pg-certificate-program-in-data-science",
    "Digital Transformation": "https://accredian.com/programs/executive-program-in-digital-transformation-and-innovation",
    "Product Management": "https://accredian.com/programs/executive-program-in-data-driven-product-management",
    "Finance": "https://accredian.com/programs/chief-financial-officer-programme",
  };

  const prompts = [
    "Hi! What's your name?",
    "Great! What's your email address?",
    "Thanks! What's your phone number?",
    `Select your preferred courses by entering the corresponding numbers (e.g., 1, 3):<br>
     1. Senior Management<br>
     2. Data Science<br>
     3. Digital Transformation<br>
     4. Product Management<br>
     5. Finance`,
    "Thank you for interacting with us!",
  ];

  useEffect(() => {
    if (step === 0) {
      setChatHistory([{ sender: "bot", message: prompts[step] }]);
    }
  }, [step]);

  useEffect(() => {
    if (step === 4) {
      setTimeout(() => {
        // Automatically reset everything after 60 seconds
        setUserData({ name: "", email: "", phone: "", coursePreferences: [] });
        setChatHistory([{ sender: "bot", message: prompts[0] }]);
        setStep(0);
      }, 60000); // Delay of 2 seconds before reset
    }
  }, [step]);

  const handleChat = async (e) => {
    e.preventDefault();

    setChatHistory((prev) => [
      ...prev,
      { sender: "user", message: currentInput },
    ]);

    // Validation functions
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^\d{10}$/.test(phone);

    if (step < 3) {
      if (step === 0) setUserData({ ...userData, name: currentInput });
      if (step === 1) {
        // Email validation
        if (!isValidEmail(currentInput)) {
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", message: "Please enter a valid email address (e.g., user@gmail.com)." },
          ]);
          return;
        }
        setUserData({ ...userData, email: currentInput });
      }
      if (step === 2) {
        // Phone number validation
        if (!isValidPhone(currentInput)) {
          setChatHistory((prev) => [
            ...prev,
            { sender: "bot", message: "Please enter a valid 10-digit phone number." },
          ]);
          return;
        }
        setUserData({ ...userData, phone: currentInput });
      }

      setStep((prevStep) => prevStep + 1);
    } else if (step === 3) {
      const selectedCourses = currentInput
        .split(",")
        .map((num) => parseInt(num.trim()) - 1)
        .filter((index) => index >= 0 && index < courses.length);

      if (selectedCourses.length === 0) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", message: "Please enter a valid input." },
        ]);
        return;
      } else {
        const selectedCourseNames = selectedCourses.map((index) => courses[index]);

        setUserData((prevData) => {
          const updatedUserData = {
            ...prevData,
            coursePreferences: selectedCourseNames,
          };

          // Ensure the updated state is used for the API call
          try {
            axios.post("http://localhost:5000/api/users", updatedUserData).then(() => {
              setChatHistory((prev) => [
                ...prev,
                { sender: "bot", message: "Your data has been saved successfully!" },
              ]);
            });
          } catch (error) {
            setChatHistory((prev) => [
              ...prev,
              { sender: "bot", message: "Error saving data: " + error.message },
            ]);
          }

          return updatedUserData;
        });

        const suggestions = selectedCourseNames
          .map(
            (course) =>
              `<a href="${courseSuggestions[course]}" target="_blank" rel="noopener noreferrer">${course}</a>`
          )
          .join("<br />");

        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", message: `You selected: ${selectedCourseNames.join(", ")}` },
          {
            sender: "bot",
            message: `Here are the course suggestions:<br />${suggestions}`,
          },
        ]);

        setStep(4);
      }
    } else if (step === 4) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", message: "Thank you for interacting with us!" },
      ]);
    }

    // Display the next prompt
    if (step < prompts.length - 1) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", message: prompts[step + 1] },
      ]);
    }

    setCurrentInput("");
  };

  return (
    <div className="chatbox">
      <h1>Chatbot</h1>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.sender}`}
            dangerouslySetInnerHTML={{ __html: chat.message }}
          />
        ))}
      </div>
      {step < prompts.length && (
        <form onSubmit={handleChat} className="chat-input">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your message..."
            required
          />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
}

export default App;
