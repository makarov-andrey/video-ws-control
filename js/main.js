window.blockings = {
    play: false,
    pause: false,
    seeked: false
};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('video-input').addEventListener('change', function () {
        document.getElementById('video-source').src = URL.createObjectURL(this.files[0]);
        document.getElementById('video').load();
    });

    openSocket();

    let video = document.getElementById('video');
    video.onplay = () => !window.blockings.play && sendMessage('play');
    video.onpause = () => !window.blockings.pause && sendMessage('pause');
    video.onseeked = () => !window.blockings.seeked && sendMessage('seek');
});

function openSocket () {
    window.socket = new WebSocket("ws://localhost:8080/control");

    window.socket.addEventListener('open', function() {
        console.log("Соединение установлено.");
    });

    window.socket.addEventListener('close', function(event) {
        console.log('Соединение оборвано. Код: ' + event.code + ' причина: ' + event.reason);
        setTimeout(openSocket, 5000);
    });

    window.socket.addEventListener('message', function(event) {
        console.log("Message: " + event.data);

        let message = JSON.parse(event.data),
            video = document.getElementById('video'),
            blockEventOnce = (eventName) => {
                window.blockings[eventName] = true;
                let handler = () => {
                    window.blockings[eventName] = false;
                    video.removeEventListener(eventName, handler);
                };
                video.addEventListener(eventName, handler);
            };

        if (message.time !== undefined) {
            blockEventOnce('seeked');
            video.currentTime = message.time;
        }

        switch (message.command) {
            case 'play':
                blockEventOnce('play');
                video.play();
                break;
            case 'pause':
                blockEventOnce('pause');
                video.pause();
                break;
        }
    });
}

function sendMessage (command) {
    console.log('sended ' + command);
    window.socket.send(JSON.stringify({
        command: command,
        time: document.getElementById('video').currentTime
    }));
}