import React from "react";

import Map from "./Map"

import WifiStore from "app/stores/WifiStore";
import SliderStore from "app/stores/SliderStore";

import WifiActions from "app/actions/WifiActions";

import stages from "app/constants/stages";
import Marker from "./Marker";

class PopulatedMap extends React.Component {

  constructor() {
    super();
    const id = SliderStore.get();
    this.state = WifiStore.get(id);
  }

  componentDidMount() {
    this.onSliderStoreChange();
  }

  componentWillUnmount() {
    this.cancelLivePolling();
  }

  componentWillMount() {
    WifiStore.on("change", this.onWifiStoreChange);
    SliderStore.on("change", this.onSliderStoreChange);
  }

  componentWillUnmount() {
    WifiStore.removeListener("change", this.onWifiStoreChange);
    SliderStore.removeListener("change", this.onSliderStoreChange);
  }

  startLivePolling() {
    // WifiActions.get();
    // this.cancel = setTimeout(() => {
    //   WifiActions.get();
    // }, 10000);
  }

  cancelLivePolling() {
    if (this.cancel)
      clearInterval(this.cancel);
  }

  onSliderStoreChange() {
    const id = SliderStore.get();
    if (id === "live") {
      WifiActions.get();
      // this.startLivePolling();
    } else {
      this.cancelLivePolling();
      WifiActions.get(id);
    }
  }

  onWifiStoreChange = (id) => {
    if (id === SliderStore.get()) {
      this.cancelLivePolling();
      this.cancel = setTimeout(() => WifiActions.get(), 2500);
      this.setState({...WifiStore.get(id)})
    }
  };
  
  render() {
    console.log(this.state);
    const stateData = this.state.data;
    const data = stages.map(s => {
      var rest = {};
      if (stateData && stateData.accessPoints) {
        const apData = stateData.accessPoints[s.title];
        if (apData) {
          rest["count"] = apData.goodUsers + apData.badUsers;
        }
      }
      return <Marker key={s.title} name={s.title} x={s.left} y={s.top} {...rest} />
    });

    return (
      <Map children={data} />
    );
  }
}

export default PopulatedMap;
