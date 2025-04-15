import React from "react";

import Home from "components/Home";
import CreatePost from "components/Home/Posts/Create";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import routes from "./routes";

const App = () => (
  <Router>
    <Switch>
      <Route exact component={CreatePost} path={routes.posts.create} />
      <Route exact component={Home} path={routes.root} />
    </Switch>
  </Router>
);

export default App;
