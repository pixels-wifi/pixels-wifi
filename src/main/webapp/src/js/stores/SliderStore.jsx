import lazy from "lazy.js";
import {EventEmitter} from "events";
import AppDispatcher from "app/AppDispatcher";

import SliderEvents from "app/events/SliderEvents";

var current = 29;

const SliderStore = lazy(EventEmitter.prototype).extend({
  set(id) {
    current = id;
    this.emit("change", id);
  },
  get() {
    return current;
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case SliderEvents.CHANGE_SLIDER:
      SliderStore.set(action.id);
      break;
  }
});

export default SliderStore;
