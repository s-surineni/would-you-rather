import React, { useEffect, useState, useRef } from "react";

//components - use these!
import {
  OptionsGrid,
  Header,
  Timer,
  QuestionPane,
  NavigationButtons,
  QuestionPanel,
} from "./components";

//utils - use this!
import { fetchQuestion } from "./fetchQuestion";

/**
 * How to read from localStorage -> localStorage.getItem(<key>);
 * How to write into localStorage -> localStorage.setItem(<key>, <string>);
 * Hint: To write an object into localStorage, stringify it.
 */
// 🚨 Important: use this key to read/write data from localStorage - it will be used in test cases as well.
const LOCAL_STORAGE_KEY = "would_you_rather_votes";

export default function App({ maxTimePerQuestion = 5 /* seconds */ }) {
  // Implement me! You are given a skeleton and its your
  // job to fill it up with 💡 missing props and handlers!
  // (no more components need to be added or the structure changed)
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  let timer = useRef(true);
  const [selected, setSelected] = useState(null);
  const [timerResetKey, setTimerResetKey] = useState(null);
  useEffect(() => {
    const fetchQ = async () => {
      const question = await fetchQuestion(0);
      setQuestion(question);
      // store the fetched question in localStorage 
      // the value format should be {id: question, selected: null}
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(
        { [question.id]: { question: question, selected: null }}
      )
      );
      setTimerResetKey(question.id); // Initialize timer key
      setLoading(false);
      console.log('ironman question', question);
      console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
    }
    fetchQ();
  }, []);
  function handleOptionSelect(index) {
    if (!timer.current) return;
    setSelected(index);
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const ques = storedData[question.id];
    ques.selected = index;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
    console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
  }

  async function  handleNext() {
    setLoading(true);
    setSelected(null);
    
    let nextQ = await fetchQuestion(question.id + 1);
    let prevQuestionId = question.id;

    // Check if this is a new question or a revisited one
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const isNewQuestion = !storedData[nextQ.id];
    
    if (isNewQuestion) {
      timer.current = true; // Reset timer state only for new questions
      setTimerResetKey(nextQ.id); // Use question ID as reset key for new questions
    } else {
      nextQ = storedData[nextQ.id].question;
      setSelected(storedData[nextQ.id].selected);
    }

    setQuestion(nextQ);
    setLoading(false);
    
    // store the fetched question in localStorage
    if (isNewQuestion) {
      storedData[nextQ.id] = { question: nextQ, selected: null, prevQuestionId: prevQuestionId };
    } else {
      // Update prevQuestionId for revisited question
      storedData[nextQ.id].prevQuestionId = prevQuestionId;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
    console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
  }

  function handlePrev() {
      const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      let prevQuestionId = storedData[question.id].prevQuestionId;
      if (prevQuestionId === null || prevQuestionId === undefined) return;
      const prevQ = storedData[prevQuestionId];
      setQuestion(prevQ.question);
      setSelected(prevQ.selected);
      console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
  }
  return (
    <div className="p-4 font-sans max-w-xl mx-auto">
      <Header />
      <QuestionPanel loading={loading} question={question}>
        <Timer 
          key={timerResetKey} // Reset timer only when going to next question
          duration={maxTimePerQuestion} 
          onExpire={() => {
            timer.current = false;
          }} 
          disabled={false}
        />
      </QuestionPanel>
      {loading ? (
        <div className="text-center text-gray-500 mb-6">
          Loading next question...
        </div>
      ) : (
        <OptionsGrid options={question.options} onSelect={handleOptionSelect} selected={selected}  />
      )}
      <NavigationButtons total={5} onNext={handleNext} onPrev={handlePrev}/>
    </div>
  );
}
