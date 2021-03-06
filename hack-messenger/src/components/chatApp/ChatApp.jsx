import React from "react";
import Messages from "./Messages";
import Input from "./Input";
import ToneAnalyzerService from "../../service/ToneAnalyzerService";
import TextToSpeechService from "../../service/TextToSpeechService";
import ChatAppLayout from "./ChatAppLayout";
import Dashboard from "../Dashboard";
// import PersonalityInsightsService from "../../service/PersonalityInsightsService";

import ReactChartkick, { ColumnChart } from "react-chartkick";
import Chart from "chart.js";

ReactChartkick.addAdapter(Chart);
function randomName() {
  const adjectives = ["ancient", "purple", "lively"];
  const nouns = ["waterfall", "wind", "star"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adjective + noun;
}
function toneAverage(currentAverage, num2, currentIndex) {
  currentAverage = currentAverage + num2 / currentIndex;
  return currentAverage;
}
class ChatApp extends React.Component {
  constructor() {
    super();
    this.state = {
      angerIndex: 0,
      angerToneScore: 0,
      disgustToneScore: 0,
      disgustIndex: 0,
      fearToneScore: 0,
      fearIndex: 0,
      joyToneScore: 0,
      joyIndex: 0,
      sadnessToneScore: 0,
      sadnessIndex: 0,
      analyzed: "",
      messages: [],
      totalArray: [],
      member: {
        username: randomName()
      },
      score: 0,

      ternary: false,
      data: null
    };
    this.drone = new window.Scaledrone("eYSzFbz5CWV88jSw", {
      data: this.state.member
    });
    this.drone.on("open", error => {
      if (error) {
        return console.error(error);
      }
      const member = { ...this.state.member };
      member.id = this.drone.clientId;
      this.setState({ member });
    });
    const room = this.drone.subscribe("observable-room");
    room.on("data", (data, member) => {
      const messages = this.state.messages;
      messages.push({ member, text: data });
      this.setState({ messages }, () => {
        this.analyzing(data);
      });
    });
  }
  onSendMessage = message => {
    this.drone.publish({
      room: "observable-room",
      message
    });
  };

  analyzing = message => {
    ToneAnalyzerService.analyzerPost(
      message,
      response => this.analyzingSuccess(response, message),
      this.analyzingError
    );
  };

  analyzingSuccess = (response, message) => {
    let newArray = [];
    let angerScore = 0;
    let disgustScore = 0;
    let fearScore = 0;
    let joyScore = 0;
    let sadnessScore = 0;
    const tone = response.data.document_tone.tone_categories[0];
    if (tone.tones !== null || tone.tones.length > 0) {
      for (let i = 0; i < tone.tones.length; i++) {
        if (i === 0) {
          angerScore = toneAverage(
            this.state.angerToneScore,
            tone.tones[i].score,
            this.state.angerIndex + 1
          );
        } else if (i === 1) {
          disgustScore = toneAverage(
            this.state.disgustToneScore,
            tone.tones[i].score,
            this.state.disgustIndex + 1
          );
        } else if (i === 2) {
          fearScore = toneAverage(
            this.state.fearToneScore,
            tone.tones[i].score,
            this.state.fearIndex + 1
          );
        } else if (i === 3) {
          joyScore = toneAverage(
            this.state.joyToneScore,
            tone.tones[i].score,
            this.state.joyIndex + 1
          );
        } else {
          sadnessScore = toneAverage(
            this.state.sadnessToneScore,
            tone.tones[i].score,
            this.state.sadnessIndex + 1
          );
        }
        if (tone.tones[i].score >= 0.5) {
          newArray.push(tone.tones[i].tone_name);
          this.setState({
            score: tone.tones[i].score
          });
        }
      }
      let newArrayToString = newArray.toString();
      const updatedResults = newArrayToString;
      let updatedArray = [...this.state.totalArray];
      const updatedMessages = [...this.state.messages];
      updatedMessages[updatedMessages.length - 1].tone = updatedResults;
      this.setState({
        analyzed: newArrayToString,
        totalArray: updatedArray,
        messages: updatedMessages,
        angerIndex: this.state.angerIndex + 1,
        disgustIndex: this.state.disgustIndex + 1,
        fearIndex: this.state.fearIndex + 1,
        joyIndex: this.state.joyIndex + 1,
        sadnessIndex: this.state.sadnessIndex + 1,
        angerToneScore: angerScore,
        disgustToneScore: disgustScore,
        fearToneScore: fearScore,
        joyToneScore: joyScore,
        sadnessToneScore: sadnessScore
      });
    } else {
      let newObj = { messages: message, results: "" };
      let updatedArray = [...this.state.totalArray];
      updatedArray.push(newObj);
      this.setState({
        analyzed: "",
        totalArray: updatedArray,
        angerIndex: this.state.angerIndex + 1,
        disgustIndex: this.state.disgustIndex + 1,
        fearIndex: this.state.fearIndex + 1,
        joyIndex: this.state.joyIndex + 1,
        sadnessIndex: this.state.sadnessIndex + 1,
        angerToneScore: angerScore,
        disgustToneScore: disgustScore,
        fearToneScore: fearScore,
        joyToneScore: joyScore,
        sadnessToneScore: sadnessScore
      });
    }
    let newArrayToString = newArray.toString();
    const updatedMessages = [...this.state.messages];
    updatedMessages[updatedMessages.length - 1].tone = newArrayToString;
    this.setState({
      analyzed: newArrayToString,
      messages: updatedMessages
    });
    let toneOfText = this.state.messages;
    this.textToSpeech(message, toneOfText[toneOfText.length - 1].tone);
  };
  analyzingError = error => {
    console.log("Analyzing failed", error);
  };
  ternaryChange = () => {
    this.setState({
      ...this.state,
      ternary: !this.state.ternary
    });
  };

  textToSpeech = (message, tone) => {
    let speech = "";
    if (tone === "" || tone === null) {
      speech = (message + ", no tone").toString();
    } else {
      speech = (message + ", tone is " + tone).toString();
    }
    TextToSpeechService.textSpeechPost(
      speech,
      response => this.textSpeechPostSuccess(response),
      this.textSpeechPostError
    );
  };

  textSpeechPostSuccess = response => {
    this.setState({
      data: response.data
    });
  };

  textSpeechPostError = error => {
    console.log("Failed to convert the text to speech", error);
  };

  render() {
    if (this.state.ternary === false) {
      return (
        <ChatAppLayout
          chatApp={
            // <div className="chat-container">
            <div className="row">
              <div className="col-md-12">
                <div className="App">
                  <div className="App-header">
                    {this.state.messages && (
                      <Messages
                        messages={this.state.messages}
                        currentMember={this.state.member}
                      />
                    )}
                  </div>
                  <Input
                    onSendMessage={this.onSendMessage}
                    ternaryPage={this.ternaryChange}
                    username={this.state.member.username}
                  />
                  {this.state.documentTone}
                </div>
              </div>
            </div>
            // </div>
          }
          graph={
            <ColumnChart
              data={[
                ["Anger", this.state.angerToneScore],
                ["Disgust", this.state.disgustToneScore],
                ["Fear", this.state.fearToneScore],
                ["Joy", this.state.joyToneScore],
                ["Sadness", this.state.sadnessToneScore]
              ]}
              colors={["#0F2924"]}
            />
          }
        />
      );
    } else {
      return <Dashboard username={this.state.member.username} ternaryPage={this.ternaryChange}/>;
    }
  }
}
export default ChatApp;
