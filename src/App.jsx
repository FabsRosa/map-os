import React from 'react';
import ErrorBoundary from './utils/ErrorBoundary';
import Map from './Map';

const App = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <Map />
      </ErrorBoundary>
    </div>
  );
};

export default App;
