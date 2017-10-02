import qajaxWrapper from "app/helpers/qajaxWrapper";
import moment from "moment";
import _ from "lodash";

import AppDispatcher from "app/AppDispatcher";
import WifiEvents from "app/events/wifi";
import WifiConstants from "app/constants/wifi";

import WifiStore from "app/stores/WifiStore";
import mock from "app/constants/mock";

const WifiActions = {
  get: function(tick) {
    var id;
    const params = {};

    const ts = moment(WifiConstants.initial_data_timestamp).add(tick, "hour").unix() * 1000;
    id = ts;
    params["ts"] = ts;
    if (_.has(WifiStore.get(id), "data.accessPoints")) {
      AppDispatcher.dispatchNext({
        actionType: WifiEvents.REQUEST_GET,
        id: id
      });

      AppDispatcher.dispatchNext({
        actionType: WifiEvents.REQUEST_GET_CACHED,
        id: id
      });
      return;
    }

    AppDispatcher.dispatchNext({
      actionType: WifiEvents.REQUEST_GET,
      id: id
    });

    // setTimeout(() => {
    //   console.log(id, mock);
    //   AppDispatcher.dispatchNext({
    //     actionType: WifiEvents.REQUEST_GET_SUCCESS,
    //     id: id,
    //     data: mock
    //   });
    // }, 100)

    this.request({
      /* url: "http://52.174.46.185:8080" + "/api",*/
      /* url: "http://localhost:8080" + "/api",*/
      url:  "api/" + ts + ".json"
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
