import React from 'react';
import ErrorBoundary from './utils/ErrorBoundary';
import MapComponent from './MapComponent';

const App = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <MapComponent />
      </ErrorBoundary>
    </div>
  );
};

export default App;
