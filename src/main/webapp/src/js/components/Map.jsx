import React from "react";

class Map extends React.Component {

  render() {
    return (
      <div className="map-container">
        <img src="img/pixelsmap.svg" />
        {this.props.children}
      </div>
    );
  }
}

export default Map;
