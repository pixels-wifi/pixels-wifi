import React from "react";
import moment from "moment";

import wifiConfig from "app/constants/wifi";
import SliderStore from "app/stores/SliderStore";

class InfoPanel extends React.Component {

  constructor() {
    super();
    this.state = {
      id: SliderStore.get()
    };
  }

  componentWillMount() {
    SliderStore.on("change", this.onSliderStoreChange);
  }

  componentWillUnmount() {
    SliderStore.removeListener("change", this.onSliderStoreChange);
  }

  onSliderStoreChange = () => {
    this.setState({
      id: SliderStore.get()
    });
  };

  time = () => {
    const value = this.state.id;
    if (value !== "live") {
      const day = moment(wifiConfig.initial_data_timestamp)
        .add(value, "hour")
        .format("Do MMM");

      const f = moment(wifiConfig.initial_data_timestamp).add(value, "hour").format("H");
      const l = moment(wifiConfig.initial_data_timestamp).add(value + 1, "hour").format("H");

      return {f: `${f}-${l}h`, l: day};
    } else {
      return {f: "Real Time", l: ""};
    }
  };

  render() {
    const time = this.time();
    return (
      <div className="info-panel-container">
        <div className="pixels-font">
          {time &&
          <span>
            <div>{time.f}</div>
            <div>{time.l}</div>
          </span>
          }
        </div>
      </div>
    );
  }
}

export default InfoPanel;
