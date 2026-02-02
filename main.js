/**************************************************
 *                CONSTANTS
 **************************************************/
const CONSTANTS = {
  USER_MESSAGE: 'div[class*="user-message"]', // selector for user messages
  WAIT_TIME: 3000, // 3 seconds wait before initializing
  MAX_MESSAGE_LENGTH: 80, // max chars in TOC entry
  CHAT_CHANGE_DELAY: 800, // delay for chat switch handling
};

/**************************************************
 *          USER MESSAGE EXTRACTION
 **************************************************/
class UserMessageExtractor {
  // Extract all user messages from the chat and assign unique IDs
  static extractAllMessages() {
    return Array.from(document.querySelectorAll(CONSTANTS.USER_MESSAGE)).map(
      (el, index) => {
        const id = `user-message-${index}`;
        el.id = id;
        return { id, text: el.textContent.trim() };
      },
    );
  }
}

/**************************************************
 *             TABLE OF CONTENTS DIV
 **************************************************/
class TOCDiv {
  static container = null;

  /***** CREATE TOC CONTAINER *****/
  static createContainer(targetSelector) {
    this.container = document.createElement("div");
    this.container.id = "tocContainer";

    // Set initial width (15% of viewport, clamped between 180-400px)
    const viewportWidth = window.innerWidth;
    const desiredWidth = Math.min(Math.max(viewportWidth * 0.15, 180), 400);
    this.container.style.width = `${desiredWidth}px`;

    // Find layout container
    const layoutContainer = document.querySelector("#thread");
    if (!layoutContainer) {
      console.warn("Layout container not found");
      return;
    }

    // Find sidebar and page header
    const sidebar = layoutContainer.querySelector(
      'nav[class*="group/scrollport"].relative.flex.h-full.w-full.flex-1.flex-col.overflow-y-auto.transition-opacity.duration-500',
    );
    const page_header = document.querySelector("#page-header");

    if (!page_header) console.warn("Header element not found");
    if (!sidebar) console.warn("Sidebar not found");

    // Append TOC container to layoutContainer
    layoutContainer.style.position = "relative"; // needed for absolute positioning inside
    layoutContainer.appendChild(this.container);

    // Function to update TOC position and height dynamically
    const updateTOCPosition = () => {
      const headerHeight = page_header
        ? page_header.getBoundingClientRect().height
        : 0;
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
      const layoutRect = layoutContainer.getBoundingClientRect();

      // Update width dynamically on every call (on resize)
      const viewportWidth = window.innerWidth;
      const desiredWidth = Math.min(Math.max(viewportWidth * 0.15, 180), 400);
      this.container.style.width = `${desiredWidth}px`;

      // Position TOC container relative to layout
      this.container.style.top = `${headerHeight}px`;
      this.container.style.left = `${sidebarWidth}px`;

      // Height: from below header to bottom of layout
      this.container.style.height = `${layoutRect.height - headerHeight}px`;
    };

    // Initial position update
    updateTOCPosition();

    // Update on window resize
    window.addEventListener("resize", updateTOCPosition);
  }

  /***** CREATE TOC HEADER (TITLE + TOGGLE BUTTON) *****/
  static createHeader() {
    const header = document.createElement("div");
    header.id = "tocheader";

    const toggleButton = document.createElement("button");
    toggleButton.id = "toggleButton";
    toggleButton.textContent = "-";

    const title = document.createElement("h1");
    title.textContent = "Table of contents";

    // Toggle TOC list visibility when clicked
    toggleButton.addEventListener("click", () => {
      const listContainer = this.container.querySelector("#listContainer");
      if (!listContainer) return;

      const isCollapsed = listContainer.style.display === "none";

      listContainer.style.display = isCollapsed ? "block" : "none";
      title.style.display = isCollapsed ? "block" : "none";
      header.classList.toggle("collapsed", !isCollapsed);
      toggleButton.textContent = isCollapsed ? "-" : "☰";
    });

    header.appendChild(toggleButton);
    header.appendChild(title);
    this.container.appendChild(header);
  }

  /***** CREATE TOC LIST OF MESSAGES *****/
  static createList(userMessages) {
    const listContainer = document.createElement("div");
    listContainer.id = "listContainer";

    const orderedList = document.createElement("ol");

    for (const item of userMessages) {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");

      anchor.href = `#${item.id}`; // link to message

      const isTooLong = item.text.length > CONSTANTS.MAX_MESSAGE_LENGTH;
      const trimmedText = item.text.slice(0, CONSTANTS.MAX_MESSAGE_LENGTH);
      anchor.textContent = isTooLong ? trimmedText + "..." : item.text;

      listItem.appendChild(anchor);
      orderedList.appendChild(listItem);
    }

    listContainer.appendChild(orderedList);
    this.container.appendChild(listContainer);
  }

  /***** UPDATE TOC (CREATE OR REFRESH LIST) *****/
  static updateTOC() {
    console.log("updateTOC static method called!");

    if (!this.container) {
      console.warn("TOC container does not exist. Creating it.");
      this.createContainer("#page-header");
      this.createHeader();
    } else if (!document.body.contains(this.container)) {
      console.warn("TOC container exists but not in DOM. Re-appending.");
      const layoutContainer = document.querySelector("#thread");
      if (layoutContainer) {
        layoutContainer.style.position = "relative";
        layoutContainer.appendChild(this.container);
      }
    }

    // Extract messages & refresh list
    const userMessages = UserMessageExtractor.extractAllMessages();
    this.container.querySelector("#listContainer")?.remove();
    this.createList(userMessages);
  }
}

/**************************************************
 *          CHAT MESSAGE MUTATION OBSERVER
 **************************************************/
let chatMessagesObserver = null;

function setupMutationObserver() {
  const chatMessagesContainer = document.querySelector(
    'div[class*="@thread-xl/thread:pt-header-height"]',
  );

  if (!chatMessagesContainer) {
    console.warn("Chat message container NOT found.");
    return null;
  }

  console.log("Chat messages container found. Setting up observer.");

  if (chatMessagesObserver) chatMessagesObserver.disconnect();

  chatMessagesObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.tagName.toLowerCase() === "article"
          ) {
            console.log("New <article> added:", node);
            TOCDiv.updateTOC();
          }
        });
      }
    }
  });

  chatMessagesObserver.observe(chatMessagesContainer, {
    childList: true,
    subtree: true,
  });
  return chatMessagesObserver;
}

/**************************************************
 *          CHAT SWITCH OBSERVER
 **************************************************/
function chatMutationObserver() {
  let currentChatId = getCurrentChatId();
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      const newChatId = getCurrentChatId();
      if (newChatId !== currentChatId) {
        console.log(`Chat changed from ${currentChatId} to ${newChatId}`);
        currentChatId = newChatId;

        setupMutationObserver();
        setTimeout(() => TOCDiv.updateTOC(), CONSTANTS.WAIT_TIME);
      }
    }
  });

  observer.observe(document, { subtree: true, childList: true });
}

function getCurrentChatId() {
  const url = window.location.href;
  const match = url.match(/chatgpt\.com\/c\/([^/?#]+)/);
  return match ? match[1] : null;
}

/**************************************************
 *              MAIN EXTENSION INITIALIZATION
 **************************************************/
class TOCExtension {
  constructor() {
    const userMessages = UserMessageExtractor.extractAllMessages();
    console.log(userMessages);

    TOCDiv.createContainer("#page-header");
    TOCDiv.createHeader();
    TOCDiv.createList(userMessages);
  }
}

// Initialize after WAIT_TIME
setTimeout(() => {
  const tocExtension = new TOCExtension();
  setupMutationObserver();
  chatMutationObserver();
}, CONSTANTS.WAIT_TIME);
