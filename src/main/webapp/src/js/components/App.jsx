import React from "react";

import PopulatedSlider from "./PopulatedSlider";
import PopulatedMap from "./PopulatedMap";
import InfoPanel from "./InfoPanel";

class App extends React.Component {

  render() {
    return (
      <div style={{marginTop: 100}}>
        <div style={{height: 20}}></div>
        <PopulatedSlider />
        <div style={{marginBottom: 60}}></div>
        <PopulatedMap />
        <InfoPanel />
      </div>
    );
  }
}

export default App;
