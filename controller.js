var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const itemList = document.getElementById("itemList");

// 表示対象のデータ（リストと同期される）
let items = [
    { title: "hoge1", url: "63X7Ev0-gGE" },
    { title: "hoge2", url: "_QIQk3StRmc" }
];

var player;
function onYouTubeIframeAPIReady() {
    const savedVideoId = localStorage.getItem("videoId") || '_QIQk3StRmc';
    const savedVolume = localStorage.getItem("volume") || 50;
    const savedSize = localStorage.getItem("size") || 50;
    changeWidth(savedSize);

    player = new YT.Player('player', {
        height: '315',
        width: '560',
        videoId: savedVideoId,
        playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0 },
        events: {
            'onReady': function (event) {
                event.target.setVolume(savedVolume);
                document.getElementById("volume").value = savedVolume;
                document.getElementById("videoUrl").value = `https://www.youtube.com/watch?v=${savedVideoId}`;
                document.getElementById("size").value = savedSize;
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

function playVideo() {
    player.playVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function setVolume(value) {
    player.setVolume(value);
    localStorage.setItem("volume", value);
}

function changeWidth(newWidthPercentage) {
    const player = document.getElementById('player');
    player.style.width = newWidthPercentage + '%';
    localStorage.setItem("size", newWidthPercentage);
}

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadNewVideo() {
    const url = document.getElementById("videoUrl").value;
    const videoId = extractVideoId(url);

    loadVideoById(videoId);
}

function loadVideoById(videoId) {
    if (videoId) {
        player.loadVideoById(videoId);
        localStorage.setItem("videoId", videoId);
    } else {
        alert("有効なYouTube URLを入力してください。");
    }
}

function toggleLoopButton() {
    const toggleLoop = document.getElementById('toggleLoop');
    const isOn = toggleLoop.classList.contains('on');
    setLoop(!isOn);
}

var loop = localStorage.getItem("loop") == "true";
function setLoop(value) {
    const toggleLoop = document.getElementById('toggleLoop');

    loop = value;
    localStorage.setItem("loop", value ? "true" : "false");
    if (value) {
        toggleLoop.classList.add('on');
        toggleLoop.textContent = "ループ ✅"
    } else {
        toggleLoop.classList.remove('on');
        toggleLoop.textContent = "ループ ❌"
    }
}
setLoop(loop);

function toggleCtrlButton() {
    const toggleCtrl = document.getElementById('toggleCtrl');
    const isOn = toggleCtrl.classList.contains('on');
    setCtrl(!isOn);
}

var ctrl = localStorage.getItem("ctrl") == "true";
function setCtrl(value) {
    const toggleCtrl = document.getElementById('toggleCtrl');

    ctrl = value;
    localStorage.setItem("ctrl", value ? "true" : "false");
    if (value) {
        toggleCtrl.classList.add('on');
        toggleCtrl.textContent = "タッチ抑制 ✅"
        document.getElementById('player').style.pointerEvents = 'none';
    } else {
        toggleCtrl.classList.remove('on');
        toggleCtrl.textContent = "タッチ抑制 ❌"
        document.getElementById('player').style.pointerEvents = 'auto';
    }
}
setCtrl(ctrl);

let loading = false;

function onPlayerStateChange(event) {
    console.log(event.data);
    if (event.data === -1) {
        loading = true;
    }
    if (loading && event.data === YT.PlayerState.PLAYING) {
        const videoInfo = player.getVideoData();
        const item = items.find(x => x.url == videoInfo.video_id);
        if (item && item.title != videoInfo.title) {
            item.title = videoInfo.title;
            saveItems();     // 順番を保存
            renderItems();   // 表示を再構築
        }
    }
    if (loop && event.data === YT.PlayerState.ENDED) {
        player.seekTo(0); // 動画の最初に戻す
        player.playVideo(); // 再生開始
    }
}

let playingIndex = 0;

function renderItems() {
    itemList.innerHTML = ""; // 一旦クリア
    items.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item.title;

        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.onclick = () => {
            items.splice(index, 1); // データから削除
            renderItems();          // 再描画
            saveItems();            // localStorageへ保存
        };

        const openBtn = document.createElement("button");
        openBtn.textContent = "開く";
        openBtn.onclick = () => {
            playingIndex = index;
            loadVideoById(item.url);
            renderItems();          // 再描画
        };

        li.style.background = playingIndex == index ? "yellow": "#dcdcdc";
        li.appendChild(openBtn);
        li.appendChild(delBtn);
        itemList.appendChild(li);
    });
}

function handleAddTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();
    if (text) {
        addTask(text); // 引数ありの addTask を呼び出し
        input.value = ""; // 入力欄をクリア
    }
}

function addTask(text) {
    if (!text.trim()) return;

    const li = document.createElement("li");
    li.innerHTML = `${text} <button onclick="removeTask(this)">削除</button>`;
    taskList.appendChild(li);
    saveTasks();
}

function saveItems() {
    localStorage.setItem("myItems", JSON.stringify(items));
}

function loadItems() {
    const saved = localStorage.getItem("myItems");
    if (saved) {
        items = JSON.parse(saved);
    }
    renderItems();
}

new Sortable(itemList, {
    animation: 150,
    onEnd: function (evt) {
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;

        if (oldIndex === newIndex) return;

        const movedItem = items.splice(oldIndex, 1)[0]; // 元の位置から削除して
        items.splice(newIndex, 0, movedItem);           // 新しい位置に挿入

        saveItems();     // 順番を保存
        renderItems();   // 表示を再構築
    }
});

window.onload = () => {
    loadItems();
};