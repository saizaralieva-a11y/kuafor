(function () {
  const schedule = {
    0: { open: 10 * 60, close: 17 * 60, label: "10:00–17:00" },
    1: { open: 8 * 60, close: 21 * 60 + 30, label: "08:00–21:30" },
    2: { open: 8 * 60, close: 21 * 60 + 30, label: "08:00–21:30" },
    3: { open: 8 * 60, close: 21 * 60 + 30, label: "08:00–21:30" },
    4: { open: 8 * 60, close: 21 * 60 + 30, label: "08:00–21:30" },
    5: { open: 8 * 60, close: 21 * 60, label: "08:00–21:00" },
    6: { open: 8 * 60, close: 21 * 60 + 30, label: "08:00–21:30" },
  };

  const busy = {
    0: "Pazar öğlen daha sakiniz. 14:00 civarı biraz doluyoruz, hafta içine göre rahatız.",
    1: "Pazartesi akşam 17:00 civarı en dolu halimiz.",
    2: "Salı 16:00 civarı koltuklar doluyor.",
    3: "Çarşamba 15:00’ten sonra tempo artıyor.",
    4: "Perşembe akşam 18:00 sıraları en kalabalık vaktimiz.",
    5: "Cuma 19:00’a doğru günün en sıkışık saati. Biraz erken gelin ya da yazın.",
    6: "Cumartesi 16:00 civarı en doluyuz. Sabah daha rahatız.",
  };

  function istanbulNow() {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const parts = Object.fromEntries(
      fmt.formatToParts(new Date()).map((part) => [part.type, part.value])
    );
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: days[parts.weekday],
      minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  }

  const now = istanbulNow();
  const today = schedule[now.day];
  const open = now.minutes >= today.open && now.minutes < today.close;

  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = open ? "Şu an açık" : "Şu an kapalı";
    node.classList.toggle("is-open", open);
    node.classList.toggle("is-closed", !open);
  });

  document.querySelectorAll("[data-today-hours]").forEach((node) => {
    node.textContent = today.label;
  });

  const busyNote = document.querySelector("[data-busy]");
  if (busyNote) busyNote.textContent = busy[now.day];

  document.querySelectorAll("[data-day]").forEach((row) => {
    if (Number(row.dataset.day) === now.day) row.classList.add("is-today");
  });

  const header = document.querySelector("[data-header]");
  const dock = document.querySelector(".dock");
  const onScroll = () => {
    header.classList.toggle("is-stuck", window.scrollY > 8);
    dock.classList.toggle("is-visible", window.scrollY > 520);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const setNav = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNav(false)));

  const form = document.querySelector("[data-booking]");
  const error = document.querySelector("[data-form-error]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const services = data.getAll("service").map((item) => String(item).trim()).filter(Boolean);
    const day = String(data.get("day") || "").trim();
    const time = String(data.get("time") || "").trim();
    const note = String(data.get("note") || "").trim();

    if (!name || services.length === 0) {
      error.hidden = false;
      error.textContent = "Adınızı yazın ve en az bir işlem seçin.";
      return;
    }
    error.hidden = true;

    const lines = [
      "Merhaba Black Erkek Kuaförü, randevu almak istiyorum.",
      `Ad: ${name}`,
      `İşlem: ${services.join(", ")}`,
    ];
    if (day) lines.push(`Gün: ${day}`);
    if (time) lines.push(`Saat: ${time}`);
    if (note) lines.push(`Not: ${note}`);

    const url = `https://wa.me/905304597373?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
})();
