document.addEventListener("DOMContentLoaded", function () {
  const alas = document.getElementById("alasGambar"); // Mendapatkan elemen canvas untuk menggambar
  const dimensi = alas.getContext("2d"); // Mendapatkan konteks 2D untuk menggambar di canvas
  const warna = document.getElementById("warna"); // Mendapatkan elemen input untuk memilih warna
  const pola = document.getElementById("pola"); // Mendapatkan elemen select untuk memilih pola gambar
  const kuas = document.getElementById("kuas"); // Mendapatkan elemen input untuk memilih ukuran kuas
  const penghapus = document.getElementById("penghapus"); // Mendapatkan tombol untuk mengaktifkan mode penghapus
  const kembali = document.getElementById("kembali"); // Mendapatkan tombol untuk melakukan operasi undo
  const simpan = document.getElementById("simpan"); // Mendapatkan tombol untuk menyimpan gambar
  const formPembayaran = document.getElementById("formPembayaran"); // Mendapatkan form untuk pembayaran
  const hargaSistemEl = document.getElementById("hargaSistem"); // Mendapatkan elemen untuk menampilkan harga sistem
  const hargaBayarEl = document.getElementById("hargaBayar"); // Mendapatkan elemen input untuk memasukkan jumlah pembayaran
  const submitPembayaran = document.getElementById("submitPembayaran"); // Mendapatkan tombol untuk mengirim pembayaran
  const pesanPembayaran = document.getElementById("pesanPembayaran"); // Mendapatkan elemen untuk menampilkan pesan kesalahan pembayaran
  const popupPesan = document.getElementById("popupPesan"); // Mendapatkan elemen untuk menampilkan pesan popup
  const lanjutkanGambar = document.getElementById("lanjutkanGambar"); // Mendapatkan tombol untuk melanjutkan setelah pembayaran berhasil
  const aplikasiMewarnai = document.getElementById("aplikasiMewarnai"); // Mendapatkan elemen untuk menampilkan aplikasi mewarnai
  const modalPesan = new bootstrap.Modal(document.getElementById("modalPesan")); // Mendapatkan modal untuk menampilkan pesan

  alas.width = 800; // Set lebar canvas
  alas.height = 600; // Set tinggi canvas

  let warnaDipilih = warna.value; // Mengambil nilai warna yang dipilih
  let polaDipilih = pola.value; // Mengambil nilai pola yang dipilih
  let kuasDipilih = kuas.value; // Mengambil nilai ukuran kuas yang dipilih
  let gambar = false; // Menandakan apakah sedang dalam proses menggambar
  let hapus = false; // Menandakan apakah sedang dalam mode penghapus
  let sudahBayar = false; // Menandakan apakah pembayaran sudah berhasil
  let harga = Math.floor(Math.random() * 10 + 1) * 1000; // Menghitung harga secara acak kelipatan 1000

  hargaSistemEl.textContent = `Rp ${harga}`; // Menampilkan harga sistem di halaman

  const gambarPola = {
    // Daftar gambar pola yang tersedia
    pola1: "pola1.png",
    pola2: "pola2.png",
    pola3: "pola3.png",
    pola4: "pola4.png",
    pola5: "pola5.png",
  };

  let undoStack = []; // Stack untuk menyimpan state gambar

  function muatPola(pola) {
    // Fungsi untuk memuat gambar pola yang dipilih
    const img = new Image();
    img.src = gambarPola[pola];
    img.onload = function () {
      dimensi.clearRect(0, 0, alas.width, alas.height);
      dimensi.drawImage(img, 0, 0, alas.width, alas.height);
      saveState();
    };
  }

  function saveState() {
    // Fungsi untuk menyimpan state gambar
    const state = alas.toDataURL();
    if (undoStack.length === 0 || state !== undoStack[undoStack.length - 1]) {
      undoStack.push(state);
      if (undoStack.length > 50) {
        undoStack.shift();
      }
    }
  }

  function restoreState() {
    // Fungsi untuk mengembalikan state gambar sebelumnya
    if (undoStack.length) {
      const state = undoStack.pop();
      const img = new Image();
      img.src = state;
      img.onload = function () {
        dimensi.clearRect(0, 0, alas.width, alas.height);
        dimensi.drawImage(img, 0, 0, alas.width, alas.height);
      };
    }
  }

  muatPola(polaDipilih); // Memuat pola gambar yang dipilih saat halaman dimuat

  pola.addEventListener("change", function () {
    // Event listener untuk perubahan pola gambar
    polaDipilih = this.value;
    muatPola(polaDipilih);
  });

  warna.addEventListener("input", function () {
    // Event listener untuk perubahan warna kuas
    warnaDipilih = this.value;
    hapus = false;
    ubahKursor();
  });

  kuas.addEventListener("input", function () {
    // Event listener untuk perubahan ukuran kuas
    kuasDipilih = this.value;
    ubahKursor();
  });

  penghapus.addEventListener("click", function () {
    // Event listener untuk tombol penghapus
    hapus = !hapus;
    penghapus.textContent = hapus ? "Menggambar" : "Penghapus";
    ubahKursor();
  });

  kembali.addEventListener("click", function () {
    // Event listener untuk tombol undo
    if (undoStack.length > 1) {
      undoStack.pop();
      restoreState();
    }
  });

  simpan.addEventListener("click", function () {
    // Event listener untuk tombol simpan gambar
    if (sudahBayar) {
      $("#modalPesanLabel").text("Simpan Gambar");
      $("#pesanModal").html("Apakah anda yakin ingin menyimpan gambar?");
      $("#modalPesan").modal("show");
      document.getElementById("modalPesan").querySelector(".btn-primary").onclick = function () {
        const link = document.createElement("a");
        link.download = "gambar.png";
        link.href = alas.toDataURL();
        link.click();
        $("#modalPesan").modal("hide");
      };
    } else {
      $("#modalPesanLabel").text("Pesan");
      $("#pesanModal").html("Anda harus membayar terlebih dahulu sebelum menyimpan gambar.");
      $("#modalPesan").modal("show");
    }
  });

  submitPembayaran.addEventListener("click", function () {
    // Event listener untuk tombol submit pembayaran
    const hargaBayar = parseInt(hargaBayarEl.value);
    if (isNaN(hargaBayar)) {
      $("#modalPesanLabel").text("Pesan");
      $("#pesanModal").html("Masukkan jumlah uang yang tertera!");
      $("#modalPesan").modal("show");
      hargaBayarEl.focus();
      return;
    }
    if (hargaBayar < 0) {
      $("#modalPesanLabel").text("Pesan");
      $("#pesanModal").html("Maaf, masukan nominal yang tertera!");
      $("#modalPesan").modal("show");
      hargaBayarEl.focus();
      return;
    }
    if (hargaBayar === harga) {
      popupPesan.textContent = 'Selamat pembayaran berhasil, uang anda pas. Tekan tombol "Lanjut" untuk menggambar';
      sudahBayar = true;
      $("#modalLanjutkan").modal("show");
    } else if (hargaBayar < harga) {
      pesanPembayaran.textContent = `Mohon maaf uang yang Anda bayarkan kurang senilai Rp ${harga - hargaBayar}`;
    } else {
      popupPesan.textContent = `Selamat pembayaran berhasil, kembalian anda Rp ${hargaBayar - harga}. Tekan tombol "Lanjut" untuk menggambar`;
      sudahBayar = true;
      $("#modalLanjutkan").modal("show");
    }
  });

  lanjutkanGambar.addEventListener("click", function () {
    // Event listener untuk tombol lanjutkan menggambar
    $("#modalLanjutkan").modal("hide");
    formPembayaran.style.display = "none";
    aplikasiMewarnai.style.display = "block";
  });

  function ubahKursor() {
    // Fungsi untuk mengubah tampilan kursor saat menggambar
    alas.classList.add("gambar");
    const brushColor = hapus ? "#ffffff" : warnaDipilih;
    alas.style.setProperty("--brush-size", `${kuasDipilih * 2}px`);
    alas.style.setProperty("--brush-color", brushColor);
  }

  alas.addEventListener("mousedown", function (e) {
    // Event listener untuk saat mouse ditekan di canvas
    if (!sudahBayar) {
      $("#modalPesanLabel").text("Pesan");
      $("#pesanModal").html("Anda harus membayar terlebih dahulu sebelum menggambar.");
      $("#modalPesan").modal("show");
      aplikasiMewarnai.style.display = "none";
      formPembayaran.style.display = "block";
      return;
    }
    saveState();
    gambar = true;
    dimensi.beginPath();
    dimensi.moveTo(e.offsetX, e.offsetY);
    alas.classList.add("gambar");
  });

  alas.addEventListener("mousemove", function (e) {
    // Event listener untuk saat mouse bergerak di canvas
    if (gambar) {
      dimensi.strokeStyle = hapus ? "#ffffff" : warnaDipilih;
      dimensi.lineWidth = kuasDipilih;
      dimensi.lineCap = "round";
      dimensi.lineTo(e.offsetX, e.offsetY);
      dimensi.stroke();
    }
  });

  alas.addEventListener("mouseup", function () {
    // Event listener untuk saat mouse dilepas dari canvas
    if (gambar) {
      saveState();
      gambar = false;
    }
    alas.classList.remove("gambar");
  });

  alas.addEventListener("mouseout", function () {
    // Event listener untuk saat mouse keluar dari area canvas
    if (gambar) {
      saveState();
      gambar = false;
    }
    alas.classList.remove("gambar");
  });

  // Mendapatkan elemen kontrol musik
  const tombolPutar = document.getElementById("tombolPutar");
  const pilihMusik = document.getElementById("pilihMusik");

  // Mendefinisikan elemen audio untuk memutar musik
  const audioPlayer = new Audio();
  let musikDiputar = ""; // Menyimpan nama file musik yang sedang diputar

  // Fungsi untuk memainkan musik
  function playMusic(musikUrl) {
    if (musikUrl !== musikDiputar) {
      audioPlayer.src = musikUrl;
      audioPlayer.play();
      musikDiputar = musikUrl;
    } else {
      audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
    }
  }

  // Event listener untuk tombol putar/pause musik
  tombolPutar.addEventListener("click", function () {
    const musikDipilih = pilihMusik.value;
    playMusic(musikDipilih);
    tombolPutar.textContent = audioPlayer.paused ? "Putar" : "Pause";
  });

  // Event listener untuk perubahan pilihan musik
  pilihMusik.addEventListener("change", function () {
    const musikDipilih = pilihMusik.value;
    playMusic(musikDipilih);
    tombolPutar.textContent = "Pause";
  });

  // Memilih musik secara acak saat aplikasi dimuat
  const musics = ["aespa.mp3", "illit.mp3", "babymonster.mp3"];
  const randomIndex = Math.floor(Math.random() * musics.length);
  const randomMusik = musics[randomIndex];
  pilihMusik.value = randomMusik;
  playMusic(randomMusik);
  tombolPutar.textContent = "Pause";
});
