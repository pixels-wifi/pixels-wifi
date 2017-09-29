import qajaxWrapper from "app/helpers/qajaxWrapper";
import moment from "moment";

import AppDispatcher from "app/AppDispatcher";
import WifiEvents from "app/events/wifi";
import WifiConstants from "app/constants/wifi";
import mock from "app/constants/mock";

const WifiActions = {
  get: function(tick) {
    var id;
    const params = {};

    if (tick) {
      const ts = moment(WifiConstants.initial_data_timestamp).add(tick, "hour").unix() * 1000;
      console.log(WifiConstants.initial_data_timestamp, ts);
      id = ts;
      params["ts"] = ts;
    } else {
      id = "live"
    }

    AppDispatcher.dispatchNext({
      actionType: WifiEvents.REQUEST_GET,
      id: id
    });

    // setTimeout(() => {
    //   console.log(id, mock);
    //     AppDispatcher.dispatchNext({
    //       actionType: WifiEvents.REQUEST_GET_SUCCESS,
    //       id: id,
    //       data: mock
    //     });
    // }, 100)

    this.request({
      url: "http://88.157.243.197:8080" + "/api",
      params: params
    }).then(data => {
      AppDispatcher.dispatchNext({
        actionType: WifiEvents.REQUEST_GET_SUCCESS,
        id: id,
        data: data.body
      });
    }, data => {
      AppDispatcher.dispatchNext({
        actionType: WifiEvents.REQUEST_GET_ERROR,
        id: id,
        data: data.body
      });
    });
  },

  request: qajaxWrapper
};

export default WifiActions;
