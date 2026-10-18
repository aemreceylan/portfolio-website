/**
 * BAND Simulated Backend & Database Runtime
 * Simulates MongoDB models (User, Channel, Category, Message) and Express endpoints
 * when an external live backend is not connected. Does NOT seed arbitrary mock data.
 */

// Storage Keys
const USERS_KEY = "band_db_users";
const CATEGORIES_KEY = "band_db_categories";
const CHANNELS_KEY = "band_db_channels";
const MESSAGES_KEY = "band_db_messages";
const SESSION_KEY = "band_db_session";

// In-memory fallback
const memoryStorage = new Map();

function getStorageItem(key) {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback to memory
  }
  return memoryStorage.get(key) || null;
}

function setStorageItem(key, value) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback to memory
  }
  memoryStorage.set(key, value);
}

function removeStorageItem(key) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // fallback to memory
  }
  memoryStorage.delete(key);
}

function getCollection(key) {
  const data = getStorageItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveCollection(key, list) {
  setStorageItem(key, JSON.stringify(list));
}

// Active session helper
export function getActiveSession() {
  const data = getStorageItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setActiveSession(session) {
  setStorageItem(SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSession() {
  removeStorageItem(SESSION_KEY);
}

// Global active socket listeners for simulated backend events
const socketEventHub = new Set();

export function emitSimulatedSectionList() {
  if (socketEventHub.size === 0) return;
  const sections = getPopulatedSections();
  const payload = JSON.stringify(sections);
  socketEventHub.forEach((s) => s.trigger("sectionList", payload));
}

export function emitSimulatedUserList() {
  if (socketEventHub.size === 0) return;
  const userMap = getSimulatedUserListMap();
  socketEventHub.forEach((s) => s.trigger("userList", userMap));
}

function getPopulatedSections() {
  const categories = getCollection(CATEGORIES_KEY);
  const channels = getCollection(CHANNELS_KEY);
  const channelMap = new Map(channels.map((c) => [c._id, c]));

  return categories.map((cat) => ({
    _id: cat._id,
    name: cat.name,
    channels: (cat.channels || [])
      .map((chId) => channelMap.get(chId))
      .filter(Boolean),
  }));
}

function getSimulatedUserListMap() {
  const users = getCollection(USERS_KEY);
  const session = getActiveSession();
  const list = [];

  for (const user of users) {
    const isOnline = session ? session.userId === user._id : false;
    list.push([
      user._id,
      {
        _id: user._id,
        id: user._id,
        nick: user.nick,
        profilePhotoURL: user.profilePhotoURL || "img/no-profile-photo.png",
        isOnline: isOnline,
        roles: user.roles || ["0"],
      },
    ]);
  }

  return list;
}

/**
 * Handle API & File requests against the simulated database
 */
export async function handleSimulatedRequest({ url, method = "GET", body }) {
  let parsedBody = {};
  if (body) {
    if (typeof body === "string") {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = {};
      }
    } else {
      parsedBody = body;
    }
  }

  // 1. CSRF Token
  if (url === "api/get-csrf") {
    return {
      status: true,
      msg: "csrf token created",
      csrfToken: "sim_csrf_" + Date.now(),
    };
  }

  // 2. Session Check
  if (url === "api/session-check") {
    const session = getActiveSession();
    if (session && session.isAuth) {
      return {
        status: true,
        message: "Session check approved",
        authToken: session.authToken,
        profileId: session.profileId,
        userId: session.userId,
        profilePhotoURL: session.profilePhotoURL,
        nick: session.nick,
      };
    }
    return { status: false, message: "Session check failed" };
  }

  // 3. User Validation (admin authorization)
  if (url === "api/user-validation") {
    const session = getActiveSession();
    if (session && Array.isArray(session.roles) && session.roles.includes("1")) {
      return { status: true, msg: "User authorization approved" };
    }
    return { status: false, msg: "Unauthorized user" };
  }

  // 4. User Registration (Signup)
  if (url === "api/signup") {
    const { nick, password, password_confirm } = parsedBody;
    if (!nick || !password) {
      return { status: false, msg: "Missing required fields" };
    }
    if (password !== password_confirm) {
      return { status: false, msg: "Passwords do not match" };
    }

    const users = getCollection(USERS_KEY);
    const existing = users.find(
      (u) => u.nick.toLowerCase() === nick.toLowerCase()
    );
    if (existing) {
      return { status: false, msg: "Nickname in use" };
    }

    const isFirstUser = users.length === 0;
    const userId = "usr_" + Date.now();
    const profileId = "prf_" + Date.now();

    const newUser = {
      _id: userId,
      id: userId,
      profile: profileId,
      profileId: profileId,
      nick: nick,
      password: password,
      roles: isFirstUser ? ["1"] : ["0"],
      profilePhotoURL: "img/no-profile-photo.png",
      bannerURL: "img/no-profile-banner.png",
      isBanned: false,
    };

    users.push(newUser);
    saveCollection(USERS_KEY, users);
    return { status: true, msg: "Registration successful" };
  }

  // 5. User Login
  if (url === "api/login") {
    const { nick, password } = parsedBody;
    const users = getCollection(USERS_KEY);
    const user = users.find(
      (u) => u.nick.toLowerCase() === (nick || "").toLowerCase()
    );

    if (!user || user.password !== password) {
      return { status: false, msg: "User not found or password incorrect" };
    }
    if (user.isBanned) {
      return { status: false, msg: "User banned." };
    }

    const authToken = "sim_jwt_" + user._id + "_" + Date.now();
    const session = {
      isAuth: true,
      authToken: authToken,
      profileId: user.profileId,
      userId: user._id,
      profilePhotoURL: user.profilePhotoURL || "img/no-profile-photo.png",
      nick: user.nick,
      roles: user.roles || ["0"],
    };

    setActiveSession(session);
    emitSimulatedUserList();

    return {
      status: true,
      msg: "Login successful",
      authToken: authToken,
      profileId: user.profileId,
      userId: user._id,
      profilePhotoURL: session.profilePhotoURL,
      nick: user.nick,
    };
  }

  // 6. User Logout
  if (url === "api/log-out") {
    clearActiveSession();
    emitSimulatedUserList();
    return { status: true, msg: "Session ended" };
  }

  // 7. Get Profile
  if (url === "api/get-profile") {
    const targetId = typeof parsedBody === "string" ? parsedBody : parsedBody?._id;
    const users = getCollection(USERS_KEY);
    const user = users.find((u) => u.profileId === targetId || u._id === targetId);

    if (user) {
      return {
        status: true,
        msg: "Profile information was fetched successfully.",
        data: {
          user: { nick: user.nick, profilePhotoURL: user.profilePhotoURL },
          bannerURL: user.bannerURL || "img/no-profile-banner.png",
        },
      };
    }
    return { status: false, msg: "Profile not found" };
  }

  // 8. Set User Settings
  if (url === "api/set-user-settings") {
    const { type, data } = parsedBody;
    const users = getCollection(USERS_KEY);

    if (type === "set-profile-photo") {
      const idx = users.findIndex((u) => u._id === data.userId);
      if (idx !== -1) {
        users[idx].profilePhotoURL = data.photoUrl;
        saveCollection(USERS_KEY, users);
        const session = getActiveSession();
        if (session && session.userId === data.userId) {
          session.profilePhotoURL = data.photoUrl;
          setActiveSession(session);
        }
        emitSimulatedUserList();
      }
      return {
        status: true,
        msg: "The uploaded image is set as profile photo",
      };
    }

    if (type === "set-profile-banner") {
      const idx = users.findIndex((u) => u.profileId === data.profileId);
      if (idx !== -1) {
        users[idx].bannerURL = data.photoUrl;
        saveCollection(USERS_KEY, users);
      }
      return {
        status: true,
        msg: "The uploaded image is set as profile banner",
      };
    }

    return { status: false, msg: "Invalid settings type" };
  }

  // 9. Hub Settings (Category and Channel CRUD)
  if (url === "api/set-hub-settings") {
    const { type, data } = parsedBody;
    const categories = getCollection(CATEGORIES_KEY);
    const channels = getCollection(CHANNELS_KEY);

    switch (type) {
      case "add-category": {
        const newCat = {
          _id: "cat_" + Date.now(),
          name: data.name,
          channels: [],
        };
        categories.push(newCat);
        saveCollection(CATEGORIES_KEY, categories);
        emitSimulatedSectionList();
        return { status: true, msg: "Category created" };
      }
      case "add-channel": {
        const newChan = {
          _id: "chan_" + Date.now(),
          name: data.name,
          type: Number(data.type),
        };
        channels.push(newChan);
        saveCollection(CHANNELS_KEY, channels);

        const targetCat = categories.find((c) => c._id === data.categoryId);
        if (targetCat) {
          if (!targetCat.channels) targetCat.channels = [];
          targetCat.channels.push(newChan._id);
          saveCollection(CATEGORIES_KEY, categories);
        }
        emitSimulatedSectionList();
        return { status: true, msg: "Channel created" };
      }
      case "edit-category": {
        const targetCat = categories.find((c) => c._id === data.categoryId);
        if (targetCat) {
          targetCat.name = data.name;
          saveCollection(CATEGORIES_KEY, categories);
          emitSimulatedSectionList();
          return { status: true, msg: "Category edited" };
        }
        return { status: false, msg: "Category not found" };
      }
      case "edit-channel": {
        const targetChan = channels.find((c) => c._id === data.channelId);
        if (targetChan) {
          targetChan.name = data.name;
          saveCollection(CHANNELS_KEY, channels);
          emitSimulatedSectionList();
          return { status: true, msg: "Channel edited" };
        }
        return { status: false, msg: "Channel not found" };
      }
      case "remove-channel": {
        const remainingChannels = channels.filter((c) => c._id !== data.channelId);
        saveCollection(CHANNELS_KEY, remainingChannels);

        for (const cat of categories) {
          if (cat.channels) {
            cat.channels = cat.channels.filter((id) => id !== data.channelId);
          }
        }
        saveCollection(CATEGORIES_KEY, categories);
        emitSimulatedSectionList();
        return { status: true, msg: "Channel deleted" };
      }
      default:
        return { status: false, msg: "Unsupported hub settings type" };
    }
  }

  // 10. Get Messages
  if (url === "api/get-messages") {
    const { channelId, messageAmount = 50, skip = 0 } = parsedBody;
    const allMessages = getCollection(MESSAGES_KEY);
    const channelMessages = allMessages.filter(
      (m) => m.channel && m.channel._id === channelId
    );

    const paginated = channelMessages.slice(
      Math.max(0, channelMessages.length - skip - messageAmount),
      channelMessages.length - skip
    );

    return {
      status: true,
      msg: "Messages were fetched",
      data: paginated,
      isMessagesEnd: channelMessages.length <= skip + messageAmount,
    };
  }

  // 11. File Upload
  if (url === "file/send-file") {
    return {
      status: true,
      msg: "File uploaded successfully",
      data: {
        fileList: [
          {
            _id: "file_" + Date.now(),
            originalName: "uploaded_file",
            url: "img/file.png",
            size: 1024,
          },
        ],
      },
    };
  }

  // 12. User File System
  if (url === "file/user-file-system") {
    return {
      status: true,
      msg: "User file system check approved",
      data: { files: [] },
    };
  }

  return { status: false, msg: "Endpoint not found: " + url };
}

/**
 * Check user authorization against simulated active session
 */
export function checkSimulatedUserValidation() {
  const session = getActiveSession();
  return Boolean(
    session && Array.isArray(session.roles) && session.roles.includes("1")
  );
}

/**
 * Simulated Socket.IO client interface for standalone in-browser runtime
 */
export class SimulatedSocket {
  constructor(authToken) {
    this.authToken = authToken;
    this.listeners = new Map();
    this.rooms = new Set();
    socketEventHub.add(this);

    // Initial greeting and initial data sync
    setTimeout(() => {
      this.trigger("welcome", "WS:Client accepted (Simulated DB Runtime)");
      this.trigger("userList", getSimulatedUserListMap());
      this.trigger("sectionList", JSON.stringify(getPopulatedSections()));
    }, 20);
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  trigger(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((fn) => {
        try {
          fn(data);
        } catch (err) {
          console.error("Simulated socket event error:", err);
        }
      });
    }
  }

  emit(event, ...args) {
    if (event === "joinChannel") {
      const channelId = args[0];
      const callback = args[1];
      this.rooms.add(channelId);
      if (typeof callback === "function") {
        callback("Connected to " + channelId);
      }
      return;
    }

    if (event === "leaveChannel") {
      const channelId = args[0];
      const callback = args[1];
      this.rooms.delete(channelId);
      if (typeof callback === "function") {
        callback({ msg: "User left", status: true });
      }
      return;
    }

    if (event === "newMessageFromClient") {
      const data = args[0] || {};
      const callback = args[1];
      const session = getActiveSession();

      const newMsg = {
        _id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        text: data.text ? data.text.trim() : "",
        sender: {
          nick: session?.nick || "User",
          _id: session?.userId || "user_1",
        },
        channel: {
          _id: data.channelId,
          name: data.channelName,
        },
        timestamp: new Date().toISOString(),
      };

      if (data.files && data.files.length > 0) {
        newMsg.file = [
          data.files[0].originalName || "file",
          data.files[0].url || "img/file.png",
          data.files[0].size || 1024,
        ];
      }

      // Persist to simulated database
      const messages = getCollection(MESSAGES_KEY);
      messages.push(newMsg);
      saveCollection(MESSAGES_KEY, messages);

      // Broadcast to all sockets
      const serialized = JSON.stringify(newMsg);
      socketEventHub.forEach((s) => s.trigger("newMessageFromServer", serialized));

      if (typeof callback === "function") {
        callback({ status: true });
      }
    }
  }

  disconnect() {
    socketEventHub.delete(this);
    this.listeners.clear();
    this.rooms.clear();
  }
}

/**
 * Creates socket with live backend connection fallback to simulated socket
 */
export function createBandSocket(ioClient, authToken) {
  let isConnected = false;

  const simulated = new SimulatedSocket(authToken);

  try {
    if (typeof ioClient === "function") {
      const realSocket = ioClient("localhost:3000", {
        auth: { authToken: authToken },
        timeout: 1000,
        reconnectionAttempts: 1,
      });

      realSocket.on("connect", () => {
        isConnected = true;
      });

      realSocket.on("connect_error", () => {
        isConnected = false;
      });

      // Create a facade proxying calls
      return {
        on: (event, handler) => {
          realSocket.on(event, handler);
          simulated.on(event, handler);
        },
        off: (event, handler) => {
          realSocket.off(event, handler);
          simulated.off(event, handler);
        },
        emit: (event, ...args) => {
          if (isConnected) {
            realSocket.emit(event, ...args);
          } else {
            simulated.emit(event, ...args);
          }
        },
        disconnect: () => {
          realSocket.disconnect();
          simulated.disconnect();
        },
      };
    }
  } catch (err) {
    console.log("Live socket init fallback:", err);
  }

  return simulated;
}
