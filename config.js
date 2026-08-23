module.exports = {
  ollama: {
    url: "http://127.0.0.1:11434",
    model: "qwen2.5:latest"
  },
  gemini: {
    enabled: false,
    model: "gemini-2.5-flash",
    // Please provide the token only if Gemini is enabled
    token: ""
  }
};
