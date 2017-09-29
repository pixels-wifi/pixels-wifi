import {Dispatcher} from "flux";
const AppDispatcher = new Dispatcher();

AppDispatcher.dispatchNext = function (obj) {
  setImmediate(function () {
    AppDispatcher.dispatch(obj);
  });
};

export default AppDispatcher;
