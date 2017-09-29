import React from "react";
import moment from "moment";
import _ from "lodash";

var d3  = require("d3");
import {AreaChart} from 'react-easy-chart';

import SliderStore from "app/stores/SliderStore";
import WifiStore from "app/stores/WifiStore";
import WifiConstants from "app/constants/wifi";

import Table from "antd/lib/table";

const columns = [{
  title: "Stage",
  dataIndex: "stage",
  width: 170
}, {
  title: "Talk",
  dataIndex: "talk"
}, {
  title: "Attendance",
  dataIndex: "count",
  width: 150
}, {
  title: "Attendance over time",
  dataIndex: "timeseries",
  width: 240,
  className: "my-padding",
  render: v => {
    return <AreaChart
      width={240}
      height={40}
      areaColors={["#ea282e"]}
      data={[v]} />
  }
}];

class Talks extends React.Component {

  constructor() {
    super();
    this.state = {
      id: SliderStore.get(),
      data: WifiStore.get
    }
  }

  componentWillMount() {
    SliderStore.on("change", this.onSliderStoreChange);
    WifiStore.on("change", this.onWifiStoreChange);
  }

  componentWillUnmount() {
    SliderStore.removeListener("change", this.onSliderStoreChange);
    WifiStore.removeListener("change", this.onWifiStoreChange);
  }

  onSliderStoreChange = () => {
    const sliderId = moment(WifiConstants.initial_data_timestamp).add(SliderStore.get(), "hour").unix() * 1000;

    this.setState({
      id: SliderStore.get(),
      data: WifiStore.get(sliderId).data
    });
  };

  onWifiStoreChange = (id) => {
    const sliderId = moment(WifiConstants.initial_data_timestamp).add(SliderStore.get(), "hour").unix() * 1000;
    if (id === sliderId) {
      this.setState({data: WifiStore.get(id).data})
    }
  };

  render() {
    if (this.state.id === "live") {
      return null;
    }

    return (
      <div className="talks-container" style={{marginBottom: 200}}>
        <h1 className="pixels-font" style={{marginTop: 50, marginBottom: 10}}>
          Talks
        </h1>
        <Table locale={{emptyText: "No talks"}} pagination={false} columns={columns} dataSource={
          this.state.data && _.map(this.state.data.talks, (d, t) => {
            return {
              key: d.name,
              stage: t,
              talk: d.name,
              count: d.numAtendees,
              timeseries: _.map(d.timeSeries, (x, i) => ({x: i, y: x}))
            };
          })
        } />
      </div>
    );
  }
}

export default Talks;
