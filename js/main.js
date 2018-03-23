window.blockings = {
    play: false,
    pause: false,
    seeked: false
};

const CHANNEL_NAME = 'private-video-control';
const EVENT_NAME = 'client-message';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('video-input').addEventListener('change', function () {
        document.getElementById('video-source').src = URL.createObjectURL(this.files[0]);
        document.getElementById('video').load();
    });

    window.pusher = new Pusher('7bf6c5f0a13626965bb0', {
        authTransport: 'jsonp',
        authEndpoint: '/pusher-auth.php',
        cluster: 'eu',
        encrypted: true
    });

    window.channel = pusher.subscribe(CHANNEL_NAME);
    window.channel.bind(EVENT_NAME, function(message) {
        console.log("Received: ", message);

        let video = document.getElementById('video'),
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

    function sendMessage (command) {
        let message = {
            command: command,
            time: document.getElementById('video').currentTime
        };
        console.log('Sended: ', message);
        window.channel.trigger(EVENT_NAME, message);
    }

    let video = document.getElementById('video');
    video.onplay = () => !window.blockings.play && sendMessage('play');
    video.onpause = () => !window.blockings.pause && sendMessage('pause');
    video.onseeked = () => !window.blockings.seeked && sendMessage('seek');
});