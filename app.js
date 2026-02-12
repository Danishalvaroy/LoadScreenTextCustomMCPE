import JSZip from "https://esm.run/jszip";

const isIndo = navigator.language.startsWith("id");

const textMap = {
  chat: isIndo ? "Pesan Loading" : "Loading Messages",
  info: isIndo ? "Info Addon" : "Addon Info",
  empty: isIndo ? "Minimal 1 pesan!" : "At least 1 message required!",
  max: isIndo ? "Maksimal 60 karakter!" : "Maximum 60 characters!"
};

document.getElementById("titleChat").innerText = textMap.chat;
document.getElementById("titleInfo").innerText = textMap.info;

const pageChat = document.getElementById("pageChat");
const pageInfo = document.getElementById("pageInfo");

document.getElementById("openSettings").onclick = () => {
  pageChat.classList.remove("active");
  pageInfo.classList.add("active");
};

document.getElementById("backBtn").onclick = () => {
  pageInfo.classList.remove("active");
  pageChat.classList.add("active");
};

let loadingTexts = [];

const newText = document.getElementById("newText");
const chat = document.getElementById("chat");
const actionBtn = document.getElementById("actionBtn");
const actionIcon = document.getElementById("actionIcon");

function render() {
  chat.innerHTML = "";
  loadingTexts.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "bubble";
    div.innerText = text;

    const del = document.createElement("md-icon-button");
    del.innerHTML = "<md-icon>close</md-icon>";
    del.onclick = () => {
      loadingTexts.splice(i, 1);
      render();
    };

    div.appendChild(del);
    chat.appendChild(div);
  });
}

function updateIcon() {
  actionIcon.innerText = newText.value.trim() === "" ? "check" : "send";
}

newText.addEventListener("input", updateIcon);

actionBtn.onclick = () => {
  const value = newText.value.trim();
  if (value === "") {
    newText.blur();
    return;
  }
  if (value.length > 60) {
    alert(textMap.max);
    return;
  }
  loadingTexts.push(value);
  newText.value = "";
  updateIcon();
  render();
};

function uuid() {
  return crypto.randomUUID();
}

document.getElementById("generateBtn").onclick = async () => {
  if (loadingTexts.length === 0) {
    alert(textMap.empty);
    return;
  }

  const zip = new JSZip();

  const name = document.getElementById("addonName").value || "Custom Loading";
  const desc = document.getElementById("addonDesc").value || "";
  const engine = document.getElementById("engineVersion").value.split(",");

  const manifest = {
    format_version: 2,
    header: {
      name,
      description: desc,
      uuid: uuid(),
      version: [1,0,0],
      min_engine_version: engine.map(Number)
    },
    modules: [{
      type: "resources",
      uuid: uuid(),
      version: [1,0,0]
    }]
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("texts/loading_messages.json",
    JSON.stringify({ loading_messages: loadingTexts }, null, 2)
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name.replace(/[^a-z0-9]/gi,"_") + ".mcpack";
  a.click();
};