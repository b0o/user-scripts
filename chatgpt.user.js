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

window.onload = async function() {
  "use strict"

  if (Notification.permission !== "granted") {
    await Notification.requestPermission()
  }

  const triggerInputChange = (node, value = "") => {
    const setValue = Object.getOwnPropertyDescriptor(node.__proto__, "value").set
    const event = new Event("input", { bubbles: true })
    setValue.call(node, value)
    node.dispatchEvent(event)
  }

  let timedOut = false
  const accept = (e) => {
    e.preventDefault()
    timedOut = true
    setTimeout(() => {
      timedOut = false
    }, 250)
  }

  const onComplete = () => {
    const message = document.querySelector(".final-completion div[data-message-id]")?.innerText
      ?? "Finished generating"
    const shortMessage = (message.length >= 100 ? "…" : "") + message.substring(message.length - 100)
    new Notification("ChatGPT", {
      body: shortMessage,
      requireInteraction: true,
    })
  }

  const setupEventListeners = () => {
    document.querySelector("form textarea")?.addEventListener("keydown", function(e) {
      if (timedOut) return

      // On Ctrl+Enter, send message
      if (e.ctrlKey && e.keyCode === 13) {
        document.querySelector("form button:last-child").click()
        return accept(e)
      }

      // On Ctrl+`, insert a code block
      // If the user has selected text, wrap it in a code block
      if (e.ctrlKey && e.keyCode === 192) {
        console.log("insert code block")
        e.preventDefault()
        const textarea = document.querySelector("form textarea")
        const startPos = textarea.selectionStart
        const endPos = textarea.selectionEnd
        const preText = textarea.value.substring(0, startPos)
        const selectedText = textarea.value.substring(startPos, endPos)
        const postText = textarea.value.substring(endPos, textarea.value.length)

        // Check if there's selected text
        if (selectedText.length > 0) {
          const codeBlock = `${preText}\`\`\`\n${selectedText}\n\`\`\`${postText}`
          triggerInputChange(textarea, codeBlock)
        } else {
          const codeBlock = `${preText}\`\`\`\n\n\`\`\`${postText}`
          triggerInputChange(textarea, codeBlock)
          setTimeout(() => {
            textarea.selectionStart = startPos + 4
            textarea.selectionEnd = startPos + 4
          }, 1)
        }
        return accept(e)
      }
    })
  }

  let inProgress = false
  let timer
  var observer = new MutationObserver(() => {
    clearTimeout(timer)
    timer = setTimeout(setupEventListeners, 500)
    if (document.querySelector("form button:last-child")?.dataset?.testid === "send-button") {
      if (inProgress) {
        onComplete()
        inProgress = false
      }
    } else {
      inProgress = true
    }
  })
  observer.observe(document, { childList: true, subtree: true })
  timer = setTimeout(() => setupEventListeners(observer), 500)
}
