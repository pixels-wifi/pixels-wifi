import AbstractIdStore from "./AbstractIdStore";
import AppDispatcher from "app/AppDispatcher";

import WifiEvents from "app/events/wifi";

const WifiStore = AbstractIdStore();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case WifiEvents.REQUEST_GET:
      WifiStore.onRequest(action);
      break;
    case WifiEvents.REQUEST_GET_CACHED:
      WifiStore.refresh(action);
      break;
    case WifiEvents.REQUEST_GET_SUCCESS:
      console.log(action);
      WifiStore.onRequestSuccess(action);
      break;
    case WifiEvents.REQUEST_GET_ERROR:
      WifiStore.onRequestError(action);
      break;
  }
});

export default WifiStore;
