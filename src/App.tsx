import React from 'react';
import ErrorBoundary from './utils/ErrorBoundary';
import MapComponent from './MapComponent';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <MapComponent />
      </ErrorBoundary>
    </div>
  );
};

export default App;