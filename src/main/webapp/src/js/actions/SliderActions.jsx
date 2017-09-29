import AppDispatcher from "app/AppDispatcher";
import SliderEvents from "app/events/SliderEvents";

const SliderActions = {
  set(id) {
    AppDispatcher.dispatchNext({
      actionType: SliderEvents.CHANGE_SLIDER,
      id: id
    });
  }
};

export default SliderActions;
