(() => {
    const elements = Array.from(document.querySelectorAll(".mermaid"));
    if (!elements.length || !window.mermaid) return;

    const sources = elements.map((element) => element.textContent);
    let renderId = 0;
    let requestedScheme;

    function currentScheme() {
        return document.documentElement.dataset.scheme === "dark" ? "dark" : "light";
    }

    async function render() {
        const scheme = currentScheme();
        if (scheme === requestedScheme) return;
        requestedScheme = scheme;
        const activeRender = ++renderId;

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: scheme === "dark" ? "dark" : "default",
            flowchart: { htmlLabels: true, useMaxWidth: true },
        });

        elements.forEach((element, index) => {
            element.style.visibility = "hidden";
            element.removeAttribute("data-processed");
            element.textContent = sources[index];
        });

        try {
            await mermaid.run({ nodes: elements });
        } finally {
            if (activeRender !== renderId) return;
            elements.forEach((element) => {
                element.style.visibility = "";
            });
            document.dispatchEvent(new CustomEvent("mermaid:rendered", { detail: { scheme } }));
        }
    }

    render();
    window.addEventListener("onColorSchemeChange", render);
})();
