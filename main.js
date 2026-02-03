// github link

/*
 * Constants
 */
const CONSTANTS = {
  MAX_MESSAGE_LENGTH: 80,
};

/*
 * Helper Functions
 */

/*
 * TOC Container Class
 */
class TOCDiv {
  static container = null;

  // create the main TOC container
  static createContainer() {
    if (this.container) return; // guard

    this.container = document.createElement("div");
    this.container.id = "tocContainer";

    // create the elements
    const header = this.createHeader();
    const search = this.createSearch();
    const list = this.createList();

    // append them to main container
    this.container.appendChild(header);
    this.container.appendChild(search);
    this.container.appendChild(list);

    document.body.appendChild(this.container);
  }

  // create the TOC header, contains title + buttons
  static createHeader() {
    const header = document.createElement("div");
    header.id = "toc-header";

    const toggleButton = document.createElement("button");
    toggleButton.id = "toggleButton";
    toggleButton.textContent = "-";

    const title = document.createElement("h1");
    title.textContent = "Table of contents";

    header.appendChild(toggleButton);
    header.appendChild(title);

    return header;
  }

  static createSearch() {
    const search = document.createElement("div");
    search.id = "toc-search";

    const testSearch = document.createElement("h1");
    testSearch.textContent = "Search bar goes here";

    search.appendChild(testSearch);

    return search;
  }

  static createList(userMessages) {
    const listContainer = document.createElement("div");
    listContainer.id = "toc-listContainer";

    const orderedList = document.createElement("ol");
    listContainer.appendChild(orderedList);
    this.list = orderedList;

    return listContainer;
  }

  // add a list item
  static addListItem(msgNode, displayText) {
    if (!this.list) return;

    // Give the original message an ID so the link can jump to it
    const id = "msg-" + Date.now(); // simple unique ID
    msgNode.id = id;

    // Create <li> with <a>
    const li = document.createElement("li");
    li.style.marginBottom = "5px";

    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = displayText;
    link.style.textDecoration = "none";
    link.style.color = "#007bff";
    link.style.cursor = "pointer";

    li.appendChild(link);
    this.list.appendChild(li);
  }
}

/*
 * Mutation Observers
 */
let processedMessages = [];
let chatMessageObserver;

// Chat window monitoring for new messages
function observeNewUserMessages() {
  const container = document.querySelector("main");

  if (!container) {
    console.log("No user message containers found yet. Retrying in 2s...");
    setTimeout(observeNewUserMessages, 2000); // Retry for dynamic load
    return;
  }

  // Disconnect previous observer if exists
  if (chatMessageObserver) {
    chatMessageObserver.disconnect();
  }

  // Create observer
  chatMessageObserver = new MutationObserver(() => {
    const userMessages = Array.from(
      document.querySelectorAll('[data-message-author-role="user"]'),
    );

    // Filter new messages
    const newMessages = userMessages.filter(
      (msg) => !processedMessages.includes(msg),
    );

    if (newMessages.length > 0) {
      console.log("New messages detected:", newMessages.length);

      // Add them to your processed array
      processedMessages.push(...newMessages);

      // For each new message, create TOC entry
      newMessages.forEach((msg, index) => {
        const text = msg.innerText || msg.textContent || "";
        const displayText = text.length > 40 ? text.slice(0, 40) + "…" : text;

        TOCDiv.addListItem(msg, displayText);
      });
    }
  });
  // Start observing
  chatMessageObserver.observe(container, {
    childList: true,
    subtree: true, // Watch nested changes
  });
}

// Chat change URL
function observeChatChange() {
  const chatMessageContainer = document.querySelectorAll();
  chatMessageObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        console.log("new child node added or removed!");
      }
    }
  });
}

/*
 * Initialize Extension
 */
setTimeout(() => {
  TOCDiv.createContainer();
  observeNewUserMessages();
}, 500);
