(function () {
  const edgeDetection = new EdgeDetection(document.getElementById('image-canvas'))

  edgeDetection.loadImage('images/demo.jpeg')

  document.getElementById('reset').addEventListener('click', function () {
    edgeDetection.resetImage()
  })

  const imageLoader = document.getElementById('image-loader')
  imageLoader.addEventListener('change', handleImage, false)

  function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image()
      img.src = event.target.result;

      edgeDetection.loadImage(event.target.result)
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  document.getElementById('upload-image').addEventListener('click', function () {
    imageLoader.click()
  })

  // Function Untuk Memulai Proses
  function beforeNonMaximumSuppression() {
    edgeDetection.resetImage()

    edgeDetection.greyscale()

    // calulcate gradiant
    if (document.getElementById('sobel').checked) {
      edgeDetection.sobel()
    } else if (document.getElementById('roberts').checked) {
      edgeDetection.roberts()
    } else if (document.getElementById('prewitt').checked) {
      edgeDetection.prewitt()
    } else if (document.getElementById('laplace').checked) {
      edgeDetection.laplace()
    } else if (document.getElementById('freichan').checked) {
      edgeDetection.freichan()
    }

    edgeDetection.drawOnCanvas()

    return true;

  }

  // Memulai Algoritma
  document.getElementById('calculate-gradiant').addEventListener('click', function () {

    if (beforeNonMaximumSuppression() == true) {
      Swal.fire({
        title: 'Sedang Memproses..',
        timer: 1000
      })
      Swal.showLoading();
    }

  })

})()