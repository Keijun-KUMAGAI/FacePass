import * as tf from '@tensorflow/tfjs'

export default class Webcam {
  constructor(webcamElement) {
    this.webcamElement = webcamElement
  }

  capture() {
    return tf.tidy(() => {
      const webcamImage = tf.fromPixels(this.webcamElement)
      const croppedImage = this.cropImage(webcamImage)
      const batchedImage = croppedImage.expandDims(0)

      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))
    })
  }

  // eslint-disable-next-line class-methods-use-this
  cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1])
    const centerHeight = img.shape[0] / 2
    const beginHeight = centerHeight - (size / 2)
    const centerWidth = img.shape[1] / 2
    const beginWidth = centerWidth - (size / 2)
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3])
  }

  adjustVideoSize(width, height) {
    const aspectRatio = width / height
    if (width >= height) {
      this.webcamElement.width = aspectRatio * this.webcamElement.height
    } else if (width < height) {
      this.webcamElement.height = this.webcamElement.width / aspectRatio
    }
  }

  async setup() {
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator
      navigator.getUserMedia = navigator.getUserMedia || navigatorAny.webkitGetUserMedia
                                || navigatorAny.mozGetUserMedia || navigatorAny.msGetUserMedia
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },
          (stream) => {
            this.webcamElement.srcObject = stream
            this.webcamElement.addEventListener('loadeddata', async () => {
              this.adjustVideoSize(
                this.webcamElement.videoWidth,
                this.webcamElement.videoHeight,
              )
              resolve()
            }, false)
          },
          error => reject(error),
        )
      } else {
        reject()
      }
    })
  }
}
