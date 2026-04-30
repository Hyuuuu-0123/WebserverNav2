import React from "react";
import { BrowserRouter } from "react-router-dom";

import Body from "./components/body";

function App() {
  return (
    <BrowserRouter>
      <Body />
    </BrowserRouter>
  );
}

export default App;