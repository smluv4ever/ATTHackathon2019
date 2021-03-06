import axios from "axios";

class ToneAnalyzerService {
  static analyzerPost(data, onSuccess, onError) {
    const url =
      "https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2016-05-19";
    const config = {
      method: "POST",
      data: `{"text": "${data}"}`,
      headers: { "Content-Type": "application/json" },
      auth: {
        username: "apikey",
        password: "oOd0txFJhuRKte3lRX99XdHHUfs5LKEDlAdqD33RSk-x"
      }
    };
    axios.defaults.withCredentials = false;
    axios(url, config)
      .then(onSuccess)
      .catch(onError);
  }
}

export default ToneAnalyzerService;
