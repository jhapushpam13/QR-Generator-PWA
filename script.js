// Initialize a new QRCode instance
let qrcode = new QRCode(document.querySelector(".qrcode"));

// Default QR code
qrcode.makeCode("Why did you scan me?");

// Function to generate QR code
function generateQr() {
    const inputValue = document.querySelector("#qr-input").value.trim();
    if (inputValue === "") {
        alert("Input cannot be blank!");
        return;
    }
    qrcode.makeCode(inputValue);
}

// Function to clear the QR code
function clearQr() {
    document.querySelector("#qr-input").value = "";
    qrcode.clear();  // Clears the current QR code
}

// Function to download the QR code as an image
function downloadQr() {
    const qrCanvas = document.querySelector(".qrcode canvas");
    if (qrCanvas) {
        const qrImg = qrCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = qrImg;
        a.download = "qrcode.png";
        a.click();
    } else {
        alert("Generate a QR code first!");
    }
}

// Function to decode QR code from uploaded image
function decodeQr(input) {
    const reader = new FileReader();
    reader.onload = function (event) {
        // Initialize a canvas for image decoding
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // Use a library like jsQR to decode
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
                alert("QR Code content: " + code.data);
            } else {
                alert("Failed to decode QR code.");
            }
        };
    };
    reader.readAsDataURL(input.files[0]);
}

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultDiv = document.getElementById("result");
const scannerDiv = document.getElementById("scanner");
let videoStream = null; // Variable to hold the video stream

document.getElementById("scanButton").addEventListener("click", function() {
    // Stop existing video stream if it exists
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    // Show the scanner UI
    scannerDiv.style.display = "block";

    // Start accessing the camera when the button is clicked
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
            videoStream = stream; // Store the stream to stop it later
            video.srcObject = stream;
            video.setAttribute("playsinline", true); // Required for iOS
            video.play();
            scanQRCode(); // Start scanning QR codes
        }).catch(function(err) {
            console.error("Error accessing the camera: " + err);
            resultDiv.innerText = "Unable to access the camera";
        });
    } else {
        resultDiv.innerText = "Camera not supported by this browser";
    }
});

function scanQRCode() {
    const context = canvas.getContext("2d");

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                resultDiv.innerText = "QR Code Found: " + code.data;
                // Stop the video stream once a QR is found
                video.srcObject.getTracks().forEach(track => track.stop());
                videoStream = null; // Reset videoStream variable
            } else {
                resultDiv.innerText = "No QR code detected";
            }
        }
        requestAnimationFrame(tick); // Keep scanning
    }
    tick();
}

function stopScanning() {
    // Stop the video stream and hide scanner UI
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null; // Reset videoStream variable
    }
    scannerDiv.style.display = "none"; // Hide scanner UI
}

// Cancel button event listener
document.getElementById("cancelButton").addEventListener("click", function() {
    stopScanning(); // Call stopScanning function to stop the video and hide the UI
    resultDiv.innerText = "Scanning cancelled"; // Show cancellation message
});

// Registering the Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(function(error) {
            console.error('Service Worker registration failed:', error);
        });
    });
}
