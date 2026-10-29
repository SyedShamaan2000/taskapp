// Home.js

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import "./home.css"; // Importing home.css for styling

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const firstLog = async () => {
      if (!localStorage.getItem("userId")) {
        navigate("/login");
      }
    };

    firstLog();
  }, [navigate]);

  const Logout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="home-container">
      {" "}
      {/* Added class name for styling */}
      <h1>TASK MANAGEMENT APP</h1>
      <button onClick={Logout}>Logout</button>
      <div>
        <TaskForm />
        <TaskList />
      </div>
    </div>
  );
};

export default Home;
