// =========================================================================
//  STEP 1: 配置與變數
// =========================================================================

// !!! 非常重要：請將此處的 URL 替換成您自己的 Google Apps Script Web App URL !!!
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwspP3Q4FjXLLv9E8jP-kksiFDtFOWiWJMhAAYAdKHeDm7HCwS7cMngLqfKPKDNGDqKSA/exec';

// DOM 元素
const topicGrid = document.getElementById('topic-grid');
const modalView = document.getElementById('modal-view');
const closeModalButton = document.getElementById('close-modal');
const loginModal = document.getElementById('login-modal');
const loginInput = document.getElementById('login-input');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');
const userStatusBar = document.getElementById('user-status-bar');
const userDisplay = document.getElementById('user-display');
const logoutButton = document.getElementById('logout-button');
const markCompletedButton = document.getElementById('mark-completed-button');

const modal = {
    svgContainer: document.getElementById('modal-svg-container'),
    title: document.getElementById('modal-title'),
    tagline: document.getElementById('modal-tagline'),
    description: document.getElementById('modal-description')
};

// 應用程式狀態
let currentUser = null;
let allTopics = [];
let completedTopics = [];
let currentOpenTopicID = null;

// =========================================================================
//  STEP 2: 動態 SVG 動畫庫 (與之前相同)
// =========================================================================
const scienceVisuals = {
    'T01': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><path d="M 50 100 H 350" stroke="#00ffff" stroke-dasharray="5 5" opacity="0.5"/><polygon points="-15,-10 15,0 -15,10" fill="#ff4757"><animateMotion dur="4s" repeatCount="indefinite" path="M 50 100 H 350" /></polygon><circle r="15" fill="#487eb0"><animateMotion dur="4s" repeatCount="indefinite" path="M 50 100 H 350" /></circle></svg>`,
    'T02': `<svg viewBox="0 0 300 300"><rect width="300" height="300" fill="#000"/><rect y="280" width="300" height="20" fill="#7f8fa6" /><circle cx="150" cy="80" r="15" fill="#e84118"><animate attributeName="cy" dur="1.5s" repeatCount="indefinite" values="80 ; 265" keyTimes="0 ; 1" calcMode="spline" keySplines="0.5 0 1 1" /></circle></svg>`,
    'T03': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><path d="M50 150 L350 150" stroke="#7f8fa6" stroke-width="5"/><polygon points="200,150 180,110 220,110" fill="#487eb0"/><g><rect x="100" y="50" width="50" height="50" fill="#e84118"/><animateTransform attributeName="transform" type="rotate" dur="4s" repeatCount="indefinite" values="0 200 150; 20 200 150; -20 200 150; 0 200 150" keyTimes="0; 0.25; 0.75; 1"/></g></svg>`,
    'T04': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><rect id="cart" y="120" width="100" height="40" fill="#487eb0"><animate attributeName="x" dur="5s" repeatCount="indefinite" values="20; 280; 280" keyTimes="0; 0.8; 1"/></rect><rect id="box" y="80" width="30" height="40" fill="#e84118"><animate attributeName="x" dur="5s" repeatCount="indefinite" values="55; 315; 315" keyTimes="0; 0.8; 1"/></rect></svg>`,
    'T05': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><rect x="150" y="80" width="40" height="40" fill="#00a8ff"><animate attributeName="x" dur="3s" repeatCount="indefinite" values="150; 40; 300; 150" keyTimes="0; 0.3; 0.7; 1" /></rect><path stroke="#f5f6fa" stroke-width="4" fill="none"><animate attributeName="d" dur="3s" repeatCount="indefinite" values="M 0 100 L 150 100; M 0 100 L 40 100; M 0 100 L 300 100; M 0 100 L 150 100" keyTimes="0; 0.3; 0.7; 1" /></path></svg>`,
    'T06': `<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#000"/><g transform="translate(200, 150)"><path d="M -150 0 A 150 150 0 0 1 150 0" stroke="#00ffff" stroke-width="2" fill="none" opacity="0.5"/><circle r="15" fill="#ff4757"><animateMotion dur="4s" repeatCount="indefinite" path="M -150 0 A 150 150 0 0 1 150 0 A 150 150 0 0 1 -150 0" /></circle></g></svg>`,
    'T07': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><rect y="150" width="400" height="50" fill="#7f8fa6" /><rect x="20" y="110" width="40" height="40" fill="#e84118"><animate attributeName="x" dur="4s" repeatCount="indefinite" values="20; 340" calcMode="spline" keySplines="0.1 0.8 0.2 1"/></rect></svg>`,
    'T08': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><polygon points="200,150 180,180 220,180" fill="#7f8fa6"/><g><path d="M50,110 L350,150" stroke="#00a8ff" stroke-width="5"/><animateTransform attributeName="transform" type="rotate" dur="4s" repeatCount="indefinite" values="5 200 165; -5 200 165; 5 200 165" /></g><rect x="30" y="77" width="40" height="40" fill="#e84118"><animateTransform attributeName="transform" type="rotate" dur="4s" repeatCount="indefinite" values="5 200 165; -5 200 165; 5 200 165" /></rect><rect x="330" y="140" width="20" height="20" fill="#f5f6fa"><animateTransform attributeName="transform" type="rotate" dur="4s" repeatCount="indefinite" values="5 200 165; -5 200 165; 5 200 165" /></rect></svg>`,
    'T09': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><path d="M0 80 H400" stroke="#fff" stroke-dasharray="5 5"/><path d="M0 140 H400" stroke="#fff" stroke-dasharray="5 5"/><circle r="10" cy="80" fill="#ff4757"><animate attributeName="cx" dur="3s" repeatCount="indefinite" values="20; 380"/></circle><circle r="10" cy="140" fill="#00a8ff"><animate attributeName="cx" dur="5s" repeatCount="indefinite" values="20; 380"/></circle></svg>`,
    'T10': `<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#000"/><g transform="translate(50, 0)"><polygon points="100,20 20,180 180,180" fill="none" stroke="#00ff00" stroke-width="4"><animate attributeName="stroke" dur="2s" repeatCount="indefinite" values="#00ff00; #00ffff; #00ff00"/></polygon></g><g transform="translate(250, 0)"><rect x="20" y="20" width="160" height="160" fill="none" stroke="#ff4757" stroke-width="4"><animateTransform attributeName="transform" type="skewX" dur="3s" repeatCount="indefinite" values="0; 20; -20; 0" keyTimes="0; 0.25; 0.75; 1"/></rect></g></svg>`,
};

// =========================================================================
//  STEP 3: 應用程式邏輯 (已升級)
// =========================================================================

// 檢查登入狀態
function checkLoginState() {
    currentUser = localStorage.getItem('science-app-user');
    if (currentUser) {
        loginModal.classList.remove('active');
        userDisplay.textContent = `使用者: ${currentUser}`;
        userStatusBar.style.display = 'flex';
        fetchDataForUser(currentUser);
    } else {
        loginModal.classList.add('active');
        userStatusBar.style.display = 'none';
    }
}

// 處理登入
function handleLogin() {
    const userID = loginInput.value.trim();
    if (userID) {
        // 簡單的格式驗證
        if (!/^\d{3}-\d{2}$/.test(userID)) {
             loginError.textContent = '格式錯誤！請輸入如 701-01 的格式。';
             return;
        }
        loginError.textContent = '';
        localStorage.setItem('science-app-user', userID);
        checkLoginState();
    } else {
        loginError.textContent = '使用者ID不可為空！';
    }
}

// 處理登出
function handleLogout() {
    localStorage.removeItem('science-app-user');
    currentUser = null;
    allTopics = [];
    completedTopics = [];
    topicGrid.innerHTML = '<div class="loader"></div>';
    checkLoginState();
}

// 為特定使用者獲取數據
function fetchDataForUser(userID) {
    topicGrid.innerHTML = '<div class="loader"></div>';
    fetch(`${WEB_APP_URL}?user=${userID}`)
        .then(res => res.json())
        .then(data => {
            allTopics = data.topics;
            completedTopics = data.completed || [];
            renderTopicGrid();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            topicGrid.innerHTML = '<p style="color:red; font-size:1.2rem;">無法加載宇宙數據庫...<br>請檢查網絡連線或確認 script.js 中的 WEB_APP_URL 是否正確。</p>';
        });
}

// 渲染主題網格
function renderTopicGrid() {
    topicGrid.innerHTML = '';
    allTopics.forEach(topic => {
        const button = document.createElement('button');
        button.className = 'topic-button';
        button.textContent = topic.TopicName;
        // 檢查此主題是否已完成
        if (completedTopics.includes(topic.TopicID)) {
            button.classList.add('completed');
        }
        button.addEventListener('click', () => openModal(topic));
        topicGrid.appendChild(button);
    });
}

// 打開彈出視窗
function openModal(topicData) {
    currentOpenTopicID = topicData.TopicID;
    modal.title.textContent = topicData.TopicName;
    modal.tagline.textContent = topicData.TopicTagline;
    let formattedContent = topicData.LearningContent
        .replace(/\n/g, '<br>') // 將純文本換行符轉為 <br>
        .replace(/---/g, '<hr>')
        .replace(/\[\/\/ (.*?) \/\/\]/g, '<i>[$1]</i>');
    modal.description.innerHTML = formattedContent;
    modal.svgContainer.innerHTML = scienceVisuals[topicData.TopicID] || '<p>動畫加載失敗...</p>';
    
    // 更新「標記完成」按鈕的狀態
    if (completedTopics.includes(currentOpenTopicID)) {
        markCompletedButton.textContent = '✓ 已學習';
        markCompletedButton.disabled = true;
    } else {
        markCompletedButton.textContent = '標記為已學習';
        markCompletedButton.disabled = false;
    }

    modalView.classList.add('active');
    modalView.scrollTop = 0;
}

// 標記為已完成
function markAsCompleted() {
    if (!currentUser || !currentOpenTopicID) return;

    markCompletedButton.textContent = '記錄中...';
    markCompletedButton.disabled = true;

    fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ 
            userID: currentUser, 
            topicID: currentOpenTopicID 
        })
    })
    .then(res => res.json())
    .then(result => {
        if (result.status === 'success') {
            // 在前端立即更新狀態，無需重新加載
            completedTopics.push(currentOpenTopicID);
            renderTopicGrid(); // 重新渲染網格以顯示更新
            markCompletedButton.textContent = '✓ 已學習';
        } else {
            // 處理錯誤
            markCompletedButton.textContent = '記錄失敗，請重試';
            markCompletedButton.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error saving progress:', error);
        markCompletedButton.textContent = '記錄失敗，請重試';
        markCompletedButton.disabled = false;
    });
}


// =========================================================================
//  STEP 4: 事件監聽
// =========================================================================
document.addEventListener('DOMContentLoaded', checkLoginState);
loginButton.addEventListener('click', handleLogin);
loginInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});
logoutButton.addEventListener('click', handleLogout);
closeModalButton.addEventListener('click', () => modalView.classList.remove('active'));
markCompletedButton.addEventListener('click', markAsCompleted);

modalView.addEventListener('click', (event) => {
    if (event.target === modalView) {
        modalView.classList.remove('active');
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalView.classList.contains('active')) {
        modalView.classList.remove('active');
    }
});