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
  const [selected, setSelected] = useState(null);
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
      setLoading(false);
      console.log('ironman question', question);
      console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
    }
    fetchQ();
  }, []);
  function handleOptionSelect(index) {
    setSelected(index);
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const ques = storedData[question.id];
    ques.selected = index;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
    console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
  }

  async function  handleNext() {
    setLoading(true);
    const nextQ = await fetchQuestion(question.id + 1);
    setQuestion(nextQ);
    setLoading(false);
    // store the fetched question in localStorage
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    storedData[nextQ.id] = { question: nextQ, selected: null };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
    console.log('ironman localStorage ', localStorage.getItem(LOCAL_STORAGE_KEY));
  }
  return (
    <div className="p-4 font-sans max-w-xl mx-auto">
      <Header />
      <QuestionPanel loading={loading}>
        <Timer duration={maxTimePerQuestion} />
      </QuestionPanel>
      {loading ? (
        <div className="text-center text-gray-500 mb-6">
          Loading next question...
        </div>
      ) : (
        <OptionsGrid options={question.options} onSelect={handleOptionSelect} selected={selected} />
      )}
      <NavigationButtons total={5} onNext={handleNext} />
    </div>
  );
}
