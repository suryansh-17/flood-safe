// src/App.jsx

import AppRouter from "./router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import FloodChatbot from "./components/FloodChatbot";

const App = () => {
  return (
    <div className="font-sans">
      <BrowserRouter>
        <AppRouter />
        <FloodChatbot />
      </BrowserRouter>
    </div>
  );
};

export default App;
