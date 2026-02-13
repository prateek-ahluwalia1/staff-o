import React from "react";
import { Button } from "./components/ui/button";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Hello, World!</h1>
      <Button>Click Me</Button>
    </div>
  );
};

export default App;
