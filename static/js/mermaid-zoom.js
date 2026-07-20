(() => {
    const selector = ".article-content .mermaid";
    let overlay;
    let canvas;
    let previousFocus;

    function close() {
        if (!overlay || overlay.hidden) return;

        overlay.hidden = true;
        canvas.replaceChildren();
        document.body.classList.remove("mermaid-zoom-open");
        previousFocus?.focus();
    }

    function createOverlay() {
        overlay = document.createElement("div");
        overlay.className = "mermaid-zoom";
        overlay.hidden = true;
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Mermaid 图表大图");

        const closeButton = document.createElement("button");
        closeButton.className = "mermaid-zoom__close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "关闭大图");
        closeButton.textContent = "×";
        closeButton.addEventListener("click", close);

        canvas = document.createElement("div");
        canvas.className = "mermaid-zoom__canvas";

        overlay.append(closeButton, canvas);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") close();
        });
        document.body.append(overlay);
    }

    function open(svg, trigger) {
        if (!overlay) createOverlay();

        const clone = svg.cloneNode(true);
        const viewBox = svg.viewBox.baseVal;
        const width = Math.min(Math.max(viewBox.width || 0, 960), 2400);
        clone.removeAttribute("width");
        clone.removeAttribute("height");
        clone.style.width = `${width}px`;

        overlay.style.setProperty(
            "--mermaid-zoom-canvas",
            document.documentElement.dataset.scheme === "dark" ? "#111827" : "#fff",
        );

        previousFocus = trigger;
        canvas.replaceChildren(clone);
        overlay.hidden = false;
        document.body.classList.add("mermaid-zoom-open");
        overlay.querySelector("button").focus();
    }

    function bind(container) {
        if (container.dataset.zoomReady) return;

        if (!container.querySelector("svg")) return;

        container.dataset.zoomReady = "true";
        container.tabIndex = 0;
        container.setAttribute("role", "button");
        container.setAttribute("aria-label", "点击打开 Mermaid 图表大图");
        container.addEventListener("click", () => {
            const svg = container.querySelector("svg");
            if (svg) open(svg, container);
        });
        container.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            const svg = container.querySelector("svg");
            if (svg) open(svg, container);
        });
    }

    function bindAll() {
        document.querySelectorAll(selector).forEach(bind);
    }

    const observer = new MutationObserver(bindAll);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindAll, { once: true });
    } else {
        bindAll();
    }
})();
