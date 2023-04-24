// Edge Detection class
class EdgeDetection {
  constructor(canvas) {
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')

    this.tmpCanvas = document.createElement('canvas')
    this.tmpContext = this.tmpCanvas.getContext('2d')

    this.magnitudes = []
  }


  // Untuk Meng-Load Image berdasarkan Source File
  loadImage(src) {
    this.src = src
    this.image = new Image()
    this.image.src = src
    this.image.onload = this.drawImage.bind(this)
    this.image.crossOrigin = 'anonymous';
  }


  // Untuk Menentukan Ukuran Pixel Gambar
  drawImage() {
    const width = this.image.width
    const height = this.image.height

    this.canvas.width = width
    this.canvas.height = height

    this.context.drawImage(this.image, 0, 0)
  }


  // Membuat Inisialisasi Matriks
  generateMatrix(width, height, initialValue) {
    const matrix = []

    for (let i = 0; i < height; i++) {
      matrix.push([])

      for (let j = 0; j < width; j++) {
        matrix[i].push(initialValue)
      }
    }

    return matrix
  }


  // Untuk Menghitung Hasil Perkalian Matriks Asli Dengan Matriks Operator
  getNeighorMagnitudes(x, y, size) {
    const neighbors = this.generateMatrix(size, size, 0)

    const halfSize = Math.floor(size / 2)

    //alert("Half : " + halfSize)
    //console.log(halfSize)

    for (let j = 0; j < size; j++) {
      // 
      for (let i = 0; i < size; i++) {
        const trnsX = x - halfSize + i
        const trnsY = y - halfSize + j

        // Menentukan Nilai Matriks Berdasarkan Baris dan Kolom
        const pixelOffset = this.toPixelOffset(trnsX, trnsY)

        // Mengecek Apakah Baris Kolom nya Offset atau Tidak
        if (this.magnitudes[pixelOffset]) {
          neighbors[j][i] = this.magnitudes[pixelOffset]
        } else {
          neighbors[j][i] = 0
        }
      }
    }
    return neighbors
  }

  // Untuk Menentukan Posisi Array (Dalam Matriks)
  toPixelOffset(x, y) {
    return (y * this.canvas.width + x)
  }


  // Menentukan Matriks yang akan dikalikan dengan Matriks Operator
  eachPixel(neighborSize, callback) { // (x, y, current, neighbors)
    const width = this.canvas.width,
      height = this.canvas.height

    // Perulangan Baris (y = baris)
    for (let y = 0; y < height; y++) {
      // Perulangan Kolom (x = kolom)
      for (let x = 0; x < width; x++) {
        // Nilai Matriks yang asli
        const current = this.magnitudes[this.toPixelOffset(x, y)]

        // Nilai Matriks 
        const neighbors = this.getNeighorMagnitudes(x, y, neighborSize)

        // Mengembalikan Nilai
        callback(x, y, current, neighbors)
      }
    }
  }


  // Mengubah Gambar Kedalam Format GrayScale
  greyscale() {
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
      data = imageData.data

    this.magnitudes = []
    for (let i = 0; i < data.length; i += 4) { // r,g,b,a
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]

      const derajat_keabuan = Math.round(0.298 * r + 0.586 * g + 0.114 * b)

      data[i] = derajat_keabuan
      data[i + 1] = derajat_keabuan
      data[i + 2] = derajat_keabuan

      this.magnitudes.push(derajat_keabuan)
    }

    // ovewrite old imageData
    this.context.putImageData(imageData, 0, 0)
  }


  // Mereset Image
  resetImage() {
    this.context.drawImage(this.image, 0, 0)
    this.magnitudes = []
  }

  // Membuat Data Image Baru Berdasarkan Lebar dan Tinggi Canvas
  createImageData() {
    return this.tmpContext.createImageData(this.canvas.width, this.canvas.height)
  }

  // Menghitung Operator Matriks Dengan Matriks
  operator(kernelX, kernelY) {
    // Menyalin data Magnitudes (Matriks Image Uji)
    const magnitudes = this.magnitudes.slice(0)

    // Menimpa Array Magnitudes dengan 0 (Agar berwarna hitam)
    magnitudes.fill(0)

    // Ukuran Operator
    const size = kernelX.length

    // Melakukan Proses jika ada Callback
    this.eachPixel(size, (x, y, current, neighbors) => {
      let ghs = 0
      let gvs = 0
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          ghs += kernelX[i][j] * neighbors[i][j]
          gvs += kernelY[i][j] * neighbors[i][j]
        }
      }

      // Nilai Matriks Yang Baru
      magnitudes[this.toPixelOffset(x, y)] = Math.sqrt(ghs * ghs + gvs * gvs)
    })

    this.magnitudes = magnitudes
  }

  operator1(kernelX) {
    // Menyalin data Magnitudes (Matriks Image Uji)
    const magnitudes = this.magnitudes.slice(0)

    // Menimpa Array Magnitudes dengan 0 (Agar berwarna hitam)
    magnitudes.fill(0)

    // Ukuran Operator
    const size = kernelX.length

    // Melakukan Proses jika ada Callback
    this.eachPixel(size, (x, y, current, neighbors) => {
      let ghs = 0
      let gvs = 0
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          ghs += kernelX[i][j] * neighbors[i][j]
          // gvs += kernelY[i][j]*neighbors[i][j]
        }
      }

      // Nilai Matriks Yang Baru
      magnitudes[this.toPixelOffset(x, y)] = Math.sqrt(ghs * ghs)
    })

    this.magnitudes = magnitudes
  }

  drawOnCanvas() {
    const finalImage = this.createImageData()
    for (let i = 0; i < this.magnitudes.length; i++) {
      const n = i * 4,
        magnitude = this.magnitudes[i]
      finalImage.data[n] = magnitude
      finalImage.data[n + 1] = magnitude
      finalImage.data[n + 2] = magnitude
      finalImage.data[n + 3] = 255; // opaque alpha
    }
    this.context.putImageData(finalImage, 0, 0)

    return "sa"
  }

  sobel() {
    return this.operator(
      [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ],

      [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ]
    )
  }

  roberts() {
    return this.operator(
      [
        [1, 0],
        [0, -1]
      ],
      [
        [0, 1],
        [-1, 0]
      ]
    )
  }

  prewitt() {
    return this.operator(
      [
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1]
      ],
      [
        [1, 1, 1],
        [0, 0, 0],
        [-1, -1, -1]
      ]
    )
  }

  laplace() {
    return this.operator1(
      [
        [0, 0, -1, 0, 0],
        [0, -1, -2, -1, 0],
        [-1, -2, 16, -2, -1],
        [0, -1, -2, -1, 0],
        [0, 0, -1, 0, 0]
      ]
    )
  }

  freichan() {
    return this.operator1(
      [
        [-1, 0, 1],
        [-1.4, 0, 1.4],
        [-1, 0, 1]
      ]
    )
  }

}