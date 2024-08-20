import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './utils/ErrorBoundary';
import Map from './Map';

const App = () => {
  return (
    <div className="App">
      <ErrorBoundary>
      <Router>
          <Routes>
            <Route path="/" element={<Map mapType="OS" />} />
            <Route path="/OS" element={<Map mapType="OS" />} />
            <Route path="/Alarm" element={<Map mapType="Alarm" />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
};

export default App;
