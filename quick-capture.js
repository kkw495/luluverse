// Luluverse 快速记录浮窗 - 独立模块，不依赖 app.js
(function () {
  const STORAGE_KEY = "luluverse-quick-captures";
  const TYPE_META = {
    question: { icon: "💡", label: "问题" },
    idea: { icon: "✨", label: "灵感" },
    todo: { icon: "✅", label: "待办" },
  };

  let currentType = "question";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function toast(msg) {
    let t = document.querySelector(".quick-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "quick-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  ready(() => {
    const fab = document.getElementById("quickFab");
    const panel = document.getElementById("quickPanel");
    const overlay = document.getElementById("quickOverlay");
    const input = document.getElementById("quickInput");
    const saveBtn = document.getElementById("quickSave");
    const cancelBtn = document.getElementById("quickCancel");
    const tabs = document.querySelectorAll(".quick-tab");
    const recentList = document.getElementById("quickRecentList");
    if (!fab || !panel) return;

    function open() {
      panel.classList.add("show");
      overlay.classList.add("show");
      renderRecent();
      setTimeout(() => input.focus(), 100);
    }
    function close() {
      panel.classList.remove("show");
      overlay.classList.remove("show");
      input.value = "";
    }

    function renderRecent() {
      const list = load()
        .filter((it) => it.type === currentType)
        .slice(0, 5);
      if (list.length === 0) {
        recentList.innerHTML =
          '<div class="quick-recent-empty">还没记录，写点什么吧</div>';
        return;
      }
      recentList.innerHTML = list
        .map(
          (it) => ` <div class="quick-recent-item"> <span class="quick-recent-icon">${TYPE_META[it.type].icon}</span> <span class="quick-recent-text">${escapeHtml(it.text)}</span> <button class="quick-recent-del" data-del="${ it.id }" aria-label="删除">×</button> </div> `
        )
        .join("");
    }

    fab.addEventListener("click", open);
    overlay.addEventListener("click", close);
    cancelBtn.addEventListener("click", close);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentType = tab.dataset.type;
        renderRecent();
      });
    });

    saveBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        toast("写点什么再保存吧");
        return;
      }
      const list = load();
      list.unshift({
        id: Date.now(),
        type: currentType,
        text,
        createdAt: new Date().toISOString(),
      });
      save(list.slice(0, 200));
      input.value = "";
      renderRecent();
      toast(`已记到「${TYPE_META[currentType].label}」`);
    });

    recentList.addEventListener("click", (e) => {
      const id = e.target.dataset.del;
      if (!id) return;
      const list = load().filter((it) => String(it.id) !== id);
      save(list);
      renderRecent();
    });

    // 快捷键：Cmd/Ctrl + Enter 保存
    input.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        saveBtn.click();
      }
    });

    // ESC 关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("show")) close();
    });
  });
})();