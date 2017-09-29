import pathMirror from "pathmirror";

const WifiEvents = pathMirror({
  WIFI_EVENTS: {
    REQUEST_GET: null,
    REQUEST_GET_SUCCESS: null,
    REQUEST_GET_ERROR: null
  }
});

export default Object.freeze(WifiEvents).WIFI_EVENTS;
