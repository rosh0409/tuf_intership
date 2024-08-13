import "./App.css";
import Signin from "./Pages/Signin";
// import { FlashcardArray } from "react-quizlet-flashcard";
import Signup from "./Pages/Singup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import { Toaster } from "react-hot-toast";

function App() {
  const cards = [
    {
      id: 1,
      front: "What is the capital of <u>Alaska</u>?",
      back: "Juneau",
      frontChild: <div>Hello there</div>,
      backChild: <p>This is a back child</p>,
    },
    {
      id: 2,
      front: "What is the capital of California?",
      back: "Sacramento",
    },
    {
      id: 3,
      front: "What is the capital of New York?",
      back: "Albany",
    },
    {
      id: 4,
      front: "What is the capital of Florida?",
      back: "Tallahassee",
    },
    {
      id: 5,
      front: "What is the capital of Texas?",
      back: "Austin",
    },
    {
      id: 6,
      front: "What is the capital of New Mexico?",
      back: "Santa Fe",
    },
    {
      id: 7,
      front: "What is the capital of Arizona?",
      back: "Phoenix",
    },
  ];
  return (
    <main className="">
      <Navbar />
      <div className="App-header">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Home />}
              // element={<FlashcardArray cards={cards} controls={true} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
          </Routes>
        </BrowserRouter>

        {/* <Signup /> */}
      </div>
      <Toaster />
    </main>
  );
}

// // import { FlashCard } from "react-flashcards";
// import { FlashCardArray } from "react-flashcards";

// const flashcards = [
//   { id: 1, front: "What is the powerhouse of the cell?", back: "Mitochondria" },
//   {
//     id: 2,
//     front: "What is the process by which plants make their own food?",
//     back: "Photosynthesis",
//   },
//   {
//     id: 3,
//     front:
//       "What method in JavaScript is used to stop further propagation of an event during its execution?",
//     back: "event.stopPropagation()",
//   },
//   {
//     id: 4,
//     front: "What does the acronym DOM stand for in web development?",
//     back: "Document Object Model",
//   },
//   {
//     id: 5,
//     front: "Who developed the theory of evolution by natural selection?",
//     back: "Charles Darwin",
//   },
//   {
//     id: 6,
//     front:
//       "What is the term for a word that is similar in meaning to another word?",
//     back: "Synonym",
//   },

//   {
//     id: 7,
//     front: "Which part of speech describes a noun or pronoun?",
//     back: "Adjective",
//   },
// ];

// function App() {
//   return (
//     <div className="App-header">
//       <FlashCardArray
//         cards={flashcards}
//         width="600px"
//         // Other props..
//       />
//     </div>
//   );
// }

export default App;
