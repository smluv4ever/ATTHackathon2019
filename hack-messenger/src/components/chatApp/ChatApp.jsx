import React from "react";
import Messages from "./Messages";
import Input from "./Input";
import ToneAnalyzerService from "../../service/ToneAnalyzerService";
import TextToSpeechService from "../../service/TextToSpeechService";

function randomName() {
  const adjectives = [
    "autumn",
    "hidden",
    "bitter",
    "misty",
    "silent",
    "empty",
    "dry",
    "dark",
    "summer",
    "icy",
    "delicate",
    "quiet",
    "white",
    "cool",
    "spring",
    "winter",
    "patient",
    "twilight",
    "dawn",
    "crimson",
    "wispy",
    "weathered",
    "blue",
    "billowing",
    "broken",
    "cold",
    "damp",
    "falling",
    "frosty",
    "green",
    "long",
    "late",
    "lingering",
    "bold",
    "little",
    "morning",
    "muddy",
    "old",
    "red",
    "rough",
    "still",
    "small",
    "sparkling",
    "throbbing",
    "shy",
    "wandering",
    "withered",
    "wild",
    "black",
    "young",
    "holy",
    "solitary",
    "fragrant",
    "aged",
    "snowy",
    "proud",
    "floral",
    "restless",
    "divine",
    "polished",
    "ancient",
    "purple",
    "lively",
    "nameless"
  ];
  const nouns = [
    "waterfall",
    "river",
    "breeze",
    "moon",
    "rain",
    "wind",
    "sea",
    "morning",
    "snow",
    "lake",
    "sunset",
    "pine",
    "shadow",
    "leaf",
    "dawn",
    "glitter",
    "forest",
    "hill",
    "cloud",
    "meadow",
    "sun",
    "glade",
    "bird",
    "brook",
    "butterfly",
    "bush",
    "dew",
    "dust",
    "field",
    "fire",
    "flower",
    "firefly",
    "feather",
    "grass",
    "haze",
    "mountain",
    "night",
    "pond",
    "darkness",
    "snowflake",
    "silence",
    "sound",
    "sky",
    "shape",
    "surf",
    "thunder",
    "violet",
    "water",
    "wildflower",
    "wave",
    "water",
    "resonance",
    "sun",
    "wood",
    "dream",
    "cherry",
    "tree",
    "fog",
    "frost",
    "voice",
    "paper",
    "frog",
    "smoke",
    "star"
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adjective + noun;
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

class ChatApp extends React.Component {
  constructor() {
    super();
    this.state = {
      analyzed: "",
      speech: [],
      messages: [],
      totalArray: [],
      member: {
        username: randomName(),
        color: randomColor()
      }
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
    const tone = response.data.document_tone.tone_categories[0];
    for (let i = 0; i < tone.tones.length; i++) {
      if (tone.tones[i].score >= 0.5) {
        newArray.push(tone.tones[i].tone_name);
      }
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

  textToSpeech = (message, tone) => {
    let speech = "";
    if (tone === "" || tone === null) {
      speech = (message + ", no tone").toString();
    } else {
      speech = (message + ", tone is " + tone).toString();
    }
    TextToSpeechService.textSpeechPost(
      speech,
      response => this.textSpeechPostSuccess(response, speech),
      this.textSpeechPostError
    );
  };

  textSpeechPostSuccess = (response, speech) => {
    this.setState({
      speech: speech
    });
    console.log(response);
    console.log(speech);
  };

  textSpeechPostError = error => {
    console.log("Failed to convert the text to speech", error);
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-9">
            <div className="App">
              <div className="App-header">
                <h1>My Chat App</h1>
                {this.state.messages && (
                  <Messages
                    messages={this.state.messages}
                    currentMember={this.state.member}
                  />
                )}
                <Input onSendMessage={this.onSendMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChatApp;
