
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const playToggleBtn = $('.btn-toggle-play')
var audio = $('#audio')
const cdThum = $('.cd-thumb')
const playingSongName = $('.playing-song-name')
const playingSongSinger = $('.playing-song-singer')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const addSongBtn = $('.btn-add-song')


//rythm
const neon = (elem, value, options = {}) => {
  const from = options.from || [0, 0, 0]
  const to = options.to || [255, 255, 255]
  const scaleR = (to[0] - from[0]) * value
  const scaleG = (to[1] - from[1]) * value
  const scaleB = (to[2] - from[2]) * value
  elem.style.boxShadow = `0 0 50vh 30px rgb(${Math.floor(
    to[0] - scaleR
  )}, ${Math.floor(to[1] - scaleG)}, ${Math.floor(to[2] - scaleB)})`
}


var rythm = new Rythm()
rythm.dancer.dances.neon = neon
rythm.addRythm('neon3', 'neon', 0, 10, {
  from: [22, 167, 230],
  to: [197, 97, 84]
})
rythm.addRythm('borderColor3', 'color', 0, 10, {
  from: [22, 167, 230],
  to: [197, 97, 84]
})

const app = {

  songs: undefined,
  randSong: false,
  repeatSong: false,
  renderListSongs: async function () {

    this.songs = await fetch(domain + 'GetListSong').then(rs => rs.json());
    let playList = $(".playlist")
    playList.innerHTML = ''
    this.songs.forEach((e, i) => {
      playList.innerHTML += `
      <div class="song" data-set="${i}" >
      <div class="thumb" style="background-image:url('${e.image_s}')">
      </div>
      <div class="body" src="">
        <h3 class="title">${e.name}</h3>
        <p class="singer">${e.singer}</p>
      </div>
      <div class="btn-option" data-set="${i}">
        <i class="fas fa-ellipsis-h"></i>
        <div class="options">
          <div class="option option--love" data-set="${i}">Yêu thích</div>
          <div class="option option--delete" data-set="${i}">Xóa</div>
        </div>
      </div>
    </div >
      `
    })
    return;
  },
  loadSongToPlayer: function (i) {

    //load songs to player by index
    let playing = !audio.paused || false  //nếu trc đó đang phát nhạc thì cho nhạc phát luôn sau khi chuẩn bị
    rythm.stop();
    let song = this.songs[i];
    if (song) {
      //hủy trạng thái active của song hiện tại
      let lastActiveSong = $('.song.active')
      if (lastActiveSong) {
        lastActiveSong.classList.remove('active')
      }
      //load song mới
      rythm.setMusic(song.url)
      audio = rythm.player.audio
      //run progress
      audio.ontimeupdate = () => {
        if (audio.currentTime && !audio.paused) {  //!audio.paused là 1 phần trong fix bug khi tua
          progress.value = audio.currentTime * 100 / audio.duration
        }
      }
      audio.dataSet = i;
      cdThum.setAttribute('style', `background-image: url("${song.image}")`)
      progress.value = 0;
      playingSongName.innerText = song.name;
      playingSongSinger.innerHTML = `<span>Ca sĩ: </span> ${song.singer}`;
      //đặt trạng thái active cho song mới
      let currentSong = $$('.song')[i];
      currentSong.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      currentSong.classList.add('active')
      if (playing)
        rythm.start();
    }
    else {
      alert('không tồn tại bài hát')
    }

  }
  , randSongIndex() {
    let rs = 0
    do {
      rs = (Math.floor(Math.random() * 100)) % this.songs.length
    }
    while (rs == audio.dataSet)
    return rs
  },
  initEvent: function () {
    //init event cho các nút điều khiển

    const cdAnimate = cdThum.animate([{ transform: 'rotate(360deg)' }], { duration: 10000, iterations: Infinity })
    cdAnimate.pause();
    //dừng, phát nhạc bằng shortcut "space"
    document.onkeydown = (e) => {
      if (e.key == " ") {
        playToggleBtn.click()
      }
    }
    // click btn play
    playToggleBtn.onclick = () => {
      playToggleBtn.classList.toggle('playing')
      if (audio.paused) {
        rythm.start();
        cdAnimate.play();
      } else {
        rythm.stop();
        cdAnimate.pause();
      }

    }
    // click btn nextSong
    nextBtn.onclick = () => {
      let nextSongIndex = this.randSong ? this.randSongIndex() : (audio.dataSet + 1) % this.songs.length
      this.loadSongToPlayer(nextSongIndex)
    }
    // click btn prevSong
    prevBtn.onclick = () => {
      let prevSongIndex = this.randSong ? this.randSongIndex() : ((audio.dataSet - 1) >= 0 ? this.songs.length - 1 : 0) % this.songs.length
      this.loadSongToPlayer(prevSongIndex)
    }

    //click btn repeat
    repeatBtn.onclick = () => {
      repeatBtn.classList.toggle('active')
      this.repeatSong = !this.repeatSong;
    }
    //click random
    randBtn.onclick = () => {
      randBtn.classList.toggle('active')
      this.randSong = !this.randSong;
    }

    //sau khi tua thanh progress
    //chia ra thành 2 event để fix bug khi tua trên thanh progess
    let isMouseDown = false;
    progress.onmousedown = () => {
      if (!audio.paused) {
        isMouseDown = true;
        rythm.stop();
        cdAnimate.pause();
      }
    }
    progress.onmouseup = () => {
      audio.currentTime = progress.value * audio.duration / 100
      if (isMouseDown) {
        rythm.start();
        cdAnimate.play();
        isMouseDown = false;
      }
    }

    // //run progress
    // audio.ontimeupdate = () => {

    //   if (audio.currentTime && !audio.paused) {  //!audio.paused là 1 phần trong fix bug khi tua
    //     progress.value = audio.currentTime * 100 / audio.duration
    //   }
    // }
    //sau khi hết bài hát
    audio.onended = () => {
      if (this.repeatSong) {
        rythm.start()
      }
      else {
        nextBtn.click()
        rythm.start()
      }
    }

    //zoom in/out CD khi scroll
    const cdBox = $('.cd')
    const cdBoxWidth = cdBox.offsetWidth;
    const songBox = $('.playlist')
    songBox.onscroll = () => {
      const newCdWidth = (cdBoxWidth - songBox.scrollTop) > 0 ? (cdBoxWidth - songBox.scrollTop / 2) : 0;
      if (newCdWidth >= 130) {
        cdBox.style.width = newCdWidth + 'px';
        // cdBox.style.opacity = newCdWidth * 2 / cdBoxWidth;
        cdBox.style.transform = `translateY(-${(32 - newCdWidth * 32 / cdBoxWidth)}px)`
      }
    }

    //click vào các bài hát trong list
    let songRendered = $$('.song')
    const btns_option = $$('.btn-option')
    //click vào option trong các bài hát
    btns_option.forEach((b) => {
      b.onclick = function () {
        let currentActive = $('.btn-option.active')
        if (currentActive) {
          if (currentActive.dataset.set != this.dataset.set) {
            currentActive.classList.remove('active')
          }
        }
        this.classList.toggle('active')
      }
    })
    //click vào btn-delete
    const btns_delete = $$('.option--delete')
    btns_delete.forEach((b) => {
      b.onclick = () => {
        let deleteIndex = b.dataset.set;
        console.log(this.songs[deleteIndex].name);
        this.songs.splice(deleteIndex, 1);
        this.start();
      }
    })
    //khi click vafo btn yêu thích
    const btns_love = $$('.option--love')
    btns_love.forEach((b) => {
      b.onclick = () => {
        alert('Yeu thích ' + this.songs[b.dataset.set].name)
      }
    })
    //click để chuyển nhạc
    songRendered.forEach((s, i) => {
      s.onclick = (e) => {
        app.loadSongToPlayer(i);
      };
    })


    function youtube_parser(url) {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      var match = url.match(regExp);
      return (match && match[7].length == 11) ? match[7] : false;
    }

    addSongBtn.onclick = async () => {
      let input = $('.input-youtube-url');
      let idVid = youtube_parser(input.value);
      if (!idVid)
        return;
      fetch(`${domain}/download?id=${idVid}`)
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
  },
  start: async function () {
    await this.renderListSongs();
    //mặc định nghe bài đầu tiên trong list
    this.loadSongToPlayer(0)
    this.initEvent();
  }
}



app.start();
