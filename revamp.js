/* Revamp additions: typed hero line, card spotlight, scroll progress */
(function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // typed hero line
    var el = document.getElementById('typedWord');
    if (el && !reduced) {
        var words = ['break things', 'prove the exploit', 'kill the bug class', 'ship guardrails', 'write policy-as-code'];
        var w = 0, i = words[0].length, deleting = true;
        function step() {
            var word = words[w];
            el.textContent = word.slice(0, i);
            var delay = deleting ? 38 : 75;
            if (deleting && --i < 0) { deleting = false; w = (w + 1) % words.length; i = 0; delay = 300; }
            else if (!deleting && ++i > words[w].length) { deleting = true; i = words[w].length; delay = 1800; }
            setTimeout(step, delay);
        }
        setTimeout(step, 2200);
    }

    // cursor spotlight on cards
    if (!window.matchMedia('(pointer: coarse)').matches) {
        document.querySelectorAll('.highlight-card, .project-card, .certificate-card, .research-card, .impact, .skill-category')
            .forEach(function (c) {
                c.classList.add('spot');
                c.addEventListener('pointermove', function (e) {
                    var r = c.getBoundingClientRect();
                    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
                });
            });
    }

    // scroll progress
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
        var h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
        ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
})();
