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

    return listContainer;
  }
}

/*
 * Mutation Observers
 */

// Chat window monitoring for new messages
function observeNewUserMessages() {
  const chatMessageContainer = document.querySelectorAll(
    '[data-message-author-role="user"]',
  );
  chatMessageObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        console.log("new child node added or removed!");
      }
    }
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
}, 500);
