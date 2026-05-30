/**
 * Shared Peer Connection Utilities for WebRTC Barcode Signaling
 * This module provides common functions for creating peer connections,
 * handling SDP (Session Description Protocol), and managing media streams.
 */

// Import simple-peer from CDN (for browser compatibility)
const SimplePeer = window.SimplePeer || require('simple-peer');

/**
 * Creates a new WebRTC Peer Connection using simple-peer library.
 * @param {string} direction - 'offer' or 'answer' indicating the role in connection setup.
 * @returns {Object} A configured Peer instance ready for connection establishment.
 */
function createPeer(direction) {
    const opts = { initiator: direction === 'offer', trickle: false };
    return new SimplePeer(opts);
}

/**
 * Generates a WebRTC Offer using RTCPeerConnection and simple-peer wrapper.
 * @param {MediaStream} localStream - The user's camera/microphone stream.
 * @returns {Promise<string>} A base64-encoded SDP offer string for QR code embedding.
 */
async function createOffer(localStream) {
    // Use RTCPeerConnection directly for full control over SDP generation
    const pc = new window.RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        constraints: { optional: [{ googLeakyHeapCheck:true }] }, // Optional debugging constraint
    });

    // Attach the local stream to this peer connection
    pc.addStream(localStream);

// Generate and return an offer (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

return btoa(JSON.stringify(pc.localDescription)); // Return base64-encoded SDP for QR safety
}

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
            if(isBase64){
                sdpData = atob(encodedSdp.replace(/^offer:/, '')); // Remove prefix & decode base64
            } else {
                // Try parsing JSON directly
                try {
                    const json = JSON.parse(encodedSdp);
                    return (json && typeof json === 'object') ? pc.localDescription : null;
                } catch(e) {}
            }
        return sdpData || encodedSdp;
    } catch(err) {
        console.error("SDP decode error:", err);
        throw new Error("Invalid SDP format.");
    }
}

/**
 * Main publisher entry point (exposed to global scope for HTML binding).
 */
window.startPublisher = async function() {
    const statusEl = document.getElementById('pubStatus');
    try {
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("getUserMedia not supported");
        }
// Get user's camera/mic stream
const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
});
statusEl.textContent = 'Generating Offer...';

        // Generate WebRTC offer (SDP) using peer-utils
        const encodedSdp = await createOffer(localStream);
// Display the QR Code with SDP data
const qrContainer = document.getElementById('qr-display-area');
if(qrContainer && typeof Html5Qrcode !== 'undefined') {
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        } else if (typeof createQRCode === 'function' || window.createQRCode) {
            // Fallback to zxing.js or another QR library
             console.warn("html5-qrcode not loaded; using alternative QR generation.");
        }
    } catch(err) {
        statusEl.textContent = 'Error: ' + err.message;
    }
};

// HTML event bindings are set up in index.html via onclick attributes.
