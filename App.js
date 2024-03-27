import React from 'react';
import { Text, View, StatusBar } from 'react-native';
import Layout from './layouts/layout';
import Setup from './layouts/setup';
import * as Font from 'expo-font';
import API from './api';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      setup: false,
      fontLoaded: false
    };
  }

  componentDidMount(){
    this.loadFonts();
    this.checkSetupStatus();
  }

  async loadFonts() {
    await Font.loadAsync({
      'rubik': require('./fonts/Rubik-Regular.ttf'),
      'rubik-bold': require('./fonts/Rubik-Bold.ttf')
    });
    this.setState({ fontLoaded: true });
  }

  async checkSetupStatus() {
    const setupStatus = await API.getData("setup");
    if (setupStatus === "start") {
      this.setState({ setup: "start" });
    } else {
      this.setState({ setup: "done" });
    }
  }

  setupFinished = () => {
    this.setState({ setup: "done" });
    API.setData("setup", "done");
  };

  renderMainComponent() {
    const { setup } = this.state;
    switch (setup) {
      case "start":
        return <Setup finished={this.setupFinished} />;
      case "done":
        return <Layout language={this.state.currentLang} />;
      default:
        return null;
    }
  }

  render() {
    const { fontLoaded, setup } = this.state;
    if (fontLoaded) {
      return (
        <View style={{ flex: 1, position: "relative" }}>
          <StatusBar hidden={true} />
          {setup && this.renderMainComponent()}
        </View>
      );
    } else {
      return null;
    }
  }
}
