console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = []; // ✅ Declare songs globally
let currFolder;


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`https://spotify-clone-delta-taupe.vercel.app/${folder}/`); // ✅ Fixed template literal
    let response = await a.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = []// ✅ Fix: Use global `songs` instead of redeclaring it

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = element.getAttribute("href"); // Get the correct attribute

        if (href.endsWith(".mp3")) {
            let songName = decodeURIComponent(href)
                .replace(/\\/g, `/${folder}/`)
                .split(`/${folder}/`)
                .pop(); // ✅ Clean song names properly

            songs.push(songName);
        }
    }



    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ""; // ✅ Clear existing list to avoid duplication
    for (const song of songs) {
        songul.innerHTML += `
        <li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Swarnali</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img class="invert" src="play2.svg" alt="">
            </div>
        </li>
    `;

    }

    // ✅ Attach event listener to song list
    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src =`${currFolder}/` + encodeURIComponent(track); // ✅ Fix encoding issue
    if (!pause) {
        currentSong.play();
        play.src ="pause.svg"; // ✅ Update play button icon
    }
    updateTimer();

    document.querySelector(".songinfo").innerHTML = track; // ✅ Set song name correctly without overwriting



};

const updateTimer = () => {
    currentSong.removeEventListener("timeupdate", updateTimer);

    const timeUpdateHandler = () => {
        let currentTime = formatTime(currentSong.currentTime);
        let duration = currentSong.duration ? formatTime(currentSong.duration) : "00:00";

        const timerElement = document.querySelector("#timer");
        if (timerElement) {
            timerElement.innerText = `${currentTime} / ${duration}`;
        }
    };

    currentSong.addEventListener("timeupdate", timeUpdateHandler);
};

const formatTime = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

async function displayAlbums() {
    let a = await fetch(`https://spotify-clone-delta-taupe.vercel.app/songs/`); // ✅ Fixed template literal
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`https://spotify-clone-delta-taupe.vercel.app/songs/${folder}/info.json`); // ✅ Fixed template literal
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card ">
                        <div  class="play">
                            <img src="play.svg" alt="">
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
` 
        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

              
        if (songs.length > 0) {
            playMusic(songs[0]); // ✅ Start playing the first song automatically
        }
        })

    })




}


async function main() {
    songs = await getSongs("songs/ncs"); // ✅ Now it will assign to global `songs`
    console.log(songs);

    playMusic(songs[0], true);

    //Dispale all the albums on the page
    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src ="pause.svg";
        } else {
            currentSong.pause();
            play.src ="play2.svg";
        }
    });
}

    

// ✅ Fix Seekbar Progress Update
const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

const updateSeekbar = () => {
    if (currentSong.duration) {
        let progress = (currentSong.currentTime / currentSong.duration) * 100;
        seekbar.style.setProperty("--progress", `${progress}%`);
        circle.style.left = `${progress}%`;
    }
};

currentSong.addEventListener("timeupdate", updateSeekbar);

seekbar.addEventListener("click", (e) => {
    let percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    updateSeekbar();
});

// ✅ Hamburger Menu
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

// ✅ Close Menu
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
});

// ✅ Previous Button
document.querySelector("#previous").addEventListener("click", () => {
    console.log("Previous button clicked");
    let index = songs.indexOf(decodeURIComponent(currentSong.src.s/plit("/").slice(-1)[0]));
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    } else {
        playMusic(songs[songs.length - 1]); // ✅ Loop back to last song
    }
});

// ✅ Next Button
next.addEventListener("click", () => {
    console.log("Next clicked");
    let index = songs.indexOf(decodeURIComponent(currentSong.src.s/plit("/").slice(-1)[0]));
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    } else {
        playMusic(songs[0]); // ✅ Loop back to first song
    }
});

// Volume slider and icon references
const volumeSlider = document.getElementById("volumeSlider");
const volumeIcon = document.getElementById("volumeIcon");

// Set initial volume to 50%
currentSong.volume = 0.2;
volumeSlider.value = 100;

volumeSlider.addEventListener("input", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    currentSong.volume = parseInt(e.target.value) / 100;

    if (currentSong.volume > 0) {
        volumeIcon.src =volumeIcon.src.r/eplace("mute.svg", "valume.svg");
    } else {
        volumeIcon.src = volumeIcon.src.r/eplace("valume.svg", "mute.svg");
    }
});

volumeIcon.addEventListener("click", () => {
    if (currentSong.volume > 0) {
        currentSong.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.src = volumeIcon.src.r/eplace("valume.svg", "mute.svg");
    } else {
        currentSong.volume = 0.2;
        volumeSlider.value = 100;
        volumeIcon.src =volumeIcon.src.r/eplace("mute.svg", "valume.svg");
    }
});



main();
