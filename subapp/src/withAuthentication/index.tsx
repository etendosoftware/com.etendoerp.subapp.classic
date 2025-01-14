import React from "react";
import { User } from "../stores";
import { observer } from "mobx-react";

const withAuthentication = Component => {
  @observer
  class WithAuthentication extends React.Component {
    static navigationOptions = Component.navigationOptions;

    verifyAuthStr = () => {
      if (!User.token) {
        // @ts-ignore
        this.props.navigation.navigate("Login");
      }
    };
    componentDidMount = () => {
      this.verifyAuthStr();
    };
    componentDidUpdate = () => {
      this.verifyAuthStr();
    };
    render() {
      return User.token ? <Component {...this.props} /> : null;
    }
  }
  return WithAuthentication;
};

export default withAuthentication;
