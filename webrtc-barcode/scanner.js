/**
 * Scanner Module - Scans QR Codes to receive SDP and automatically connect.
 */

// DOM Elements
const statusEl = document.getElementById('scanStatus');
let html5QrcodeScanner; // Store scanner instance for cleanup

/**
 * Starts the QR code scanning process using html5-qrcode library.
 */
window.startScanner = async function() {
    const qrContainer = document.createElement('div');
    qrContainer.id = 'qrcode-reader-container';
// Initialize Html5Qrcode (or use CDN version)
  html5QrcodeScanner = new Html5QrcodeScanner("qrcode-reader-container",

    {
      fps: 10,
      qrbox: {
        width: 640,
        height: 480
      }
    }, false );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure).catch(err => {
        console.error("Error starting scanner:", err);
        statusEl.textContent = "Scanner error. Check console."+ err;
    });
};

/**
 * Callback when a QR code is successfully scanned.
 */
function onScanSuccess(decodedText, decodedResult) {
// Decode the SDP data from the QR code content
  statusEl.textContent = decodedText;
  try {
      const sdpData = decodeSDP(decodedText);
          statusEl.textContent = "Creating peer connection!" + sdpData;
              // Create peer connection with the received offer (or answer if needed).
              createPeerConnection(sdpData, true);
  } catch(e) {
      console.error("QR decode error:", e);
      statusEl.textContent += "Decode failed. Check data." + e;
  };
};

/**
 * Callback for scan failures or errors.
 */
function onScanFailure(error) {
// Log but don't alert - user is actively scanning
console.warn("Scanning failure:", error.message || error);
}

/**
 * Creates a WebRTC peer connection based on the received SDP (from QR code).
 * @param {string} remoteSdp - The decoded SDP from the QR code.
 * @param {boolean} isAnswerer - True if this device should answer an incoming offer, false if sending one.
 */
function createPeerConnection(remoteSdp, isAnswerer) {
    const pc = new window.RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        constraints: { optional: [{ googLeakyHeapCheck:true }] },
    });
  // Set up ICE candidate listeners
  pc.onicecandidate = event => {
  };

  if (isAnswerer) {
    statusEl.textContent += 'is answer ! ';
      // Answerer logic - set remote description with the offer from QR code
      pc.setRemoteDescription(remoteSdp).then(() => {
              // Generate answer (requires waiting for ICE candidates or timeout)
              statusEl.textContent += ' waiting on ice ! ';
              const answer = pc.createAnswer();
              statusEl.textContent += ' got answer ! ' + answer;
                  return pc.setLocalDescription(answer);
      });
  } else {
    statusEl.textContent += 'not an answer';
  // Publisher logic - already sent the offer via QR code
      console.log("Publisher: Connection ready, awaiting incoming call.");
  }
};

/**
 * Decodes the WebRTC SDP from a string received via QR code.
 * @param {string} encodedSdp - The raw or base64-encoded SDP data.
 * @returns {Object|null} Parsed JSON description of the offer/answer, null if invalid.
 */
function decodeSDP(encodedSdp) {
    try {
        // Check for prefix (we use "offer:" or "answer:" prefixes to distinguish in QR code content)
        const isBase64 = encodedSdp.startsWith("offer:");
        let sdpData;
      if (isBase64) {
        statusEl.textContent += '[ is offer !]';
                sdpData = atob(encodedSdp.replace(/^offer:/, '')); // Remove prefix & decode base64
      } else {
        statusEl.textContent += '[ is note offer ]';
                // Try parsing JSON directly
                try {
                    const json = JSON.parse(atob(encodedSdp));
                    return (json && typeof json === 'object') ? window.RTCPeerConnection.localDescription : null;
                } catch(e) {}
            }
        return sdpData || encodedSdp;
    } catch(err) {
        console.error("SDP decode error:", err);
        throw new Error("Invalid SDP format.");
    }
};
