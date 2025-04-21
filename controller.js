var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const itemList = document.getElementById("itemList");

initialized = false;

const LoopType = {
    NONE: "none",
    ONCE: "once",
    ALL: "all"
};

// 表示対象のデータ（リストと同期される）
let items = [
    { title: "hoge1", url: "63X7Ev0-gGE" },
    { title: "hoge2", url: "_QIQk3StRmc" }
];

var player;
function onYouTubeIframeAPIReady() {
    initialize();
    const savedVideoId = items[playingIndex].url;
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

function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
        const input = document.getElementById("videoUrl");
        input.value = text;
    }).catch(err => {
        alert("クリップボードの読み取りに失敗しました");
        console.error(err);
    });
}

function addNewVideo() {
    const url = document.getElementById("videoUrl").value;
    const videoId = extractVideoId(url);
    items.push({title: videoId.toString(), url: videoId});
    saveItems();     // 順番を保存
    renderItems();   // 表示を再構築
}

function loadVideoById(index) {
    const target = items[index];
    if (target) {
        player.loadVideoById(target.url);
        localStorage.setItem("videoId", target.url);
    } else {
        alert("有効なYouTube URLを入力してください。");
    }
}

var loop = localStorage.getItem("loop");

function toggleLoopButton() {
    if (loop == LoopType.ALL) {
        setLoop(LoopType.ONCE);
    } else if (loop == LoopType.ONCE) {
        setLoop(LoopType.NONE);
    } else {
        setLoop(LoopType.ALL);
    }
}

function setLoop(value) {
    const toggleLoop = document.getElementById('toggleLoop');
    if (value == LoopType.ALL) {
        loop = LoopType.ALL;
        toggleLoop.textContent = "ループ 🔁";
    } else if (value == LoopType.ONCE) {
        loop = LoopType.ONCE;
        toggleLoop.textContent = "ループ 🔂";
    } else {
        loop = LoopType.NONE;
        toggleLoop.textContent = "ループ ❌";
    }
    localStorage.setItem("loop", loop);
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
    if (event.data === YT.PlayerState.ENDED) {
        if (loop == LoopType.ONCE) {
            player.seekTo(0); // 動画の最初に戻す
            player.playVideo(); // 再生開始
        } else {
            playingIndex++;
            const isFinish = items.length <= playingIndex;
            if (isFinish) {
                if (loop == LoopType.ALL) {
                    playingIndex = 0;
                } else {
                    return;
                }
            }
            loadVideoById(playingIndex);
            renderItems();
        }
    }
}

let playingIndex = 0;

function renderItems() {
    itemList.innerHTML = ""; // 一旦クリア
    items.forEach((item, index) => {
        const li = document.createElement("li");

        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle";
        dragHandle.textContent = "☰";

        const title = document.createElement("span");
        title.textContent = item.title;

        const nowPlaying = playingIndex == index;

        const delBtn = document.createElement("button");
        delBtn.classList.add('fancy-button-small');
        delBtn.classList.add('btn-red');
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => {
            if (playingIndex == index) {
                alert("再生中の動画は削除できません。")
            } else {
                items.splice(index, 1); // データから削除
                renderItems();          // 再描画
                saveItems();            // localStorageへ保存
            }
        };

        const openBtn = document.createElement("button");
        openBtn.classList.add('fancy-button-small');
        openBtn.classList.add('btn-green');
        openBtn.textContent = "▶";
        openBtn.onclick = () => {
            playingIndex = index;
            loadVideoById(index);
            renderItems();
        };

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";
        buttonGroup.appendChild(openBtn);
        buttonGroup.appendChild(delBtn);

        li.style.background = nowPlaying ? "yellow": "#dcdcdc";
        li.appendChild(dragHandle);
        li.appendChild(title);
        li.appendChild(buttonGroup);
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

function initialize() {
    if (initialized) { return; }
    const saved = localStorage.getItem("myItems");
    if (saved) {
        items = JSON.parse(saved);
    }
}

new Sortable(itemList, {
    animation: 150,
    handle: ".drag-handle", // ← これが重要！
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
    initialize();
    renderItems();
};