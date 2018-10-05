const element = (id) => {
    return document.getElementById(id)
};

const status = element('status');
const messages = element('messages');
const textarea = element('textarea');
const username = element('username');
const users = element('users');
const clearBtn = element('clear');
const currentUsers = element('current-users');
const typingNotice = element('typing-notice');

const statusDefault = status.textContent;
let userObject = {};
let timeout, typing, currentUser;

const setStatus = (s) => {
    status.textContent = s;

    if (s !== statusDefault) {
        const delay = setTimeout(() => setStatus(statusDefault), 4000)
    }
};

const socket = io.connect();
if (socket) {
    console.log('connected to socket.');

    socket.on('output', function(data) {
        if (data.length) {
            for (let x = 0; x < data.length; x++) {
                const { name, message, date } = data[x];
                const messageDiv = document.createElement('div');
                messageDiv.setAttribute('class', 'chat-message');
                const currentDate = new Date(date);
                const datetime = currentDate.getDate() + "/"
                    + (currentDate.getMonth()+1)  + "/"
                    + currentDate.getFullYear() + " @ "
                    + currentDate.getHours() + ":"
                    + currentDate.getMinutes() + ":"
                    + currentDate.getSeconds();
                messageDiv.innerHTML = `
                    <div class="css-tooltip">
                        <div class="css-tooltiptext">${datetime}</div>
                        <span id='message-name'>
                            <strong>${name}</strong>
                        </span>: ${message}
                    </div>`;
                messages.appendChild(messageDiv);
                messages.insertBefore(messageDiv, messages.firstChild);
                if (name === username.value) {
                    document.getElementById('message-name').classList.add('my-message');
                    messageDiv.style.textAlign='right'
                }
            }
        }
    });

    socket.on('status', (data) => {
        setStatus(typeof data === 'object' ? data.message : data);

        if (data.clear) {
            textarea.value = ''
        }
    })

    textarea.addEventListener('keydown', (e) => {
        // event 13 is enter and not holding enter
        if (e.which === 13 && e.shiftKey === false) {
            socket.emit('input', {
                name: username.value,
                message: textarea.value,
                date: new Date()
            });

            event.preventDefault();
        }
    });

    clearBtn.addEventListener('click', () => {
        socket.emit('clear');
    });
    // clear message
    socket.on('cleared', () => {
        messages.textContent = '';
    });

    socket.on('currentUsers', users => {
      currentUsers.textContent = users;
    });

    const timeoutFunction = () => {
        typing = false;
        socket.emit("typing", false);
    };

    textarea.addEventListener('keydown', () => {
        typing = true;
        socket.emit('typing', {
            username: username.value
        });
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });

    username.addEventListener('blur', () => {
        userObject = {
            old: currentUser,
            new: username.value
        };
        socket.emit('updateUser', userObject);
        currentUser = userObject.new
    });

    socket.on('typing', data => {
        if (data) {
            typingNotice.textContent = `${data.username} is typing...`;
        } else {
            typingNotice.textContent = '';
        }
    });

    socket.on('updateUsers', data => {
        users.textContent = data.join(", ");
    });
}
