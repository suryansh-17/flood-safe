// src/App.jsx

import AppRouter from "./router/AppRouter";
import { BrowserRouter } from "react-router-dom";

const App = () => {
  return (
    <div className="font-sans">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
};

export default App;
