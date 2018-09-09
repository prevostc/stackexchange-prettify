function log(content) {
  console.info(`Stack Exchange Prettify: ${content}`);
}

function getInputSelection(el) {
  var start = 0,
    end = 0,
    normalizedValue,
    range,
    textInputRange,
    len,
    endRange;

  if (
    typeof el.selectionStart == "number" &&
    typeof el.selectionEnd == "number"
  ) {
    start = el.selectionStart;
    end = el.selectionEnd;
  } else {
    range = document.selection.createRange();

    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, "\n");

      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart("character", -len);
        start += normalizedValue.slice(0, start).split("\n").length - 1;

        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd("character", -len);
          end += normalizedValue.slice(0, end).split("\n").length - 1;
        }
      }
    }
  }

  return {
    start: start,
    end: end
  };
}

function replaceSelectedText(el, text) {
  var sel = getInputSelection(el),
    val = el.value;
  el.value = val.slice(0, sel.start) + text + val.slice(sel.end);
  el.trigger("change");
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  log("Message: " + JSON.stringify(request));
  if (request.method === "getSelection") {
    log("Sending selection to be formatted");
    sendResponse({ data: window.getSelection().toString() });
  } else if (request.method === "setSelection") {
    log("Replacing selection");
    replaceSelectedText(document.activeElement, request.data);
    sendResponse({});
  } else {
    log("Unknown request");
    sendResponse({}); // snub them.
  }
});

log("Extension Loaded");
