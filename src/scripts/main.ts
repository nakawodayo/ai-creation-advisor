// TypeScriptの基本セットアップ

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ ページが読み込まれました");

    // UI要素の取得
    const startButton = document.getElementById("start-button") as HTMLButtonElement | null;
    const settingsButton = document.getElementById("settings-button") as HTMLButtonElement | null;
    const backButton = document.getElementById("back-button") as HTMLButtonElement | null;
    const submitButton = document.getElementById("submit-button") as HTMLButtonElement | null;
    const homeButton = document.getElementById("home-button") as HTMLButtonElement | null;

    const topScreen = document.getElementById("top-screen") as HTMLDivElement | null;
    const dialogueScreen = document.getElementById("dialogue-screen") as HTMLDivElement | null;
    const settingsScreen = document.getElementById("settings-screen") as HTMLDivElement | null;
    const aiMessage = document.getElementById("ai-message") as HTMLDivElement | null;
    const userInput = document.getElementById("user-input") as HTMLInputElement | null;

    // 画面遷移の処理
    if (startButton && topScreen && dialogueScreen) {
        startButton.addEventListener("click", () => {
            topScreen.style.display = "none";
            dialogueScreen.style.display = "block";
        });
    }

    if (settingsButton && topScreen && settingsScreen) {
        settingsButton.addEventListener("click", () => {
            topScreen.style.display = "none";
            settingsScreen.style.display = "block";
        });
    }

    if (backButton && settingsScreen && topScreen) {
        backButton.addEventListener("click", () => {
            settingsScreen.style.display = "none";
            topScreen.style.display = "block";
        });
    }

    if (homeButton && dialogueScreen && topScreen) {
        homeButton.addEventListener("click", () => {
            // すべての画面を非表示にする
            dialogueScreen.style.display = "none";
            
            if (settingsScreen) { 
                settingsScreen.style.display = "none";
            }
    
            // TOP画面を表示
            topScreen.style.display = "flex"; // 必要に応じて "block" に変更
        });
    }
    

    // OpenAI APIの連携（仮）
    async function fetchAIResponse(userText: string): Promise<string> {
        const apiKey = "YOUR_OPENAI_API_KEY";
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userText }],
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // ユーザーが送信したときの処理
    if (submitButton && userInput && aiMessage) {
        submitButton.addEventListener("click", async () => {
            const userText = userInput.value.trim();
            if (userText === "") return;

            aiMessage.textContent = "AIの応答を取得中...";
            const response = await fetchAIResponse(userText);
            aiMessage.textContent = response;
            userInput.value = "";
        });
    }
});
