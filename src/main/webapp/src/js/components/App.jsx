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
        <div className="pixels-font" style={{
           backgroundColor: "white",
           position: "absolute",
           top: 218,
           left: 601,
           fontSize: "135%",
           color: "#ea292f",
           pointerEvents: "none"
         }}>FOOD</div>
        <div className="pixels-font" style={{
          backgroundColor: "white",
          position: "absolute",
          top: 308,
          left: 591,
          fontSize: "91%",
          color: "#ea292f",
          pointerEvents: "none"
        }}>WORKSHOPS</div>
      </div>
    );
  }
}

export default App;
