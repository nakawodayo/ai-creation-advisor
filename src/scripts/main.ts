interface FlowStep {
  id: string;
  question: string;
  options?: Record<string, string>;
  input: "yes/no" | "ai assistant" | "end" | string;
}

// 環境変数を読み込む
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// フローチャートデータを保持する変数（外部からfetchする）
let flowData: { steps: FlowStep[] } | null = null;

// 現在のステップID
let currentStepId: string = "1";

// DOM要素の取得
const questionEl = document.getElementById("question") as HTMLDivElement;
const yesNoButtonsEl = document.getElementById("yesNoButtons") as HTMLDivElement;
const yesBtn = document.getElementById("yesBtn") as HTMLButtonElement;
const noBtn = document.getElementById("noBtn") as HTMLButtonElement;
const app = document.getElementById("app") as HTMLDivElement;
const aiAssistantArea = document.getElementById("aiAssistantArea") as HTMLDivElement;
const aiInput = document.getElementById("aiInput") as HTMLTextAreaElement;
const aiSubmit = document.getElementById("aiSubmit") as HTMLButtonElement;
const resetContainer = document.getElementById("resetContainer") as HTMLDivElement;
// 「最初からやり直す」ボタン
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    console.log("Reset button clicked.");
    currentStepId = "1";   // 1番のステップに戻す
    showStep(currentStepId);
  });
}

/**
 * flowchart.json を読み込み、flowDataを初期化してから初回ステップを表示する
 */
async function initFlowchart() {
  try {
    console.log("Initializing flowchart...");
    // flowchart.jsonをfetch
    const response = await fetch("/flowchart.json");
    if (!response.ok) {
      throw new Error("flowchart.jsonの読み込みに失敗しました。");
    }
    flowData = await response.json();
    console.log("Flowchart data loaded:", flowData);

    // 初期ステップを表示
    showStep(currentStepId);
  } catch (error) {
    console.error("Error initializing flowchart:", error);
    questionEl.textContent = "フローチャートの読み込みに失敗しました。";
  }
}

/**
 * ステップIDから該当ステップを取り出す
 */
function getStepById(id: string): FlowStep | undefined {
  console.log("Getting step by ID:", id);
  return flowData?.steps.find((step) => step.id === id);
}

/**
 * 指定したステップを画面に表示する
 */
function showStep(stepId: string) {
  console.log("Showing step:", stepId);

  // 終了ステップの処理
  if (stepId === "end") {
    console.warn("End of flowchart reached.");
    questionEl.textContent = "フローチャートが終了しました。お疲れさまでした。";

    yesNoButtonsEl.classList.add("hidden");
    resetContainer.classList.remove("hidden");
    resetBtn?.classList.remove("hidden");

    // AIアシスタントエリアを削除
    if (aiAssistantArea.parentNode) {
      aiAssistantArea.remove();
    }
    return;
  }

  // 通常のステップ処理
  const step = getStepById(stepId);
  if (!step) {
    console.warn("Step not found, showing end message.");
    showStep("end");
    return;
  }

  // 質問を表示
  questionEl.textContent = step.question;

  // 入力形式ごとの処理
  if (step.input === "yes/no") {
    yesNoButtonsEl.classList.remove("hidden");
    if (stepId !== "1") {
      resetContainer.classList.remove("hidden");
      resetBtn?.classList.remove("hidden");
    } else {
      resetContainer.classList.add("hidden");
      resetBtn?.classList.add("hidden");
    }
    if (aiAssistantArea.parentNode) {
      aiAssistantArea.remove();
    }
  } else if (step.input === "ai assistant") {
    yesNoButtonsEl.classList.add("hidden");
    resetContainer.classList.remove("hidden");
    resetBtn?.classList.remove("hidden");
    if (!aiAssistantArea.parentNode) {
      app.appendChild(aiAssistantArea);
    }
  }
}


/**
 * 次のステップに遷移する
 */
function goToNextStep(optionKey: string) {
  console.log("Going to next step with option:", optionKey);
  if (!flowData) {
    console.warn("Flow data not loaded.");
    return;
  }

  const step = getStepById(currentStepId);
  if (!step || !step.options) {
    console.warn("Current step or options not found.");
    return;
  }

  const nextStepId = step.options[optionKey];
  if (!nextStepId || nextStepId === "end") {
    console.log("Next step is end.");
    currentStepId = "end";
    showStep(currentStepId);
    return;
  }

  currentStepId = nextStepId;
  console.log("Next step ID:", currentStepId);
  showStep(currentStepId);
}

// Yes/No ボタンイベント
yesBtn.addEventListener("click", () => {
  console.log("Yes button clicked.");
  goToNextStep("Yes");
});
noBtn.addEventListener("click", () => {
  console.log("No button clicked.");
  goToNextStep("No");
});

// AIアシスタント用入力（箇条書きなど）送信イベント
aiSubmit.addEventListener("click", async () => {
  const userInput = aiInput.value.trim();
  console.log("AI submit clicked with input:", userInput);
  if (!userInput) {
    alert("入力が空です。何か入力してから送信してください。");
    return;
  }

  try {
    // OpenAI API リクエストの作成
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: userInput }],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    const aiReply = responseData.choices[0].message.content;
    console.log("AI Response:", aiReply);

    alert(`AIの回答: ${aiReply}`);
    aiInput.value = "";

    goToNextStep("Next");
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    alert("AIの応答を取得できませんでした。");
  }
});


// アプリ起動時にフローチャートを初期化
initFlowchart();
