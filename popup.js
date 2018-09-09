const prettier = window["prettier-standalone"];

function output(content) {
  var text = document.createTextNode(content);
  var pre = document.createElement("pre");
  pre.appendChild(text);
  document.getElementById("output").appendChild(pre);
}

function setAction(callback) {
  const actionButton = document.getElementById("setSelection");
  actionButton.classList.remove("hidden");
  actionButton.onclick = callback;
}

function sendMessage(payload, callback) {
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tab) {
      chrome.tabs.sendMessage(tab[0].id, payload, function(response) {
        callback(response.data);
      });
    }
  );
}

function format(parser, code) {
  const result = prettier.format(code, {
    semi: false,
    parser: parser
  });
  return result.replace(/^/gm, "    ");
}

function test(parser) {
  sendMessage({ method: "getSelection" }, selection => {
    try {
      const result = format(parser, selection);
      output(result);
      setAction(() => {
        sendMessage({ method: "setSelection", data: result }, () => {
          output("OK");
        });
      });
    } catch (e) {
      output(e.message);
    }
  });
}

function createUI(containerId) {
  const parsers = [
    "babylon",
    "flow",
    "typescript",
    "postcss",
    "json",
    "graphql",
    "markdown"
  ];

  const container = document.getElementById(containerId);
  parsers.forEach(parser => {
    const button = document.createElement("button");
    button.innerText = parser;
    button.onclick = () => test(parser);
    container.appendChild(button);
  });
}

createUI("buttons");
