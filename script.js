let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop());
        }
    }

    // Display songs in playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img src="images/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Unknown</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="images/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listener to each song item
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, i) => {
        e.addEventListener("click", () => {
            playMusic(songs[i]);
        });
    });
}

function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) currentSong.play();
    play.src = "images/pause.svg";

    let songTitle = track.replaceAll("%20", " ");
    document.querySelector(".songinfo").innerText = songTitle;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch("songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    let folders = Array.from(anchors).filter(e => e.href.endsWith("/")).map(e => e.href.split("/").slice(-2)[0]);

    for (let folder of folders) {
        let info = await fetch(`songs/${folder}/info.json`);
        let json = await info.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <img src="images/play.svg" alt="">
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${json.title}</h2>
                <p>${json.description}</p>
            </div>`;
    }

    // Add event listener to cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            let folder = e.dataset.folder;
            await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main logic
async function main() {
    await getSongs("songs/ncs");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.currentTime = percent * currentSong.duration;
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Previous and Next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Mute/Unmute
    volumeIcon.addEventListener("click", () => {
        if (volumeIcon.src.includes("volume.svg")) {
            volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
        }
    });

    // Display albums
    await displayAlbums();
}

main();

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
