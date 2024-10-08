import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryCTA from "../../components/PrimaryCTA/PrimaryCTA";
import SecondaryCTA from "../../components/SecondaryCTA/SecondaryCTA";
import InputField from "../../components/InputField/InputField"; 
import axios from "axios";
import "./AddQuizPage.scss";

const API_URL = import.meta.env.VITE_URL;

const AddQuizPage = () => {
  const [slang, setSlang] = useState("");
  const [meaning, setMeaning] = useState("");
  const [trickAnswers, setTrickAnswers] = useState(["", "", ""]);
  const [difficulty, setDifficulty] = useState(null);
  const [error, setError] = useState("");
  const [slangError, setSlangError] = useState(""); 
  const [loadingIdeas, setLoadingIdeas] = useState(false); 
  const navigate = useNavigate();

  const handleSlangChange = (value) => {
    setSlang(value);
    if (value.trim() !== "") {
      setSlangError(""); 
    }
  };

  const handleTrickAnswerChange = (index, value) => {
    const updatedTrickAnswers = [...trickAnswers];
    updatedTrickAnswers[index] = value;
    setTrickAnswers(updatedTrickAnswers);
  };

  const handleGenerateIdeas = () => {
    if (!slang.trim()) {
      setSlangError("⚠️ Please enter a slang word first"); 
      return;
    }

    setLoadingIdeas(true);
    axios
      .post(`${API_URL}/api/openai/get-trick-answers`, { slangWord: slang })
      .then((response) => {
        setTrickAnswers(response.data.trickAnswers);
        setLoadingIdeas(false);
      })
      .catch((error) => {
        console.error("Failed to generate trick answers:", error);
        setError("⚠️ Failed to generate trick answers. Please try again.");
        setLoadingIdeas(false);
      });
  };

  const handleSubmit = () => {
    if (
      !slang ||
      !meaning ||
      trickAnswers.some((answer) => answer === "") ||
      !difficulty
    ) {
      setError("⚠️ Please fill in all fields and select a difficulty level.");
      return;
    }

    const newQuiz = {
      slang,
      question: `What does "${slang}" mean?`,
      options: [...trickAnswers, meaning],
      correctOption: meaning,
      difficulty,
    };

    axios
      .post(`${API_URL}/api/quiz/add`, newQuiz)
      .then(() => {
        navigate("/quiz/add/complete");
      })
      .catch((error) => {
        console.error("Failed to add quiz:", error);
        setError("⚠️ Failed to add quiz. Please try again.");
      });
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="add-quiz-page">
      <h1 className="add-quiz-page__title">Add a New Quiz</h1>

      <div className="add-quiz-page__form">
        <InputField
          label="Slang Word"
          value={slang}
          onChange={(e) => handleSlangChange(e.target.value)} 
          placeholder="Enter the slang word"
        />
        {slangError && <p className="add-quiz-page__error--slang">{slangError}</p>} 

        <InputField
          label="Correct Meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Enter the correct meaning"
        />

        <label>Trick Answers</label>
        <button
          className="add-quiz-page__trick-answers--generate"
          onClick={handleGenerateIdeas}
          disabled={loadingIdeas}
        >
          {loadingIdeas ? "Generating..." : "Give me some ideas"}
        </button>

        <div className="add-quiz-page__trick-answers--options">
          {trickAnswers.map((answer, index) => (
            <InputField
              key={index}
              value={answer}
              onChange={(e) => handleTrickAnswerChange(index, e.target.value)}
              placeholder={`Trick Answer ${index + 1}`}
            />
          ))}
        </div>

        <div className="add-quiz-page__difficulty">
          <label>Select Difficulty</label>
          <div className="add-quiz-page__difficulty-wrapper">
            <button
              className={difficulty === "Easy" ? "selected" : ""}
              onClick={() => setDifficulty("Easy")}
            >
              Easy
            </button>
            <button
              className={difficulty === "Intermediate" ? "selected" : ""}
              onClick={() => setDifficulty("Intermediate")}
            >
              Intermediate
            </button>
            <button
              className={difficulty === "Advanced" ? "selected" : ""}
              onClick={() => setDifficulty("Advanced")}
            >
              Advanced
            </button>
          </div>
        </div>
        {error && <p className="add-quiz-page__error">{error}</p>}
      </div>
      <div className="add-quiz-page__cta">
        <PrimaryCTA label="Submit" onClick={handleSubmit} />
        <SecondaryCTA label="Back to Home page" onClick={handleBackToHome} />
      </div>
    </div>
  );
};

export default AddQuizPage;
