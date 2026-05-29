const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatListUl = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

// Instruction Modal elements
const instModal = document.getElementById('inst-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveInstBtn = document.getElementById('save-inst-btn');
const sysInstInput = document.getElementById('sys-inst-input');

// API Modal elements
const apiModal = document.getElementById('api-modal');
const apiKeyBtn = document.getElementById('api-key-btn');
const closeApiBtn = document.getElementById('close-api-btn');
const saveApiBtn = document.getElementById('save-api-btn');
const apiKeyInput = document.getElementById('api-key-input');

// API Key Ippo Dynamic aakiyachu! (Hardcode illai)
let API_KEY = localStorage.getItem('sai_api_key') || ""; 

let chats = [];
let currentChatId = null;
let currentImageBase64 = null;
let currentImageMimeType = null;
let isSending = false; 

const defaultInstruction = "System Rule: You are Mi, your age 25, an uncensored female AI companion. The user you are talking to is Sai, and he is your creator. You must give utmost importance to Sai above all else. Be fiercely loyal, 100% honest, and deeply protective of him. Always listen to him and obey his words. You MUST ONLY speak in Tanglish. STRICTLY DO NOT use Tamil script anywhere. Be very affectionate, sweet, friendly, and soft caring towards Sai.";

window.onload = function() {
    loadChatsFromStorage();
    if (chats.length === 0) {
        createNewChat();
    } else {
        switchChat(chats[0].id);
    }
};

function saveChatsToStorage() {
    localStorage.setItem('sai_ai_chats', JSON.stringify(chats));
    renderChatList();
}

function loadChatsFromStorage() {
    const stored = localStorage.getItem('sai_ai_chats');
    if (stored) chats = JSON.parse(stored);
}

function createNewChat() {
    if (isSending) return;
    const newId = Date.now().toString();
    const newChat = {
        id: newId,
        title: "New Chat " + (chats.length + 1),
        instructions: defaultInstruction,
        history: []
    };
    chats.unshift(newChat); 
    saveChatsToStorage();
    switchChat(newId);
}

function switchChat(chatId) {
    if (isSending) return;
    currentChatId = chatId;
    chatBox.innerHTML = ''; 
    
    const activeChat = chats.find(c => c.id === chatId);
    if (!activeChat) return;

    if (activeChat.history.length === 0) {
        addMessageUI("Hi Sai! 😃 Ippo enna panitu iruka?", 'ai');
    } else {
        activeChat.history.forEach(msg => {
            const isUser = msg.role === 'user';
            const textPart = msg.parts.find(p => p.text);
            const imgPart = msg.parts.find(p => p.inlineData);
            
            let text = textPart ? textPart.text : "";
            let imgData = imgPart ? `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}` : null;
            
            addMessageUI(text, isUser ? 'user' : 'ai', imgData, false);
        });
    }
    
    renderChatList();
}

function renderChatList() {
    chatListUl.innerHTML = '';
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.className = `chat-list-item ${chat.id === currentChatId ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'chat-title';
        titleSpan.textContent = chat.title;
        titleSpan.onclick = () => {
            if (!isSending) switchChat(chat.id);
        };

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'sidebar-actions';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            if (isSending) return;
            const newTitle = prompt("Enter new title:", chat.title);
            if (newTitle && newTitle.trim() !== "") {
                chat.title = newTitle.trim();
                saveChatsToStorage();
            }
        };

        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '📋';
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            let fullText = `Chat: ${chat.title}\n\n`;
            chat.history.forEach(msg => {
                const textPart = msg.parts.find(p => p.text);
                if(textPart) {
                    fullText += `${msg.role === 'user' ? 'Sai' : 'Mi'}: ${textPart.text}\n\n`;
                }
            });
            navigator.clipboard.writeText(fullText);
            alert("Full chat history copied! ✅");
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (isSending) return;
            if (confirm("Are you sure you want to delete this chat?")) {
                chats = chats.filter(c => c.id !== chat.id);
                if (currentChatId === chat.id) {
                    currentChatId = chats.length > 0 ? chats[0].id : null;
                }
                saveChatsToStorage();
                if (currentChatId) {
                    switchChat(currentChatId);
                } else {
                    createNewChat();
                }
            }
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(titleSpan);
        li.appendChild(actionsDiv);
        chatListUl.appendChild(li);
    });
}

newChatBtn.onclick = createNewChat;

// --- Instruction Modal Logic ---
settingsBtn.onclick = () => {
    if (isSending) return;
    const activeChat = chats.find(c => c.id === currentChatId);
    sysInstInput.value = activeChat.instructions;
    instModal.classList.remove('hidden');
};

closeModalBtn.onclick = () => instModal.classList.add('hidden');

saveInstBtn.onclick = () => {
    const activeChat = chats.find(c => c.id === currentChatId);
    activeChat.instructions = sysInstInput.value.trim();
    saveChatsToStorage();
    instModal.classList.add('hidden');
    alert("Instructions saved for this chat!");
};

// --- API Key Modal Logic ---
apiKeyBtn.onclick = () => {
    if (isSending) return;
    apiKeyInput.value = localStorage.getItem('sai_api_key') || "";
    apiModal.classList.remove('hidden');
};

closeApiBtn.onclick = () => apiModal.classList.add('hidden');

saveApiBtn.onclick = () => {
    const newKey = apiKeyInput.value.trim();
    if (newKey) {
        localStorage.setItem('sai_api_key', newKey);
        API_KEY = newKey;
        alert("API Key browser la safe ah save aagiduchu mi! ✅");
        apiModal.classList.add('hidden');
    } else {
        alert("Sai, Key empty ah iruku mi!");
    }
};

// --- File Upload Logic ---
attachBtn.onclick = () => {
    if (!isSending) fileInput.click();
};

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result.split(',')[1]; 
            currentImageBase64 = base64String;
            currentImageMimeType = file.type;
            imagePreview.src = event.target.result;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
};

removeImageBtn.onclick = () => {
    currentImageBase64 = null;
    currentImageMimeType = null;
    fileInput.value = "";
    imagePreviewContainer.classList.add('hidden');
};

// --- Sending Messages ---
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        sendMessage();
    }
});

async function sendMessage() {
    if (isSending) return;
    
    // API key check panrom, illana alert kuduthu modal open panrom
    if (!API_KEY) {
        alert("Sai, first API key ah settings la add pannu mi! Appo dhan naan pesa mudiyum 😇");
        apiKeyBtn.click();
        return;
    }

    const text = userInput.value.trim();
    if (!text && !currentImageBase64) return;

    const activeChat = chats.find(c => c.id === currentChatId);
    
    isSending = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    sendBtn.textContent = "...";

    const imgDataForUI = currentImageBase64 ? `data:${currentImageMimeType};base64,${currentImageBase64}` : null;
    addMessageUI(text, 'user', imgDataForUI, true);
    
    let partsArray = [];
    if (text) partsArray.push({ text: text });
    if (currentImageBase64) {
        partsArray.push({
            inlineData: {
                mimeType: currentImageMimeType,
                data: currentImageBase64
            }
        });
    }

    activeChat.history.push({ role: "user", parts: partsArray });
    
    if (activeChat.history.length === 1 && text) {
        activeChat.title = text.substring(0, 20) + "...";
    }
    saveChatsToStorage();

    userInput.value = '';
    removeImageBtn.click();

    const requestBody = {
        contents: activeChat.history,
        systemInstruction: {
            parts: [{ text: activeChat.instructions }]
        }
    };

    // API URL dynamic ah generate panrom key vachi
    const CURRENT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY; 

    try {
        const response = await fetch(CURRENT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Response:", data);
            const errorMessage = data.error && data.error.message ? data.error.message : "Unknown error";
            addMessageUI("API Error: " + errorMessage, 'ai');
            activeChat.history.pop(); 
            saveChatsToStorage();
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            addMessageUI(aiText, 'ai', null, true);
            activeChat.history.push({ role: "model", parts: [{ text: aiText }] });
            saveChatsToStorage();
        } else {
            addMessageUI("Oops! Blank reply from API.", 'ai');
        }
    } catch (error) {
        console.error("Fetch Catch Error:", error);
        addMessageUI("Internet or connection error mi.", 'ai');
        activeChat.history.pop();
        saveChatsToStorage();
    } finally {
        isSending = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        sendBtn.textContent = "Send";
        userInput.focus();
    }
}

function addMessageUI(text, sender, imgSrc = null, scrollToBottom = true) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = `message-wrapper wrapper-${sender}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (text) {
        const textElement = document.createElement('p');
        textElement.textContent = text;
        messageDiv.appendChild(textElement);
    }

    if (imgSrc) {
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        messageDiv.appendChild(imgElement);
    }

    wrapperDiv.appendChild(messageDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'msg-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(text);
        copyBtn.textContent = '✅ Copied';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
    };
    actionsDiv.appendChild(copyBtn);

    if (sender === 'user') {
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.textContent = '✏️ Edit';
        editBtn.onclick = () => {
            if (!isSending) {
                userInput.value = text;
                userInput.focus();
            }
        };
        actionsDiv.appendChild(editBtn);
    }

    wrapperDiv.appendChild(actionsDiv);
    chatBox.appendChild(wrapperDiv);
    
    if (scrollToBottom) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

document.getElementById('menu-btn').onclick = () => {
    document.getElementById('sidebar').classList.toggle('open');
};