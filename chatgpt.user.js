// ==UserScript==
// @name         ChatGPT
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  ChatGPT enhancements.
// @author       Maddison Hellstrom
// @homepage     https://github.com/b0o/user-scripts
// @match        https://chat.openai.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chat.openai.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.onload = function () {
  "use strict";

  const triggerInputChange = (node, value = "") => {
    const setValue = Object.getOwnPropertyDescriptor(
      node.__proto__,
      "value"
    ).set;
    const event = new Event("input", { bubbles: true });
    setValue.call(node, value);
    node.dispatchEvent(event);
  };

  let timedOut = false;
  const accept = (e) => {
    e.preventDefault();
    timedOut = true;
    setTimeout(() => {
      timedOut = false;
    }, 250);
  };

  const action = (observer) => {
    document
      .querySelector("form textarea")
      .addEventListener("keydown", function (e) {
        if (timedOut) return;

        // On Ctrl+Enter, send message
        if (e.ctrlKey && e.keyCode === 13) {
          document.querySelector("form button").click();
          return accept(e);
        }

        // On Ctrl+`, insert a code block
        // If the user has selected text, wrap it in a code block
        if (e.ctrlKey && e.keyCode === 192) {
          console.log("insert code block");
          e.preventDefault();
          const textarea = document.querySelector("form textarea");
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          const preText = textarea.value.substring(0, startPos);
          const selectedText = textarea.value.substring(startPos, endPos);
          const postText = textarea.value.substring(
            endPos,
            textarea.value.length
          );

          // Check if there's selected text
          if (selectedText.length > 0) {
            const codeBlock = `${preText}\`\`\`\n${selectedText}\n\`\`\`${postText}`;
            triggerInputChange(textarea, codeBlock);
          } else {
            const codeBlock = `${preText}\`\`\`\n\n\`\`\`${postText}`;
            triggerInputChange(textarea, codeBlock);
            setTimeout(() => {
              textarea.selectionStart = startPos + 4;
              textarea.selectionEnd = startPos + 4;
            }, 1);
          }
          return accept(e);
        }
      });
  };

  let timer;
  var observer = new MutationObserver((changes, observer) => {
    clearTimeout(timer);
    timer = setTimeout(action, 500, observer);
  });
  observer.observe(document, { childList: true, subtree: true });
  timer = setTimeout(action, 500, observer);
};
