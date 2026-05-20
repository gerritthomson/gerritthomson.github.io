class Stage {
  constructor() {
    this.peerConnection = null;
    this.mediaStream = null;
    this.dataChannel = null;

    this.initialize();
  }

  initialize() {
    const iceServers = [
      // { urls: "stun.alltel.com.au:3478" },
      // { urls: "stun.colouredlines.com.au:3478" },
      // { urls: "stun.faktortel.com.au:3478" },
      // { urls: "stun1.faktortel.com.au:3478" },
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.l.google.com:5349" },
      { urls: "stun:stun1.l.google.com:3478" },
      { urls: "stun:stun1.l.google.com:5349" },
      // { urls: "stun:stun2.l.google.com:19302" },
      // { urls: "stun:stun2.l.google.com:5349" },
      // { urls: "stun:stun3.l.google.com:3478" },
      // { urls: "stun:stun3.l.google.com:5349" },
      // { urls: "stun:stun4.l.google.com:19302" },
      // { urls: "stun:stun4.l.google.com:5349" },
    ];
    // Create PeerConnection
    this.peerConnection = new RTCPeerConnection({
      iceServers: iceServers,
      strictICE: true,
    });

    // Handle connection states
    this.peerConnection.onconnectionstatechange = (state) => {
      switch (state) {
        case "connected":
          document.getElementById("status").textContent = "Connected";
          break;
        case "disconnected":
          document.getElementById("status").textContent = "Disconnected";
          break;
        default:
          break;
      }
    };

    // Handle incoming offer/answer
    this.peerConnection.onremotemedialistenershipsuccess = async (event) => {
      const remoteSdpOffer = event.sdpOffer;
      await this.peerConnection.addRemoteStream(remoteSdpOffer);
    };
  }

  async startSession() {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      this.peerConnection = new Stage();
      await this.peerConnection.initialize();
      this.dataChannel = this.peerConnection.createDataChannel();

      // Event listeners
      this.peerConnection.ondatachannel = (event) => {
        const receivedMsg = event.data;
        handleReceived(receivedMsg);
      };

      return true;
    } catch (error) {
      console.error("Failed to start WebRTC session:", error);
      return false;
    }
  }

  async sendData(dataType) {
    try {
      const data = serializeData(dataType);
      if (this.dataChannel) {
        await this.dataChannel.send(data);
      }
      return true;
    } catch (error) {
      console.error("Failed to send data:", error);
      return false;
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}

// Global instance
let rtcStage = null;

// Initialize when app starts
document.addEventListener("DOMContentLoaded", () => {
  rtcStage = new Stage();
});

// Function to serialize data
function serializeData(dataType) {
  if (dataType instanceof Set) {
    return [...dataType].map((s) => serializeSong(s)).join(",");
  } else if (dataType instanceof Song) {
    return JSON.stringify(dataType);
  }
  // Add more cases as needed
}
