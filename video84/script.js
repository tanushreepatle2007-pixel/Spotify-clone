console.log('Lets start Javascript');
let currentSong = new Audio();
let songs;
let currFolder;
let play = document.getElementById("play")
let next = document.getElementById("next")
let previous = document.getElementById("previous")

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;

    // Fetch songs.json instead of folder
    let res = await fetch(`${folder}/songs.json`)
    let data = await res.json()

    songs = data.songs

    // Show songs in UI
    let songUL = document.querySelector(".songList ul")
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML += `
   <li>
   <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Tanushree</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`
    }

    // Click event 
    document.querySelectorAll(".songList li").forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info div").innerText.trim()
            playMusic(track)
        })
    })
    return songs
}


const playMusic = (track, pause = false) => {
    currentSong.src = currFolder + "/" + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    console.log("Displaying albums")

    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = ""

    let folders = ["ncs", "Selena", "cs"]  // add all your folders

    for (let folder of folders) {
        try {
            let res = await fetch(`songs/${folder}/info.json`)
            let data = await res.json()

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`
        } catch (err) {
            console.error("Error loading folder:", folder, err)
        }
    }



    // Attach click
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            if (songs.length > 0) playMusic(songs[0])
        })
    })
}

async function main() {
    try {
        await getSongs("songs/Selena")
        playMusic(songs[0], true)
    } catch (err) {
        console.error("Error loading default songs:", err)
    }

    await displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
}

// Listen for timeupdate event
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    if (currentSong.duration) {
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
})

// Add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
})

// Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
})

// Add an event listener to previous
previous.addEventListener("click", () => {
    currentSong.pause()
    console.log("Previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }
})

// Add an event listener to next
next.addEventListener("click", () => {
    currentSong.pause()
    console.log("Next clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
    }
})

// Add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
})

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})

main()
