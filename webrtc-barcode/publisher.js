/**
 * Publisher Module - Creates WebRTC Offer and displays as QR Code for scanning by other devices.
 */

// Import html5-qrcode from CDN (or local lib)
// const Html5QrcodeScanner = Html5QrcodeScanner || window.Html5QrcodeScanner; // Fallback check

let peerConnection;
let stream;
let offerSDP = null;

/** Get Media Constraints for getUserMedia */
function getMediaConstraints() {
    return { video: true, audio: true };
}

/** Create a WebRTC Offer using RTCPeerConnection */
async function createOffer(localStream) {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },  // Google STUN server (public/free)
            // Add TURN servers here if needed for NAT traversal through firewalls/proxies
        ]
    };

    peerConnection = new RTCPeerConnection(configuration);

    // localStream.getTracks().forEach(track => {
    //     peerConnection.addTrack(track, localStream);
    //  }
   // );

// Listen for ICE candidates (network connection data) to be added later.
peerConnection.onicecandidate = event => {
if (event.candidate) {
  console.log("ICE Candidate received:", event.candidate.candidate.substring(0, 50), "...");
}
};

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

// The SDP string is now in the local description
    return new Promise((resolve) => {
        setTimeout(() => {
            if (peerConnection.localDescription.type === 'offer') {
                offerSDP = btoa(JSON.stringify(peerConnection.localDescription)); // Base64 encode for QR safety
                console.log("Offer SDP generated:", offerSDP.substring(0, 50), "...");
                resolve(offerSDP);
            } else {
                throw new Error("Failed to create Offer. Local description type: " + peerConnection.localDescription.type);
            }
        }, 100);
    });
}

/** Generate a QR Code and display it */
function showQRCode(sdpData) {
    const qrContainer = document.getElementById('qr-display-area');
    if (!qrContainer || !sdpData) return;

// Create an img element for the QR code
const qrImage = document.createElement('img');
qrImage.id = 'qrcode';
qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sdpData)}`;
    qrContainer.innerHTML = '';
    qrContainer.appendChild(qrImage);
}

// UI Event Listener: Start Publisher Mode
function startPublisher() {
pubStatus.textContent = 'Generating Offer...';
document.getElementById('startScanBtn').disabled = true;

createOffer(stream).then(sdp => {
  showQRCode(sdp);
    pubStatus.textContent = `Offer Ready! QR Code displayed.`;
        }).catch(err => {
            console.error("Error creating offer:", err);
            pubStatus.textContent = 'Error generating offer. Check console.';
      });
}

/**
 * Scanner Module - Reads the QR code containing SDP and initiates connection.
 */
