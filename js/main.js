(() => {
  const PHONE = "556195068117";
  const ADDRESS = "QS 429, Conjunto A, Lote 03, Samambaia Norte, Brasília DF";
  const VISIT = "marcar uma visita para conhecer a academia";
  const AULAS = "saber quais aulas coletivas rodam nesta unidade";
  const VISIT_WA = "Olá! Gostaria de agendar uma visita para conhecer a Majori Fit. Quais horários estão disponíveis?";

  const toastEl = document.getElementById("toast");
  const menuBtn = document.getElementById("menuBtn");
  const top = document.querySelector(".top");
  const chips = [...document.querySelectorAll(".chip")];
  let intent = VISIT;
  let toastTimer = 0;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2800);
  }

  function waUrl(custom) {
    const text = `Olá, Majori Fit Samambaia. Quero ${custom}. Vim pelo site.`;
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  }

  function syncLinks() {
    const fixed = [
      ["waTop", VISIT],
      ["waHero", VISIT],
      ["waAulas", AULAS],
    ];
    fixed.forEach(([id, message]) => {
      const el = document.getElementById(id);
      if (el) el.href = waUrl(message);
    });
    const team = document.getElementById("waTeam");
    if (team) team.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(VISIT_WA)}`;
    ["waCta", "dock"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = waUrl(intent);
    });
  }

  document.querySelectorAll("#waTop, #waHero, #waAulas, #waTeam, #waCta, #waNav, #dock, .foot a[href*='wa.me']").forEach((el) => {
    el.addEventListener("click", () => {
      toast("Abrindo WhatsApp com a mensagem pronta. Esta página continua aberta.");
    });
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-on");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-pressed", "true");
      intent = chip.dataset.intent;
      syncLinks();
      toast("Mensagem pronta: " + chip.textContent.trim());
    });
  });

  function nowInBrasilia() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const weekday = get("weekday");
    const mins = Number(get("hour")) * 60 + Number(get("minute"));
    const weekend = weekday === "Sat" || weekday === "Sun";
    return { weekday, mins, weekend };
  }

  function status() {
    const t = nowInBrasilia();
    const open = t.weekend ? t.mins >= 8 * 60 && t.mins < 14 * 60 : t.mins >= 5 * 60 && t.mins < 23 * 60;
    const slot = t.weekend ? "weekend" : "weekday";
    let label;
    let detail;
    if (open) {
      label = "Aberta agora";
      detail = t.weekend ? "Aberta agora · fecha às 14h" : "Aberta agora · fecha às 23h";
    } else if (!t.weekend && t.mins < 5 * 60) {
      label = "Abre às 5h";
      detail = "Fechada · abre hoje às 5h";
    } else if (t.weekend && t.mins < 8 * 60) {
      label = "Abre às 8h";
      detail = "Fechada · abre hoje às 8h";
    } else if (t.weekday === "Fri") {
      label = "Abre sábado 8h";
      detail = "Fechada · sábado às 8h";
    } else if (t.weekday === "Sat") {
      label = "Abre domingo 8h";
      detail = "Fechada · domingo às 8h";
    } else if (t.weekday === "Sun") {
      label = "Abre segunda 5h";
      detail = "Fechada · segunda às 5h";
    } else {
      label = "Abre às 5h";
      detail = "Fechada · amanhã às 5h";
    }
    document.body.classList.toggle("is-open", open);
    document.querySelectorAll("[data-live-label]").forEach((el) => {
      el.textContent = label;
    });
    const hoursLive = document.getElementById("hoursLive");
    if (hoursLive) hoursLive.textContent = detail;
    document.querySelectorAll(".hours [data-slot]").forEach((row) => {
      row.classList.toggle("is-hot", open && row.dataset.slot === slot);
    });
  }

  document.getElementById("copyAddr").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      toast("Endereço copiado.");
    } catch {
      toast("Não foi possível copiar. Selecione o endereço: " + ADDRESS);
    }
  });

  function setMenu(open) {
    top.classList.toggle("is-open", open);
    document.body.classList.toggle("is-nav-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  menuBtn.addEventListener("click", () => {
    setMenu(!top.classList.contains("is-open"));
  });

  const nav = document.getElementById("nav");
  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && top.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  const navMap = [
    ["#treino", 'a[href="#treino"]'],
    ["#aulas", 'a[href="#aulas"]'],
    ["#unidade", 'a[href="#unidade"]'],
    ["#falar", 'a[href="#falar"]'],
  ];

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll(".nav a").forEach((a) => a.removeAttribute("aria-current"));
          const hit = navMap.find(([id]) => id === "#" + entry.target.id);
          if (hit) document.querySelector(hit[1])?.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    navMap.forEach(([id]) => {
      const el = document.querySelector(id);
      if (el) io.observe(el);
    });
  }

  const reel = document.getElementById("reel");
  reel?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") reel.classList.toggle("is-held");
  });

  syncLinks();
  status();
  setInterval(status, 30000);
})();
