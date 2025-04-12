var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
    const tmp = player.preloadVideoById("63X7Ev0-gGE");
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

function onPlayerStateChange(event) {
    if (loop && event.data === YT.PlayerState.ENDED) {
        player.seekTo(0); // 動画の最初に戻す
        player.playVideo(); // 再生開始
    }
}