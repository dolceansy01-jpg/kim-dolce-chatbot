import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyC3A-d31HodRfAdLbXv21tR0Kb4pEuEWP4",
  authDomain: "kim-dolce-ai.firebaseapp.com",
  projectId: "kim-dolce-ai",
  storageBucket: "kim-dolce-ai.firebasestorage.app",
  messagingSenderId: "609907966731",
  appId: "1:609907966731:web:29680b942cac225bf6d80e",
  measurementId: "G-M4VTFERJJ3"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const provider = new GoogleAuthProvider();


/* =========================
   ELEMENTS
========================= */

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const newChatBtn = document.getElementById("newChatBtn");

const photoBtn = document.getElementById("photoBtn");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const previewImage = document.getElementById("previewImage");
const removePhotoBtn = document.getElementById("removePhotoBtn");

const welcome = document.getElementById("welcome");


/* =========================
   STATE
========================= */

let currentUser = null;
let selectedImage = null;
let messages = [];


/* =========================
   GOOGLE LOGIN SCREEN
========================= */

function createLoginScreen() {

  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#070707;
      color:white;
      font-family:Arial,sans-serif;
      padding:20px;
    ">

      <div style="
        width:100%;
        max-width:420px;
        text-align:center;
        background:#111;
        border:1px solid rgba(255,255,255,.08);
        border-radius:24px;
        padding:40px 25px;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
      ">

        <div style="
          width:80px;
          height:80px;
          margin:0 auto 20px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:22px;
          background:linear-gradient(135deg,#e50914,#600007);
          font-weight:900;
          font-size:24px;
        ">
          KD
        </div>

        <h1 style="margin-bottom:10px;">
          KIM DOLCE AI
        </h1>

        <p style="
          color:#999;
          line-height:1.6;
          margin-bottom:25px;
        ">
          Connecte-toi avec Google pour accéder à ton assistant IA.
        </p>

        <button id="googleLoginBtn" style="
          width:100%;
          padding:15px;
          border:0;
          border-radius:14px;
          background:white;
          color:#111;
          font-weight:bold;
          cursor:pointer;
          font-size:15px;
        ">
          🔵 Continuer avec Google
        </button>

        <p id="loginError" style="
          color:#ff5555;
          font-size:13px;
          margin-top:15px;
        "></p>

      </div>
    </div>
  `;

  document
    .getElementById("googleLoginBtn")
    .addEventListener("click", loginWithGoogle);
}


/* =========================
   GOOGLE LOGIN
========================= */

async function loginWithGoogle() {

  const button =
    document.getElementById("googleLoginBtn");

  const errorBox =
    document.getElementById("loginError");

  button.disabled = true;

  button.textContent = "Connexion...";

  try {

    await signInWithPopup(
      auth,
      provider
    );

  } catch (error) {

    console.error(error);

    errorBox.textContent =
      "Connexion impossible. Vérifie que Google est activé dans Firebase.";

    button.disabled = false;

    button.textContent =
      "🔵 Continuer avec Google";
  }
}


/* =========================
   USER MENU
========================= */

function addUserMenu() {

  const header =
    document.querySelector(".header");

  if (!header || !currentUser) return;

  const oldMenu =
    document.getElementById("userMenu");

  if (oldMenu) {
    oldMenu.remove();
  }

  const menu =
    document.createElement("div");

  menu.id = "userMenu";

  menu.style.cssText = `
    display:flex;
    align-items:center;
    gap:8px;
    margin-left:auto;
    margin-right:10px;
  `;

  const avatar =
    document.createElement("img");

  avatar.src =
    currentUser.photoURL ||
    "https://www.gravatar.com/avatar/?d=mp";

  avatar.alt =
    currentUser.displayName ||
    "Utilisateur";

  avatar.style.cssText = `
    width:38px;
    height:38px;
    border-radius:50%;
    object-fit:cover;
  `;

  const logout =
    document.createElement("button");

  logout.textContent =
    "Déconnexion";

  logout.style.cssText = `
    padding:9px 12px;
    border:1px solid rgba(255,255,255,.1);
    border-radius:10px;
    background:#171717;
    color:white;
    cursor:pointer;
    font-size:12px;
  `;

  logout.addEventListener(
    "click",
    async () => {

      try {
        await signOut(auth);
      } catch (error) {
        console.error(error);
      }

    }
  );

  menu.appendChild(avatar);
  menu.appendChild(logout);

  header.insertBefore(
    menu,
    header.lastElementChild
  );
}


/* =========================
   TIME
========================= */

function getTime() {

  return new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(
  text,
  type,
  image = null
) {

  if (welcome) {
    welcome.style.display = "none";
  }

  const message =
    document.createElement("div");

  message.className =
    `message ${type}`;

  const content =
    document.createElement("div");

  content.className =
    "message-content";


  /* IMAGE */

  if (image) {

    const img =
      document.createElement("img");

    img.src = image;

    img.alt = "Photo envoyée";

    img.style.cssText = `
      max-width:100%;
      max-height:300px;
      border-radius:12px;
      display:block;
      margin-bottom:8px;
      object-fit:contain;
    `;

    content.appendChild(img);
  }


  /* TEXT */

  if (text) {

    const textNode =
      document.createElement("div");

    textNode.textContent = text;

    content.appendChild(textNode);
  }


  /* TIME */

  const time =
    document.createElement("span");

  time.className =
    "message-time";

  time.textContent =
    getTime();

  content.appendChild(time);

  message.appendChild(content);

  chat.appendChild(message);

  chat.scrollTop =
    chat.scrollHeight;


  messages.push({
    role:
      type === "user"
        ? "user"
        : "assistant",

    content: text || "",

    image:
      image || null
  });
}


/* =========================
   TYPING
========================= */

function showTyping() {

  if (!typing) return;

  typing.classList.remove(
    "hidden"
  );
}

function hideTyping() {

  if (!typing) return;

  typing.classList.add(
    "hidden"
  );
}


/* =========================
   PHOTO → BASE64
========================= */

function fileToBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}


/* =========================
   PHOTO SELECT
========================= */

if (photoBtn && photoInput) {

  photoBtn.addEventListener(
    "click",
    () => {

      photoInput.click();

    }
  );


  photoInput.addEventListener(
    "change",
    async () => {

      const file =
        photoInput.files?.[0];

      if (!file) return;


      if (!file.type.startsWith("image/")) {

        alert(
          "Veuillez sélectionner une image."
        );

        return;
      }


      if (file.size > 7 * 1024 * 1024) {

        alert(
          "L'image est trop grande. Maximum 7 MB."
        );

        photoInput.value = "";

        return;
      }


      try {

        selectedImage =
          await fileToBase64(file);

        previewImage.src =
          selectedImage;

        photoPreview.style.display =
          "flex";

      } catch (error) {

        console.error(error);

        alert(
          "Impossible de charger la photo."
        );
      }
    }
  );
}


/* =========================
   REMOVE PHOTO
========================= */

if (removePhotoBtn) {

  removePhotoBtn.addEventListener(
    "click",
    () => {

      selectedImage = null;

      photoInput.value = "";

      previewImage.src = "";

      photoPreview.style.display =
        "none";
    }
  );
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

  const message =
    messageInput.value.trim();

  if (
    !message &&
    !selectedImage
  ) {
    return;
  }

  if (!currentUser) {
    return;
  }


  const imageToSend =
    selectedImage;


  /* SHOW USER MESSAGE */

  addMessage(
    message ||
      "📷 Analyse cette photo.",
    "user",
    imageToSend
  );


  /* CLEAR INPUT */

  messageInput.value = "";

  messageInput.style.height =
    "auto";


  selectedImage = null;

  if (photoInput) {
    photoInput.value = "";
  }

  if (photoPreview) {
    photoPreview.style.display =
      "none";
  }


  sendBtn.disabled = true;

  showTyping();


  try {

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message:
              message ||
              "Analyse cette photo et explique-moi ce que tu vois.",

            image:
              imageToSend,

            userId:
              currentUser.uid
          })
        }
      );


    const data =
      await response.json();


    hideTyping();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erreur serveur"
      );
    }


    addMessage(
      data.reply,
      "ai"
    );


  } catch (error) {

    console.error(
      "CHAT ERROR:",
      error
    );

    hideTyping();

    addMessage(
      "Désolé, je ne peux pas traiter cette demande pour le moment.",
      "ai"
    );


  } finally {

    sendBtn.disabled = false;

    messageInput.focus();
  }
}


/* =========================
   SEND BUTTON
========================= */

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );
}


/* =========================
   ENTER KEY
========================= */

if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();
      }

    }
  );


  messageInput.addEventListener(
    "input",
    () => {

      messageInput.style.height =
        "auto";

      messageInput.style.height =
        Math.min(
          messageInput.scrollHeight,
          140
        ) + "px";
    }
  );
}


/* =========================
   NEW CHAT
========================= */

if (newChatBtn) {

  newChatBtn.addEventListener(
    "click",
    () => {

      chat.innerHTML = "";

      if (welcome) {

        chat.appendChild(
          welcome
        );

        welcome.style.display =
          "block";
      }

      messages = [];

      messageInput.value = "";

      messageInput.style.height =
        "auto";

      selectedImage = null;

      if (photoInput) {
        photoInput.value = "";
      }

      if (photoPreview) {
        photoPreview.style.display =
          "none";
      }

      messageInput.focus();
    }
  );
}


/* =========================
   SUGGESTIONS
========================= */

document
  .querySelectorAll(".suggestion")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          messageInput.value =
            button.textContent.trim();

          messageInput.focus();

          messageInput.dispatchEvent(
            new Event("input")
          );
        }
      );

    }
  );


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
  auth,
  (user) => {

    currentUser = user;


    if (!user) {

      createLoginScreen();

      return;
    }


    addUserMenu();

    console.log(
      "KIM DOLCE AI connecté:",
      user.displayName
    );

    messageInput?.focus();
  }
);
