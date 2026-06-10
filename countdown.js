// Luluverse 倒计时 banner - 独立模块
(function () {
  const STORAGE_KEY = "luluverse-countdowns";
  const DEFAULTS = [
    { id: 1, label: "法考客观题", date: "2027-09-18", icon: "⚖️" },
    { id: 2, label: "考研初试", date: "2027-12-25", icon: "📚" },
  ];

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(data)) return data;
      return DEFAULTS;
    } catch (e) {
      return DEFAULTS;
    }
  }
  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
  }

  function classify(days) {
    if (days === null) return "normal";
    if (days < 0) return "past";
    if (days === 0) return "today";
    if (days <= 7) return "danger";
    if (days <= 30) return "urgent";
    return "normal";
  }

  function formatBadge(days) {
    if (days === null) return "未设置";
    if (days < 0) return `已过 ${-days} 天`;
    if (days === 0) return "就是今天";
    return `还有 ${days} 天`;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s || "";
    return div.innerHTML;
  }

  function renderCards() {
    const list = load();
    if (list.length === 0) {
      return '<div class="countdown-empty">还没设置倒计时，点右边 ⚙️ 添加</div>';
    }
    return list
      .map((item) => {
        const days = daysUntil(item.date);
        const color = classify(days);
        return ` <div class="countdown-card countdown-${color}"> <div class="countdown-icon">${escapeHtml(item.icon) || "⏳"}</div> <div class="countdown-info"> <div class="countdown-label">${escapeHtml(item.label)}</div> <div class="countdown-days">${formatBadge(days)}</div> </div> </div> `;
      })
      .join("");
  }

  function injectBanner(main) {
    if (!main) return;
    let banner = main.querySelector(".countdown-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "countdown-banner";
      banner.innerHTML = ` <div class="countdown-list"></div> <button class="countdown-settings" aria-label="管理倒计时">⚙️</button> `;
      const page = main.querySelector(".page");
      if (page) {
        page.insertBefore(banner, page.firstChild);
      } else {
        main.insertBefore(banner, main.firstChild);
      }
      banner
        .querySelector(".countdown-settings")
        .addEventListener("click", openSettings);
    }
    banner.querySelector(".countdown-list").innerHTML = renderCards();
  }

  function openSettings() {
    let modal = document.getElementById("countdownModal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "countdownModal";
    modal.className = "countdown-modal show";
    modal.innerHTML = ` <div class="countdown-modal-content"> <div class="countdown-modal-header"> <h2>⏳ 管理倒计时</h2> <button class="countdown-modal-close" aria-label="关闭">×</button> </div> <div class="countdown-modal-body"> <div class="countdown-edit-list"></div> <button class="countdown-add-btn">+ 新增倒计时</button> <button class="countdown-save-btn">保存</button> </div> </div> `;
    document.body.appendChild(modal);

    function renderEditList() {
      const cur = load();
      const editList = modal.querySelector(".countdown-edit-list");
      if (cur.length === 0) {
        editList.innerHTML =
          '<div class="countdown-empty-hint">还没有倒计时，点下方「新增」</div>';
        return;
      }
      editList.innerHTML = cur
        .map(
          (item) => ` <div class="countdown-edit-item" data-id="${item.id}"> <input class="countdown-edit-icon" value="${escapeHtml( item.icon )}" maxlength="2" placeholder="🎯" /> <input class="countdown-edit-label" value="${escapeHtml( item.label )}" placeholder="事件名称" /> <input class="countdown-edit-date" type="date" value="${ item.date || "" }" /> <button class="countdown-edit-del" data-del="${ item.id }" aria-label="删除">×</button> </div> `
        )
        .join("");
    }
    renderEditList();

    function collect() {
      return Array.from(modal.querySelectorAll(".countdown-edit-item")).map(
        (row) => ({
          id: Number(row.dataset.id),
          icon: row.querySelector(".countdown-edit-icon").value.trim(),
          label: row.querySelector(".countdown-edit-label").value.trim(),
          date: row.querySelector(".countdown-edit-date").value,
        })
      );
    }

    function refresh() {
      const main = document.getElementById("main");
      injectBanner(main);
    }

    modal.querySelector(".countdown-add-btn").addEventListener("click", () => {
      const cur = collect();
      cur.push({ id: Date.now(), label: "", date: "", icon: "🎯" });
      save(cur);
      renderEditList();
    });

    modal
      .querySelector(".countdown-edit-list")
      .addEventListener("click", (e) => {
        const delId = e.target.dataset.del;
        if (!delId) return;
        const cur = collect().filter((it) => String(it.id) !== delId);
        save(cur);
        renderEditList();
      });

    function closeModal() {
      const items = collect().filter((it) => it.label && it.date);
      save(items);
      refresh();
      modal.remove();
    }

    modal
      .querySelector(".countdown-modal-close")
      .addEventListener("click", closeModal);
    modal
      .querySelector(".countdown-save-btn")
      .addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    const main = document.getElementById("main");
    if (!main) return;

    function tryInject() {
      const activeBtn = document.querySelector(".nav-btn.active");
      if (activeBtn && activeBtn.dataset.page === "dashboard") {
        injectBanner(main);
      }
    }

    setTimeout(tryInject, 600);
    const observer = new MutationObserver(() => tryInject());
    observer.observe(main, { childList: true });
  });
})();