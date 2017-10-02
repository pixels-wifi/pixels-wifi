import React from "react";
import _ from "lodash";
import Slider from "antd/lib/slider";
import moment from "moment";

import wifiConfig from "app/constants/wifi";

const marks = {
  0: '16h',
  // 1: '17h',
  // 2: '18h',
  // 3: '19h',
  // 4: '20h',
  // 5: '21h',
  // 6: '22h',
  // 7: '23h',
  8: {
    label: <strong style={{fontWeight: "bold"}}>29th Sep</strong>
  },
  // 9: '1h',
  // 10: '2h',
  // 11: '3h',
  // 12: '4h',
  // 13: '5h',
  14: '6h',
  // 15: '7h',
  // 16: '8h',
  // 17: '9h',
  // 18: '10h',
  // 19: '11h',
  20: '12h',
  // 21: '13h',
  // 22: '14h',
  // 23: '15h',
  // 24: '16h',
  // 25: '17h',
  26: '18h',
  // 27: '19h',
  // 28: '20h',
  // 29: '21h',
  // 30: '22h',
  // 31: '23h',
  32: {
    label: <strong style={{fontWeight: "bold"}}>30th Sep</strong>
  },
  // 33: '1h',
  // 34: '2h',
  // 35: '3h',
  // 36: '4h',
  // 37: '5h',
  38: '6h',
  // 39: '7h',
  // 40: '8h',
  // 41: '9h',
  // 42: '10h',
  // 43: '11h',
  44: '12h',
  // 45: '13h',
  // 46: '14h',
  // 47: '15h',
  // 48: '16h',
  // 49: '17h',
  50: '18h',
  // 51: '19h',
  // 52: '20h',
  // 53: '21h',
  54: '22h'
};

const realTimeLabel = {
  style: {
    color: '#f50',
  },
  label: <strong>Real Time</strong>,
};

//1506802266000
const actualStepHour = moment().diff(wifiConfig.initial_data_timestamp, "hour");
const maxStep = Math.min(54, actualStepHour);

class DaySlider extends React.Component {

  formatter(value) {
    const day = moment(wifiConfig.initial_data_timestamp)
      .add(value, "hour")
      .format("Do MMM");

    const f = moment(wifiConfig.initial_data_timestamp).add(value, "hour").format("H");
    const l = moment(wifiConfig.initial_data_timestamp).add(value + 1, "hour").format("H");

    return `${f}-${l}h, ${day}`;
  }

  realMarks() {
    const a = _.pickBy(marks);
    a[maxStep] = realTimeLabel;
    return a;
  }

  onChange = (value) => {
    if (value !== undefined && value !== null) {
      this.props.onChange(value);
    }
  };

  value = () => {
    return this.props.value;
  };

  render() {
    return (
      <Slider
        marks={marks}
        max={maxStep}
        value={this.value()}
        onChange={this.onChange}
        tipFormatter={this.formatter} />
    );
  }
}

export default DaySlider;
