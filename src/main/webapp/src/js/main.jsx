import React from "react";
import ReactDOM from "react-dom";
// import {browserHistory, Route, Router, IndexRedirect} from "react-router";

import A from "./components/App";

document.addEventListener("DOMContentLoaded", function(event) {
  ReactDOM.render(<A />,
    document.getElementById("main"));
});


