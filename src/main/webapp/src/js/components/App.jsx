import React from "react";
import Map from "./Map";
import Marker from "./Marker";

import stages from "app/constants/stages";
import PopulatedMap from "./PopulatedMap";

class App extends React.Component {

  render() {
    return (
      <div style={{marginTop: 100}}>
        <h1 className="pixels-font">
          Wireless coverage
        </h1>
        <PopulatedMap />
      </div>
    );
  }
}

export default App;
