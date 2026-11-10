(() => {
  const PHONE = "556195068117";
  const ADDRESS = "QS 429, Conjunto A, Lote 03, Samambaia Norte, Brasília DF, CEP 72329-521";

  const toastEl = document.getElementById("toast");
  const waIds = ["waTop", "waHero", "waCta", "dock", "waTeam", "modWa"];
  const chips = [...document.querySelectorAll(".chip")];
  const menuBtn = document.getElementById("menuBtn");
  const top = document.querySelector(".top");
  let intent = "marcar uma visita para conhecer a academia";
  let toastTimer = 0;

  const mods = {
    musculacao: {
      title: "Musculação",
      text: "Treino de força com acompanhamento no piso. Peça avaliação e montagem de treino na visita.",
      img: "assets/photos/floor.jpg",
      intent: "saber da musculação e marcar avaliação",
    },
    fitdance: {
      title: "Fit Dance",
      text: "Aula com coreografia e gasto calórico. Confirme o horário da turma no WhatsApp antes de ir.",
      img: "assets/photos/class.jpg",
      intent: "saber o horário de Fit Dance",
    },
    funcional: {
      title: "Funcional",
      text: "Circuito de força, core e condicionamento. Bom pra quem quer treino completo em grupo.",
      img: "assets/photos/weights.jpg",
      intent: "saber da aula de funcional",
    },
    pilates: {
      title: "Pilates",
      text: "Consciência corporal, postura e força. Vaga e horário se confirmam na recepção.",
      img: "assets/photos/class.jpg",
      intent: "saber da aula de pilates",
    },
    jump: {
      title: "Jump",
      text: "Cardio em mini trampolim, aula rápida e intensa. Grade do dia no WhatsApp.",
      img: "assets/photos/cardio.jpg",
      intent: "saber da aula de jump",
    },
    bike: {
      title: "Bike",
      text: "Indoor bike pra perna, glúteo e pulmão. Pergunte as turmas com vaga.",
      img: "assets/photos/machines.jpg",
      intent: "saber da aula de bike",
    },
  };

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
  }

  function waUrl(custom) {
    const text = `Olá, Majori Fit Samambaia. Quero ${custom || intent}. Vim pelo site.`;
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  }

  function syncLinks() {
    ["waTop", "waHero", "waCta", "dock", "waTeam"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = waUrl();
    });
  }

  function onWaClick() {
    toast("Abrindo WhatsApp com a mensagem pronta.");
  }

  waIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", onWaClick);
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

  document.querySelectorAll(".mod-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = mods[btn.dataset.mod];
      document.querySelectorAll(".mod-tabs button").forEach((b) => {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      document.getElementById("modTitle").textContent = data.title;
      document.getElementById("modText").textContent = data.text;
      const img = document.getElementById("modImg");
      img.src = data.img;
      img.alt = data.title + ", foto ilustrativa";
      const modWa = document.getElementById("modWa");
      modWa.dataset.intent = data.intent;
      modWa.href = waUrl(data.intent);
      toast(data.title + " selecionada.");
    });
  });

  const modWa = document.getElementById("modWa");
  modWa.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = waUrl(modWa.dataset.intent || mods.musculacao.intent);
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
      label = "Abre 8h";
      detail = "Fechada · sábado às 8h";
    } else if (t.weekend) {
      label = "Abre 5h";
      detail = "Fechada · segunda às 5h";
    } else {
      label = "Abre 5h";
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
      toast("Copie: " + ADDRESS);
    }
  });

  menuBtn.addEventListener("click", () => {
    const open = top.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Fechar" : "Menu";
  });

  document.querySelectorAll(".nav a").forEach((a) => {
    a.addEventListener("click", () => {
      top.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  const navMap = [
    ["#treino", 'a[href="#treino"]'],
    ["#aulas", 'a[href="#aulas"]'],
    ["#estrutura", 'a[href="#estrutura"]'],
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

  function heroMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof gsap === "undefined") return;
    gsap.from(".hero-photo", { scale: 1.06, duration: 1.05, ease: "power2.out" });
    gsap.from(".hero-inner", { y: 18, duration: 0.6, ease: "power3.out" });
  }

  chips[0]?.setAttribute("aria-pressed", "true");
  syncLinks();
  status();
  setInterval(status, 30000);
  heroMotion();
})();
