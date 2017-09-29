import React from "react";

import SliderStore from "app/stores/SliderStore";

import SliderActions from "app/actions/SliderActions";

import DaySlider from "./DaySlider";

class PopulatedMap extends React.Component {

  constructor() {
    super();
    this.state = {
      value: SliderStore.get()
    }
  }

  componentWillMount() {
    SliderStore.on("change", this.onSliderStoreChange);
  }

  componentWillUnmount() {
    SliderStore.removeListener("change", this.onSliderStoreChange);
  }

  onSliderStoreChange = () => {
    this.setState({
      value: SliderStore.get()
    });
  };

  onChange(value) {
    SliderActions.set(value);
  }

  render() {
    return <DaySlider value={this.state.value} onChange={this.onChange} />
  }
}

export default PopulatedMap;
