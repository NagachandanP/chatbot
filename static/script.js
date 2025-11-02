// static/script.js (FINAL VERSION)

const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

// Function to dynamically resize the textarea
function autoResizeInput() {
    chatInput.style.height = 'auto'; 
    const maxHeight = parseFloat(getComputedStyle(chatInput).lineHeight) * 5;
    const scrollHeight = chatInput.scrollHeight;
    chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px';
}

// Function to add a copy button to all rendered code blocks
function addCopyButtons(messageDiv) {
    // Select all <pre> elements within the specific message
    const codeBlocks = messageDiv.querySelectorAll('pre');

    codeBlocks.forEach(pre => {
        // Only process code blocks that haven't been wrapped yet
        if (pre.parentNode.classList.contains('code-wrapper')) return;

        // 1. Get the raw code text inside the <code> element
        const code = pre.querySelector('code').innerText;
        
        // 2. Create the copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.textContent = 'Copy';
        
        // 3. Add copy event listener
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
                copyButton.textContent = 'Error';
            });
        });

        // 4. Wrap the button and the <pre> block in a container for positioning
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        
        // Append the button to the wrapper and move the <pre> element into it
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(copyButton);
    });
}

// Function to create and append a new message element
function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}-avatar`;
    avatar.textContent = sender === 'user' ? 'You' : 'AI';

    const content = document.createElement('div');
    content.className = 'message-content';
    
    if (sender === 'bot') {
        // Use Marked.js to convert Markdown string to HTML
        content.innerHTML = marked.parse(message); 
    } else {
        // User messages are treated as plain text
        content.innerText = message; 
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);

    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
}

// Main function to handle sending the message
async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    appendMessage('user', userMessage);
    
    chatInput.value = '';
    autoResizeInput();
    sendButton.disabled = true;
    chatInput.disabled = true;

    const botPlaceholder = appendMessage('bot', 'Typing...');

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.reply;

        // 1. Update the content with rendered Markdown
        botPlaceholder.querySelector('.message-content').innerHTML = marked.parse(botReply);
        
        // 2. Add copy buttons ONLY to the newly rendered message
        addCopyButtons(botPlaceholder);

    } catch (error) {
        console.error('Error fetching bot response:', error);
        botPlaceholder.querySelector('.message-content').innerText = "Sorry, an error occurred. Please try again.";
    } finally {
        sendButton.disabled = false;
        chatInput.disabled = false;
        chatInput.focus(); 
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// Function to initialize the chat interface and render the welcome message
function initializeChat() {
    // The welcome message, written in Markdown
    const welcomeMessage = `
Hello! I am a **Python Expert** powered by Gemini. Ask me anything! 
I can provide code, explain concepts, or help debug. 
`;
    const initialMsgDiv = appendMessage('bot', welcomeMessage);
    
    // Add copy buttons, just in case the welcome message has code blocks
    addCopyButtons(initialMsgDiv);
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('input', () => {
    autoResizeInput();
    sendButton.disabled = chatInput.value.trim() === '';
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        if (!sendButton.disabled) {
            sendMessage();
        }
    }
});

// Final calls on page load
sendButton.disabled = chatInput.value.trim() === '';
initializeChat();