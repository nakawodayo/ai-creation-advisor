import { initialPrompt } from "./prompts";

// Viteの場合: import.meta.env.VITE_OPENAI_API_KEY
// Webpackなら process.env.OPENAI_API_KEY などの設定方法を想定
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_FALLBACK_API_KEY";

//--------------------------------------------------
// 1. OpenAI 連携用の関数
//--------------------------------------------------
async function fetchAIResponse(userText: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // 必要に応じて変更
        messages: [{ role: "user", content: userText }],
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "エラーが発生しました。";
  }
}

//--------------------------------------------------
// 2. UI要素の取得と画面制御
//--------------------------------------------------
function getUIElements() {
  return {
    startButton: document.getElementById("start-button") as HTMLButtonElement | null,
    settingsButton: document.getElementById("settings-button") as HTMLButtonElement | null,
    backButton: document.getElementById("back-button") as HTMLButtonElement | null,
    submitButton: document.getElementById("submit-button") as HTMLButtonElement | null,
    homeButton: document.getElementById("home-button") as HTMLButtonElement | null,

    topScreen: document.getElementById("top-screen") as HTMLDivElement | null,
    dialogueScreen: document.getElementById("dialogue-screen") as HTMLDivElement | null,
    settingsScreen: document.getElementById("settings-screen") as HTMLDivElement | null,

    aiMessage: document.getElementById("ai-message") as HTMLDivElement | null,
    userInput: document.getElementById("user-input") as HTMLInputElement | null,

    optionButtons: document.querySelectorAll<HTMLButtonElement>('.option'),
  };
}

//--------------------------------------------------
// 3. 各種イベントハンドラのセットアップ
//--------------------------------------------------

// 画面遷移や画面表示切り替え
function initNavigation(ui: ReturnType<typeof getUIElements>) {
  const {
    startButton,
    settingsButton,
    backButton,
    homeButton,
    topScreen,
    dialogueScreen,
    settingsScreen,
    aiMessage,
  } = ui;

  // TOP画面から対話画面へ移動
  if (startButton && topScreen && dialogueScreen && aiMessage) {
    startButton.addEventListener("click", async () => {
      topScreen.style.display = "none";
      dialogueScreen.style.display = "block";

      aiMessage.textContent = "AIの応答を取得中...";
      const response = await fetchAIResponse(initialPrompt);
      aiMessage.textContent = response;
    });
  }

  // TOP画面 -> プロンプト設定画面
  if (settingsButton && topScreen && settingsScreen) {
    settingsButton.addEventListener("click", () => {
      topScreen.style.display = "none";
      settingsScreen.style.display = "block";
    });
  }

  // 設定画面 -> TOP画面
  if (backButton && settingsScreen && topScreen) {
    backButton.addEventListener("click", () => {
      settingsScreen.style.display = "none";
      topScreen.style.display = "block";
    });
  }

  // ホームボタンで最初に戻る
  if (homeButton && dialogueScreen && topScreen) {
    homeButton.addEventListener("click", () => {
      dialogueScreen.style.display = "none";
      if (settingsScreen) {
        settingsScreen.style.display = "none";
      }
      topScreen.style.display = "flex"; // または "block"
    });
  }
}

// Yes/Noボタン用
function initYesNoButtons(ui: ReturnType<typeof getUIElements>) {
  const { optionButtons, aiMessage } = ui;

  optionButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userText = btn.dataset.value || "";
      if (!aiMessage) return;

      aiMessage.textContent = "AIの応答を取得中...";
      const response = await fetchAIResponse(userText);
      aiMessage.textContent = response;
    });
  });
}

// 自由入力用
function initSubmitHandler(ui: ReturnType<typeof getUIElements>) {
  const { submitButton, userInput, aiMessage } = ui;

  if (submitButton && userInput && aiMessage) {
    submitButton.addEventListener("click", async () => {
      const userText = userInput.value.trim();
      if (!userText) return;

      aiMessage.textContent = "AIの応答を取得中...";
      const response = await fetchAIResponse(userText);
      aiMessage.textContent = response;
      userInput.value = "";
    });
  }
}

//--------------------------------------------------
// 4. エントリーポイント
//--------------------------------------------------
function initApp() {
  console.log("✅ ページが読み込まれました");

  const ui = getUIElements();

  // 画面遷移イベント
  initNavigation(ui);
  // Yes/Noボタンイベント
  initYesNoButtons(ui);
  // ユーザー入力イベント
  initSubmitHandler(ui);
}

//--------------------------------------------------
// 5. DOMContentLoaded で初期化
//--------------------------------------------------
document.addEventListener("DOMContentLoaded", initApp);
