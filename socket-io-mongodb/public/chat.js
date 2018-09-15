const element = id => {
  return document.getElementById(id);
};

const status = element("status");
const messages = element("messages");
const textarea = element("textarea");
const username = element("username");
const clearBtn = element("clear");

const statusDefault = status.textContent;

const setStatus = s => {
  status.textContent = s;

  if (s !== statusDefault) {
    const delay = setTimeout(() => setStatus(statusDefault), 4000);
  }
};

const socket = io.connect();

if (socket !== undefined) {
  console.log("connected to socket...");
  socket.on("output", function(data) {
    if (data.length) {
      for (let x = 0; x < data.length; x++) {
        // Build out message div
        const message = document.createElement("div");
        message.setAttribute("class", "chat-message");
        message.innerHTML = `<strong>${data[x].name}</strong>: ${
          data[x].message
        }`;
        messages.appendChild(message);
        messages.insertBefore(message, messages.firstChild);
      }
    }
  });

  socket.on("status", data => {
    setStatus(typeof data === "object" ? data.message : data);

    if (data.clear) {
      textarea.value = "";
    }
  });

  textarea.addEventListener("keydown", e => {
    // event 13 is enter and not holding enter
    if (e.which === 13 && e.shiftKey === false) {
      socket.emit("input", {
        name: username.value,
        message: textarea.value
      });

      event.preventDefault();
    }
  });

  clearBtn.addEventListener("click", function() {
    socket.emit("clear");
  });
  // Clear Message
  socket.on("cleared", function() {
    messages.textContent = "";
  });
}
