import React from "react";
import { Navbar, Collapse, Nav, NavItem, NavLink } from "reactstrap";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import LandingPage from "./components/landingPage/LandingPage";
import ChatApp from "./components/chatApp/ChatApp";
import PersonalityLayout from "./components/personalityProfile/PersonalityLayout";
import Dashboard from "../src/components/Dashboard";

class Routes extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          <Navbar className="navbar" light expand="md">
            <Collapse navbar>
              <Nav>
                <NavItem className="NavItem">
                  <NavLink tag={Link} to="/">
                    Home
                  </NavLink>
                </NavItem>
                <NavItem className="NavItem">
                  <NavLink tag={Link} to="/chatApp">
                    Messenger
                  </NavLink>
                </NavItem>              
                <NavItem className="NavItem">
                  <NavLink tag={Link} to="/profilePage">
                    Personality Breakdown
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>

          <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/chatApp" component={ChatApp} />
          <Route exact path="/profilePage" component={PersonalityLayout} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route component={LandingPage} />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default Routes;
