import React from "react";
import "../App.css";
import Cardform from "../components/Cardform";
const Home = () => {
  return (
    <div className="card card-5">
      <div className="Home-header">Add a new Flashcard</div>
      <div className="body">
        <Cardform />
      </div>
    </div>
  );
};

export default Home;
