/* ============================================================
   ANIMATION LAYER — loader, cursor, GSAP scroll effects,
   3D character mascot, tech-stack ball pit.
   Inspired by himanshugupta15.com
   ============================================================ */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGSAP = typeof gsap !== 'undefined';
    var hasTHREE = typeof THREE !== 'undefined';
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion) document.body.classList.add('no-motion');

    /* ================= LOADING SCREEN ================= */
    function initLoader() {
        var screen = document.getElementById('loadingScreen');
        if (!screen) return;
        if (reducedMotion) { screen.remove(); startIntro(); return; }

        document.documentElement.style.overflow = 'hidden';
        var wrap = document.getElementById('loadingWrap');
        var pctEl = document.getElementById('loadingPct');
        var labelEl = document.getElementById('loadingLabel');
        var pct = 0, done = false, loaded = false, entered = false;

        window.addEventListener('load', function () { loaded = true; });
        setTimeout(function () { loaded = true; }, 5000); // safety

        var tick = setInterval(function () {
            var target = loaded ? 100 : 88;
            pct += Math.max(1, Math.round((target - pct) * 0.12));
            if (pct >= 100) { pct = 100; }
            pctEl.textContent = pct + '%';
            if (pct === 100 && !done) {
                done = true;
                clearInterval(tick);
                labelEl.textContent = 'ENTER';
                pctEl.textContent = '';
                wrap.classList.add('loading-complete');
            }
        }, 60);

        // glow follows mouse inside button
        wrap.addEventListener('mousemove', function (e) {
            var r = wrap.getBoundingClientRect();
            wrap.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
            wrap.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
        });

        function enter() {
            if (!done || entered) return;
            entered = true;
            wrap.classList.add('loading-clicked');
            screen.classList.add('loading-done');
            document.documentElement.style.overflow = '';
            setTimeout(startIntro, 500);
            setTimeout(function () { screen.remove(); }, 1800);
        }
        wrap.addEventListener('click', enter);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') enter();
        });
    }

    /* ================= HERO INTRO ================= */
    function startIntro() {
        if (!hasGSAP || reducedMotion) return;
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo('.hero-status', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6 })
          .fromTo('.hero-keywords span', { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: .8, stagger: .07 }, '-=.3')
          .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, '-=.4')
          .fromTo('.hero-description', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, '-=.4')
          .fromTo('.hero-buttons .btn', { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: .5, stagger: .08 }, '-=.35')
          .fromTo('.hero-character', { opacity: 0, scale: .92 },
              { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, '-=.8')
          .fromTo('.character-plate', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5 }, '-=.4');
    }

    /* ================= CUSTOM CURSOR ================= */
    function initCursor() {
        if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
        var cur = document.createElement('div');
        cur.className = 'cursor-main cursor-hidden';
        document.body.appendChild(cur);
        var tx = -100, ty = -100, x = -100, y = -100;
        document.addEventListener('mousemove', function (e) {
            tx = e.clientX; ty = e.clientY;
            cur.classList.remove('cursor-hidden');
        });
        document.addEventListener('mouseleave', function () { cur.classList.add('cursor-hidden'); });
        (function loop() {
            x += (tx - x) * 0.16; y += (ty - y) * 0.16;
            cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            requestAnimationFrame(loop);
        })();
        document.querySelectorAll('a, button, .accordion-header, .skill-item').forEach(function (el) {
            el.addEventListener('mouseenter', function () { cur.classList.add('cursor-hovering'); });
            el.addEventListener('mouseleave', function () { cur.classList.remove('cursor-hovering'); });
        });
    }

    /* ================= NAV: letter-roll + fade ================= */
    function initNav() {
        document.querySelectorAll('.nav-link').forEach(function (a) {
            var text = a.textContent.trim();
            a.classList.add('hover-link');
            a.innerHTML = '<span class="hover-mask"><span class="hover-in">' + text +
                '<span class="hover-dup">' + text + '</span></span></span>';
        });
        var fade = document.createElement('div');
        fade.className = 'nav-fade';
        document.body.appendChild(fade);
        window.addEventListener('scroll', function () {
            fade.classList.toggle('visible', window.scrollY > 200);
        }, { passive: true });
    }

    /* ================= SCROLL REVEALS ================= */
    function initReveals() {
        if (!hasGSAP || reducedMotion) return;

        // section titles
        document.querySelectorAll('.section-title').forEach(function (el) {
            gsap.fromTo(el, { y: 50, opacity: 0 }, {
                y: 0, opacity: 1, duration: .9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // card grids — staggered
        [['.highlights-grid', '.highlight-card'],
         ['.certificates-grid', '.certificate-card'],
         ['.projects-grid', '.project-card'],
         ['.research-grid', '.research-card'],
         ['.skills-grid', '.skill-category'],
         ['.about-stats', '.stat']].forEach(function (pair) {
            var grid = document.querySelector(pair[0]);
            if (!grid) return;
            gsap.fromTo(grid.querySelectorAll(pair[1]), { y: 60, opacity: 0 }, {
                y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out',
                clearProps: 'transform',
                scrollTrigger: { trigger: grid, start: 'top 82%' }
            });
        });

        // accordion items slide in from left
        gsap.utils.toArray('.accordion-item').forEach(function (el, i) {
            gsap.fromTo(el, { x: -60, opacity: 0 }, {
                x: 0, opacity: 1, duration: .7, delay: i * .05, ease: 'power3.out',
                clearProps: 'transform',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // about image
        var aboutImg = document.querySelector('.about-image');
        if (aboutImg) {
            gsap.fromTo(aboutImg, { x: 60, opacity: 0 }, {
                x: 0, opacity: 1, duration: .9, ease: 'power3.out',
                clearProps: 'transform',
                scrollTrigger: { trigger: aboutImg, start: 'top 85%' }
            });
        }

        // word-by-word blur reveal on about paragraphs (scrubbed)
        document.querySelectorAll('.about-text > p').forEach(function (p) {
            p.classList.add('wreveal');
            p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) {
                return '<span class="w">' + w + '</span>';
            }).join(' ');
            var words = p.querySelectorAll('.w');
            ScrollTrigger.create({
                trigger: p, start: 'top 88%', end: 'bottom 45%', scrub: true,
                onUpdate: function (self) {
                    var n = Math.floor(self.progress * words.length * 1.4);
                    words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
                },
                onLeave: function () { words.forEach(function (w) { w.classList.add('on'); }); }
            });
        });

        // corner brackets + flicker on highlight cards
        document.querySelectorAll('.highlight-card').forEach(function (card) {
            card.classList.add('corner-box');
            ['cb1', 'cb2', 'cb3', 'cb4'].forEach(function (c) {
                var d = document.createElement('span');
                d.className = 'cb ' + c;
                card.appendChild(d);
            });
            ScrollTrigger.create({
                trigger: card, start: 'top 85%', once: true,
                onEnter: function () {
                    card.classList.add('cb-on');
                    var h = card.querySelector('h3');
                    if (h) { h.classList.add('flicker-in'); h.classList.add('on'); }
                }
            });
        });

        // experience timeline — growing glow line + traveling dot
        var container = document.querySelector('.accordion-container');
        if (container) {
            var line = document.createElement('div');
            line.className = 'career-timeline';
            var dot = document.createElement('div');
            dot.className = 'career-dot';
            container.appendChild(line);
            container.appendChild(dot);
            ScrollTrigger.create({
                trigger: container, start: 'top 78%', end: 'bottom 60%', scrub: .5,
                onUpdate: function (self) {
                    var p = self.progress;
                    line.style.setProperty('--tl', p);
                    dot.style.top = Math.min(p * 100, 97) + '%';
                    dot.style.opacity = p >= .999 ? '0' : '1';
                }
            });
            // accordion toggles change layout — remeasure triggers
            document.querySelectorAll('.accordion-header').forEach(function (h) {
                h.addEventListener('click', function () {
                    setTimeout(function () { ScrollTrigger.refresh(); }, 550);
                });
            });
        }

        // gentle parallax on hero circles
        gsap.to('.hero-circle', {
            yPercent: 30, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    /* ================= 3D CHARACTER MASCOT ================= */
    function initCharacter() {
        var mount = document.getElementById('character3d');
        if (!mount || !hasTHREE || reducedMotion) return;

        var W = mount.clientWidth, H = mount.clientHeight;
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
        camera.position.set(0, 0.55, 4.6);
        camera.lookAt(0, 0.32, 0);
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(renderer.domElement);

        // lights — soft hemisphere base, teal key, magenta rim
        scene.add(new THREE.HemisphereLight(0x44566e, 0x0a0f18, .75));
        scene.add(new THREE.AmbientLight(0x8899aa, 0.35));
        var key = new THREE.DirectionalLight(0xffffff, 0.75);
        key.position.set(2, 4, 3);
        scene.add(key);
        var rimT = new THREE.PointLight(0x5eead4, 1.3, 12);
        rimT.position.set(-3, 1.5, 1.5);
        scene.add(rimT);
        var rimM = new THREE.PointLight(0xf472b6, 1.0, 12);
        rimM.position.set(3, 2.5, -1);
        scene.add(rimM);
        var back = new THREE.PointLight(0x67e8f9, .8, 10);
        back.position.set(0, 2.2, -2.5);
        scene.add(back);

        var char = new THREE.Group();
        var headGroup = new THREE.Group();

        var cloakMat = new THREE.MeshStandardMaterial({ color: 0x0d1017, roughness: .85, metalness: .05 });
        var cloakInner = new THREE.MeshStandardMaterial({ color: 0x070a10, roughness: .95 });
        var voidMat = new THREE.MeshBasicMaterial({ color: 0x01030a });
        var eyeMat = new THREE.MeshBasicMaterial({ color: 0x5eead4 });

        // ---- hood (lathe profile: opens toward camera) ----
        var hoodPts = [];
        [[0, .62], [.30, .58], [.48, .44], [.56, .22], [.55, 0], [.48, -.22], [.40, -.38]]
            .forEach(function (p) { hoodPts.push(new THREE.Vector2(p[0], p[1])); });
        var hood = new THREE.Mesh(new THREE.LatheGeometry(hoodPts, 56), cloakMat);
        hood.scale.set(1, 1.12, 1);
        hood.rotation.x = .22;
        headGroup.add(hood);
        // hood rim (front opening)
        var rim = new THREE.Mesh(new THREE.TorusGeometry(.47, .055, 14, 40), cloakMat);
        rim.position.set(0, .02, .28);
        rim.rotation.x = -.32;
        headGroup.add(rim);
        // shadow behind the mask
        var faceShadow = new THREE.Mesh(new THREE.SphereGeometry(.40, 28, 28), voidMat);
        faceShadow.position.set(0, .02, .12);
        faceShadow.scale.set(1, 1.15, .7);
        headGroup.add(faceShadow);

        // ---- Guy Fawkes style mask ----
        var mask = new THREE.Group();
        var maskMat = new THREE.MeshPhysicalMaterial({
            color: 0xf5f2ea, roughness: .18, metalness: 0,
            clearcoat: 1, clearcoatRoughness: .25
        });
        var featMat = new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: .5 });
        var blushMat = new THREE.MeshStandardMaterial({ color: 0xd98f8f, roughness: .6 });
        // face shell — tapers to a pointed chin
        var shell = new THREE.Mesh(new THREE.SphereGeometry(.40, 56, 56), maskMat);
        shell.scale.set(.92, 1.22, .5);
        mask.add(shell);
        var chin = new THREE.Mesh(new THREE.ConeGeometry(.20, .34, 24), maskMat);
        chin.position.set(0, -.44, .05);
        chin.rotation.x = .28;
        chin.scale.set(1, 1, .55);
        mask.add(chin);
        // eye holes — dark almonds with a faint teal glint
        var eyes = [];
        [-1, 1].forEach(function (s) {
            var hole = new THREE.Mesh(new THREE.SphereGeometry(.085, 20, 20), featMat);
            hole.position.set(s * .155, .10, .175);
            hole.scale.set(1.25, .72, .35);
            hole.rotation.z = s * .18;
            mask.add(hole);
            var glint = new THREE.Mesh(new THREE.SphereGeometry(.018, 12, 12), eyeMat);
            glint.position.set(s * .15, .10, .20);
            mask.add(glint);
            eyes.push(glint);
        });
        // raised eyebrows — outer ends angled up toward the temples
        [-1, 1].forEach(function (s) {
            var brow = new THREE.Mesh(new THREE.BoxGeometry(.135, .022, .02), featMat);
            brow.position.set(s * .15, .185, .19);
            brow.rotation.z = .38 * s;
            mask.add(brow);
        });
        // faint cheek tint
        [-1, 1].forEach(function (s) {
            var cheek = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 16), blushMat);
            cheek.position.set(s * .20, -.05, .175);
            cheek.scale.set(1.1, .7, .25);
            mask.add(cheek);
        });
        // nose ridge
        var nose = new THREE.Mesh(new THREE.ConeGeometry(.05, .16, 16), maskMat);
        nose.position.set(0, -.03, .215);
        nose.rotation.x = 1.35;
        nose.scale.set(1, 1, .7);
        mask.add(nose);
        // wide mustache with upturned tips
        var stacheMid = new THREE.Mesh(new THREE.BoxGeometry(.20, .026, .02), featMat);
        stacheMid.position.set(0, -.155, .205);
        mask.add(stacheMid);
        [-1, 1].forEach(function (s) {
            var tip = new THREE.Mesh(new THREE.BoxGeometry(.09, .022, .02), featMat);
            tip.position.set(s * .135, -.132, .20);
            tip.rotation.z = s * .55;
            mask.add(tip);
        });
        // soul patch goatee
        var goatee = new THREE.Mesh(new THREE.ConeGeometry(.035, .13, 12), featMat);
        goatee.position.set(0, -.32, .16);
        goatee.rotation.x = Math.PI + .25;
        goatee.scale.set(1, 1, .5);
        mask.add(goatee);
        mask.position.set(0, .02, .30);
        headGroup.add(mask);

        headGroup.position.y = 1.28;
        char.add(headGroup);

        // ---- bust: hood flows into smooth shoulders, clean cut at the chest ----
        var shoulders = new THREE.Mesh(
            new THREE.SphereGeometry(.72, 56, 36, 0, Math.PI * 2, 0, Math.PI / 2), cloakMat);
        shoulders.position.y = .30;
        shoulders.scale.set(1.32, 1.1, .92);
        char.add(shoulders);
        // chest cut underside
        var cut = new THREE.Mesh(new THREE.CircleGeometry(.72, 56), cloakInner);
        cut.rotation.x = Math.PI / 2;
        cut.position.y = .30;
        cut.scale.set(1.32, .92, 1);
        char.add(cut);
        // neck shadow connecting hood to shoulders
        var neck = new THREE.Mesh(new THREE.CylinderGeometry(.30, .42, .55, 32), cloakInner);
        neck.position.y = .85;
        char.add(neck);

        // uplight — glow from below, as if from an unseen screen
        var screenLight = new THREE.PointLight(0x36e6c4, 1.5, 5);
        screenLight.position.set(0, -.1, 1.35);
        char.add(screenLight);

        char.position.y = -.45;
        scene.add(char);

        // ---- holographic rings ----
        var ringMat = new THREE.MeshBasicMaterial({
            color: 0x5eead4, transparent: true, opacity: .28,
            blending: THREE.AdditiveBlending, side: THREE.DoubleSide
        });
        var ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.25, .012, 8, 90), ringMat);
        ring1.rotation.x = Math.PI / 2.15;
        ring1.position.y = -.42;
        scene.add(ring1);
        var ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, .008, 8, 90), ringMat.clone());
        ring2.material.opacity = .16;
        ring2.rotation.x = Math.PI / 1.95;
        ring2.position.y = -.22;
        scene.add(ring2);

        // ---- drifting code particles ----
        var P = 90, pos = new Float32Array(P * 3), speed = [];
        for (var i = 0; i < P; i++) {
            pos[i * 3] = (Math.random() - .5) * 5;
            pos[i * 3 + 1] = -1.6 + Math.random() * 4;
            pos[i * 3 + 2] = (Math.random() - .5) * 3 - .5;
            speed.push(.15 + Math.random() * .5);
        }
        var pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: 0x5eead4, size: .035, transparent: true, opacity: .55,
            blending: THREE.AdditiveBlending
        }));
        scene.add(particles);

        // ground glow disc
        var glow = new THREE.Mesh(new THREE.CircleGeometry(1.35, 40),
            new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: .10 }));
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -1.05;
        scene.add(glow);

        var mx = 0, my = 0;
        document.addEventListener('mousemove', function (e) {
            mx = (e.clientX / window.innerWidth) * 2 - 1;
            my = (e.clientY / window.innerHeight) * 2 - 1;
        });

        var t = 0;
        var visible = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { visible = en[0].isIntersecting; },
                { threshold: 0 }).observe(mount);
        }

        (function animate() {
            requestAnimationFrame(animate);
            if (!visible) return;
            t += .016;
            // hood subtly tracks the cursor
            headGroup.rotation.y += ((mx * .38) - headGroup.rotation.y) * .06;
            headGroup.rotation.x += ((my * .18) - headGroup.rotation.x) * .06;
            // levitation
            char.position.y = -.45 + Math.sin(t * 1.1) * .055;
            char.rotation.y = Math.sin(t * .3) * .07;
            // uplight flicker (hacking...)
            var flick = .85 + Math.sin(t * 17) * .08 + Math.sin(t * 53) * .07;
            screenLight.intensity = 1.35 * flick;
            // eye pulse
            var ep = .75 + Math.sin(t * 2.2) * .25;
            eyes.forEach(function (e) { e.material.color.setHSL(.46, .85, .45 + ep * .2); });
            // rings + particles
            ring1.rotation.z += .0022;
            ring2.rotation.z -= .0015;
            var arr = particles.geometry.attributes.position.array;
            for (var i = 0; i < P; i++) {
                arr[i * 3 + 1] += speed[i] * .016;
                if (arr[i * 3 + 1] > 2.6) arr[i * 3 + 1] = -1.7;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        })();

        window.addEventListener('resize', function () {
            var w = mount.clientWidth, h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    /* ================= TECH-STACK BALL PIT ================= */
    function initBallPit() {
        var mount = document.getElementById('ballpit3d');
        if (!mount || !hasTHREE || reducedMotion) return;

        var LABELS = ['Python', 'Go', 'AWS', 'Azure', 'OCI', 'Terraform', 'Docker',
            'Kubernetes', 'Burp Suite', 'Nmap', 'Metasploit', 'Wireshark', 'Linux',
            'Semgrep', 'OWASP ZAP', 'Git', 'SQL', 'Nessus'];
        var COLORS = [0x5eead4, 0x67e8f9, 0xa78bfa, 0xf472b6, 0x1b2230, 0x141a26];

        var W = mount.clientWidth, H = mount.clientHeight;
        var aspect = W / H;
        var frustum = 7;
        var scene = new THREE.Scene();
        var camera = new THREE.OrthographicCamera(
            -frustum * aspect / 2, frustum * aspect / 2, frustum / 2, -frustum / 2, .1, 50);
        camera.position.z = 10;
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xaabbcc, .7));
        var pt = new THREE.PointLight(0x5eead4, 1.2, 30);
        pt.position.set(-4, 3, 6);
        scene.add(pt);
        var pt2 = new THREE.PointLight(0xf472b6, .8, 30);
        pt2.position.set(4, 3, 6);
        scene.add(pt2);

        function labelSprite(text) {
            var c = document.createElement('canvas');
            var ctx = c.getContext('2d');
            var fs = 44;
            ctx.font = '600 ' + fs + 'px Inter, Arial';
            c.width = Math.ceil(ctx.measureText(text).width) + 24;
            c.height = fs + 20;
            ctx = c.getContext('2d');
            ctx.font = '600 ' + fs + 'px Inter, Arial';
            ctx.fillStyle = '#eef2f8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,.7)';
            ctx.shadowBlur = 8;
            ctx.fillText(text, c.width / 2, c.height / 2);
            var tex = new THREE.CanvasTexture(c);
            tex.minFilter = THREE.LinearFilter;
            var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
            var scale = .010;
            sp.scale.set(c.width * scale, c.height * scale, 1);
            return sp;
        }

        var halfW = frustum * aspect / 2, halfH = frustum / 2;
        var balls = [];
        LABELS.forEach(function (name, i) {
            var r = .38 + Math.random() * .34;
            var color = COLORS[i % COLORS.length];
            var mesh = new THREE.Mesh(
                new THREE.SphereGeometry(r, 28, 28),
                new THREE.MeshStandardMaterial({ color: color, roughness: .35, metalness: .15 }));
            mesh.position.set((Math.random() * 2 - 1) * (halfW - r), halfH + r + i * .8, 0);
            scene.add(mesh);
            var label = labelSprite(name);
            label.position.y = r + .28;
            mesh.add(label);
            balls.push({ m: mesh, r: r, vx: (Math.random() - .5) * .04, vy: 0 });
        });

        var mouse = new THREE.Vector2(-99, -99);
        var mouseIn = false;
        mount.addEventListener('mousemove', function (e) {
            var rect = mount.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width * 2 - 1) * halfW;
            mouse.y = -((e.clientY - rect.top) / rect.height * 2 - 1) * halfH;
            mouseIn = true;
        });
        mount.addEventListener('mouseleave', function () { mouseIn = false; });

        var GRAV = -.012, FLOOR = -halfH, DAMP = .995, REST = .55;
        var running = false;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { running = en[0].isIntersecting; },
                { threshold: .05 }).observe(mount);
        } else running = true;

        (function step() {
            requestAnimationFrame(step);
            if (!running) return;
            balls.forEach(function (b) {
                b.vy += GRAV;
                b.vx *= DAMP; b.vy *= DAMP;
                // mouse repulsion
                if (mouseIn) {
                    var dx = b.m.position.x - mouse.x, dy = b.m.position.y - mouse.y;
                    var d2 = dx * dx + dy * dy, rad = b.r + .9;
                    if (d2 < rad * rad && d2 > .0001) {
                        var d = Math.sqrt(d2), f = (rad - d) / rad * .09;
                        b.vx += dx / d * f; b.vy += dy / d * f;
                    }
                }
                b.m.position.x += b.vx;
                b.m.position.y += b.vy;
                // walls / floor
                if (b.m.position.x < -halfW + b.r) { b.m.position.x = -halfW + b.r; b.vx = Math.abs(b.vx) * REST; }
                if (b.m.position.x > halfW - b.r) { b.m.position.x = halfW - b.r; b.vx = -Math.abs(b.vx) * REST; }
                if (b.m.position.y < FLOOR + b.r) { b.m.position.y = FLOOR + b.r; b.vy = Math.abs(b.vy) * REST; b.vx *= .96; }
                b.m.rotation.z -= b.vx * .5;
            });
            // ball-ball collisions
            for (var i = 0; i < balls.length; i++) {
                for (var j = i + 1; j < balls.length; j++) {
                    var A = balls[i], B = balls[j];
                    var dx = B.m.position.x - A.m.position.x;
                    var dy = B.m.position.y - A.m.position.y;
                    var dist = Math.sqrt(dx * dx + dy * dy) || .001;
                    var min = A.r + B.r;
                    if (dist < min) {
                        var nx = dx / dist, ny = dy / dist, overlap = (min - dist) / 2;
                        A.m.position.x -= nx * overlap; A.m.position.y -= ny * overlap;
                        B.m.position.x += nx * overlap; B.m.position.y += ny * overlap;
                        var rvx = B.vx - A.vx, rvy = B.vy - A.vy;
                        var vn = rvx * nx + rvy * ny;
                        if (vn < 0) {
                            var imp = -(1 + REST) * vn / 2;
                            A.vx -= imp * nx; A.vy -= imp * ny;
                            B.vx += imp * nx; B.vy += imp * ny;
                        }
                    }
                }
            }
            renderer.render(scene, camera);
        })();

        window.addEventListener('resize', function () {
            var w = mount.clientWidth, h = mount.clientHeight;
            aspect = w / h;
            halfW = frustum * aspect / 2;
            camera.left = -halfW; camera.right = halfW;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    /* ================= SECTION EXTRAS ================= */
    function initSectionExtras() {
        // mono overline labels above every section title
        var labels = {
            about: '01 / Who I am', highlights: '02 / Wins & honors',
            experience: '03 / Where I’ve been', skills: '04 / My arsenal',
            certificates: '05 / Proof of work', projects: '06 / Things I built',
            research: '07 / Published work', contact: '08 / Say hello'
        };
        Object.keys(labels).forEach(function (id) {
            var sec = document.getElementById(id);
            var title = sec && sec.querySelector('.section-title');
            if (!title) return;
            var l = document.createElement('div');
            l.className = 'section-label';
            l.textContent = labels[id];
            title.parentNode.insertBefore(l, title);
        });

        // count-up stats
        var stats = document.querySelectorAll('.stat-number');
        if (stats.length && 'IntersectionObserver' in window && !reducedMotion) {
            var counted = false;
            new IntersectionObserver(function (entries, obs) {
                if (!entries[0].isIntersecting || counted) return;
                counted = true;
                obs.disconnect();
                stats.forEach(function (el) {
                    var raw = el.textContent.trim();
                    var num = parseInt(raw, 10) || 0;
                    var suffix = raw.replace(/[0-9]/g, '');
                    var start = null;
                    function tick(ts) {
                        if (!start) start = ts;
                        var p = Math.min((ts - start) / 1200, 1);
                        p = 1 - Math.pow(1 - p, 3); // ease-out cubic
                        el.textContent = Math.round(num * p) + suffix;
                        if (p < 1) requestAnimationFrame(tick);
                    }
                    requestAnimationFrame(tick);
                });
            }, { threshold: .5 }).observe(stats[0]);
        }

        // subtle 3D tilt on cards (desktop, fine pointers only)
        if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
        document.querySelectorAll('.highlight-card, .project-card, .research-card, .certificate-card')
            .forEach(function (card) {
                card.classList.add('tilt-card');
                var raf = null;
                card.addEventListener('mousemove', function (e) {
                    if (raf) return;
                    raf = requestAnimationFrame(function () {
                        raf = null;
                        var r = card.getBoundingClientRect();
                        var rx = ((e.clientY - r.top) / r.height - .5) * -6;
                        var ry = ((e.clientX - r.left) / r.width - .5) * 6;
                        card.style.transform =
                            'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
                            ry.toFixed(2) + 'deg) translateY(-6px)';
                    });
                });
                card.addEventListener('mouseleave', function () {
                    card.style.transform = '';
                });
            });
    }

    /* ================= BOOT ================= */
    function boot() {
        initLoader();
        initCursor();
        initNav();
        initReveals();
        initSectionExtras();
        initCharacter();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else boot();
})();
