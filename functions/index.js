// index.js
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { Magic } = require("@magic-sdk/admin");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const MAGIC_SECRET = defineSecret("MAGIC_SECRET");
const serviceAccount = require("./owais-43.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

console.log("✅ Cloud Function loaded (MPC only, no private keys in Firestore)");

// Express setup
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("API is up and running!");
});

// --------- Helpers ---------
async function validateMagic(req) {
  const magic = new Magic(process.env.MAGIC_SECRET || "sk_live_A7AB847671BAF688");
  const didToken = req.headers.authorization?.split("Bearer ")[1];
  if (!didToken) throw new Error("Missing DID token");
  await magic.token.validate(didToken);
  const metadata = await magic.users.getMetadataByToken(didToken);
  if (!metadata.email) throw new Error("Invalid user email");
  return metadata.email.toLowerCase();
}

// Auth-only helper: get Firebase custom token
app.post("/getCustomToken", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const firebaseToken = await admin.auth().createCustomToken(email);
    return res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error("Get custom token error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// STUDENT ROUTES (unchanged where possible)

app.post("/login", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const firebaseToken = await admin.auth().createCustomToken(email);
    // No wallet generation here. Students may still store walletAddress later if needed.
    return res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error("Student login error:", error);
    return res.status(500).json({ message: error.message });
  }
});

app.post("/createStudentProfile", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { name, rollNo, semester, batch, parentage, address, dob, department, walletAddress } = req.body;

    if (!email || !rollNo) return res.status(400).json({ message: "Email and roll number required" });

    const q = await db.collection("users").where("rollNo", "==", rollNo).get();
    if (!q.empty) return res.status(409).json({ message: "Roll number already exists!" });

    await db.collection("users").doc(email).set({
      email,
      name,
      rollNo,
      semester,
      batch,
      parentage,
      address,
      dob,
      department,
      // Only store public address if you have it (from Magic on the client)
      ...(walletAddress ? { walletAddress } : {}),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ message: "Profile created!" });
  } catch (error) {
    console.error("Create student profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});

app.get("/getStudentProfile", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const docSnap = await db.collection("users").doc(email).get();
    if (!docSnap.exists) return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json(docSnap.data());
  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});

app.post("/updateStudentProfile", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const updatedData = req.body;
    await db.collection("users").doc(email).set(updatedData, { merge: true });
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update student profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});

app.get("/studentsByBatch/:batch", async (req, res) => {
  try {
    const { batch } = req.params;
    const snapshot = await db.collection("users").where("batch", "==", batch).get();
    if (snapshot.empty) return res.status(404).json({ message: "No students found" });
    const students = snapshot.docs.map(doc => doc.data());
    return res.status(200).json(students);
  } catch (error) {
    console.error("Students by batch error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// PROFESSOR ROUTES (MPC-first)

// DO NOT auto-create professors or wallets at login.
// Only check existence and let UI decide where to go.

// Query by email field (not doc id) to avoid mismatch with any previous "safeEmail" doc ids.
app.get("/getProfessorProfile", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const q = await db.collection("professors").where("email", "==", email).limit(1).get();
    if (q.empty) return res.status(404).json({ message: "Profile not found" });
    const data = q.docs[0].data();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Get professor profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Create professor profile — store ONLY public info + walletAddress (no keys)!
app.post("/createProfessorProfile", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { name, department, designation, phone, uniqueCode, walletAddress } = req.body;

    if (!uniqueCode) return res.status(400).json({ message: "Unique code is required" });

    // Optional security: validate unique code server-side
    const codeRef = db.collection("professorCodes").doc(uniqueCode);
    const codeSnap = await codeRef.get();
    if (!codeSnap.exists) return res.status(403).json({ message: "Invalid unique code" });
    if (codeSnap.data().used) return res.status(409).json({ message: "Unique code already used" });

    // Check if already exists
    const existsQ = await db.collection("professors").where("email", "==", email).limit(1).get();
    if (!existsQ.empty) return res.status(409).json({ message: "Professor profile already exists!" });

    await db.collection("professors").doc(email).set({
      email,
      name,
      department,
      designation: designation || "",
      phone: phone || "",
      // Only the public wallet address from Magic
      ...(walletAddress ? { walletAddress } : {}),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uniqueCode,
    }, { merge: true });

    // Mark code as used
    await codeRef.set({ used: true, usedBy: email, usedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    return res.status(200).json({ message: "Professor profile created!" });
  } catch (error) {
    console.error("Create professor profile error:", error);
    return res.status(500).json({ message: error.message });
  }
});
// ANNOUNCEMENTS

// Make an announcement (Professors only)
app.post("/makeAnnouncement", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { title, message, batch } = req.body;

    if (!title || !message || !batch) {
      return res.status(400).json({ message: "Title, message, and batch are required" });
    }

    // Verify professor
    const profSnap = await db.collection("professors").where("email", "==", email).limit(1).get();
    if (profSnap.empty) {
      return res.status(403).json({ message: "Only professors can make announcements" });
    }
    const professorData = profSnap.docs[0].data();

    const newAnnouncement = {
      title,
      message,
      // Always save "All" explicitly instead of undefined
      batch: batch === "All" ? "All" : batch,
      // Always include professor's real name
      professorName: professorData.name || "Unknown Professor",
      createdBy: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("announcements").add(newAnnouncement);
    return res.status(200).json({ success: true, id: docRef.id, ...newAnnouncement });
  } catch (error) {
    console.error("Make announcement error:", error);
    return res.status(500).json({ message: error.message });
  }
});
app.get("/announcements", async (req, res) => {
  try {
    const snapshot = await db
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get announcements (Students will only see their batch + All)
app.get("/announcements/:batch", async (req, res) => {
  try {
    const { batch } = req.params;

    let query = db.collection("announcements").orderBy("createdAt", "desc");

    if (batch !== "All") {
      // Fetch both specific batch + All
      query = db.collection("announcements")
        .where("batch", "in", [batch, "All"])
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const announcements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: error.message });
  }
});

// Helper API: Get batch range from students
app.get("/batchRange", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return res.status(200).json([]);

    const batches = [...new Set(snapshot.docs.map((doc) => doc.data().batch))];
    const sortedBatches = batches.sort(); // ascending order
    return res.status(200).json(sortedBatches);
  } catch (error) {
    console.error("Get batch range error:", error);
    return res.status(500).json({ message: error.message });
  }
});
// ===================== CHAT ROUTES =====================

// Send a chat message (students only, batch-based)
app.post("/sendMessage", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { text, message = text, type = "text", batch } = req.body;

    // Stronger validation
    if (!message || !batch || typeof batch !== "string" || batch.trim() === "") {
      return res.status(400).json({ success: false, message: "Message and valid batch are required" });
    }

    // Verify student belongs to this batch
    const userSnap = await db.collection("users").doc(email).get();
    if (!userSnap.exists || userSnap.data().batch !== batch) {
      return res.status(403).json({ message: "You are not allowed to send messages to this batch" });
    }

    const newMessage = {
      message,
      type, // "text" | "image"
      batch,
      sender: email,
      seenBy: [], // for blue ticks
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("messages").add(newMessage);

    return res.status(200).json({ success: true, id: docRef.id, ...newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Get chat messages (students see only their batch)
// Get messages for a batch
// Get chat messages (students see only their batch)
app.get("/messages", async (req, res) => {
  try {
    const email = await validateMagic(req);

    // Get user's batch from Firestore
    const userSnap = await db.collection("users").doc(email).get();
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userBatch = userSnap.data().batch;
    if (!userBatch || typeof userBatch !== "string" || userBatch.trim() === "") {
      return res.status(400).json({ success: false, message: "User batch is missing or invalid" });
    }

    // Fetch messages only for this batch
    const snapshot = await db
      .collection("messages")
      .where("batch", "==", userBatch)
      .orderBy("createdAt", "asc")
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ success: true, messages, batch: userBatch });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark message as seen (blue ticks)
app.post("/markSeen/:messageId", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { messageId } = req.params;

    const msgRef = db.collection("messages").doc(messageId);
    const msgSnap = await msgRef.get();

    if (!msgSnap.exists) return res.status(404).json({ message: "Message not found" });

    await msgRef.update({
      seenBy: admin.firestore.FieldValue.arrayUnion(email),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark seen error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Delete a message (only sender can delete)
app.delete("/deleteMessage/:messageId", async (req, res) => {
  try {
    const email = await validateMagic(req);
    const { messageId } = req.params;

    const msgRef = db.collection("messages").doc(messageId);
    const msgSnap = await msgRef.get();

    if (!msgSnap.exists) return res.status(404).json({ message: "Message not found" });

    if (msgSnap.data().sender !== email) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await msgRef.delete();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: error.message });
  }
});


// ===================== EXPORT API =====================
exports.api = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    invoker: "public",
    secrets: [MAGIC_SECRET],
  },
  app
);
