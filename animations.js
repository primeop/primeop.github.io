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
        var seen = false;
        try { seen = sessionStorage.getItem('prim30p-entered') === '1'; } catch (e) { }
        if (reducedMotion || seen) { screen.remove(); startIntro(); return; }

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
            try { sessionStorage.setItem('prim30p-entered', '1'); } catch (e) { }
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
        if (typeof window.__prim30pBoot === 'function') window.__prim30pBoot();
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
        var rim = new THREE.Mesh(new THREE.TorusGeometry(.47, .055, 14, 48), cloakMat);
        rim.position.set(0, .02, .28);
        rim.rotation.x = -.32;
        headGroup.add(rim);
        // inner hood lining (darker band inside the opening)
        var lining = new THREE.Mesh(new THREE.TorusGeometry(.435, .04, 12, 48), cloakInner);
        lining.position.set(0, .02, .245);
        lining.rotation.x = -.32;
        headGroup.add(lining);
        // faint teal stitch trim along the rim
        var trim = new THREE.Mesh(new THREE.TorusGeometry(.51, .006, 8, 64),
            new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: .30 }));
        trim.position.set(0, .02, .30);
        trim.rotation.x = -.32;
        headGroup.add(trim);
        // headphones over the hood — band + cups with a teal glow ring
        var hpMat = new THREE.MeshStandardMaterial({ color: 0x151a24, roughness: .45, metalness: .35 });
        var hpBand = new THREE.Mesh(new THREE.TorusGeometry(.635, .034, 12, 48, Math.PI), hpMat);
        hpBand.position.set(0, .10, .02);
        headGroup.add(hpBand);
        [-1, 1].forEach(function (s) {
            var cup = new THREE.Mesh(new THREE.CylinderGeometry(.135, .125, .11, 28), hpMat);
            cup.rotation.z = Math.PI / 2;
            cup.position.set(s * .615, .08, .02);
            headGroup.add(cup);
            var cupRing = new THREE.Mesh(new THREE.TorusGeometry(.085, .010, 8, 28),
                new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: .75 }));
            cupRing.rotation.y = Math.PI / 2;
            cupRing.position.set(s * .675, .08, .02);
            headGroup.add(cupRing);
        });
        // shadow behind the mask
        var faceShadow = new THREE.Mesh(new THREE.SphereGeometry(.44, 32, 32), voidMat);
        faceShadow.position.set(0, .02, .12);
        faceShadow.scale.set(1, 1.15, .72);
        headGroup.add(faceShadow);

        // ---- faceless void with glowing eyes ----
        function glowSprite(size) {
            var c = document.createElement('canvas');
            c.width = c.height = 128;
            var g = c.getContext('2d');
            var grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
            grad.addColorStop(0, 'rgba(94,234,212,.85)');
            grad.addColorStop(.35, 'rgba(94,234,212,.25)');
            grad.addColorStop(1, 'rgba(94,234,212,0)');
            g.fillStyle = grad;
            g.fillRect(0, 0, 128, 128);
            var sp = new THREE.Sprite(new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(c), transparent: true,
                blending: THREE.AdditiveBlending, depthWrite: false
            }));
            sp.scale.set(size, size, 1);
            return sp;
        }
        var eyes = [], eyeGlows = [];
        [-1, 1].forEach(function (s) {
            var eye = new THREE.Mesh(new THREE.BoxGeometry(.125, .040, .015),
                new THREE.MeshBasicMaterial({ color: 0x7df3e1, transparent: true }));
            eye.position.set(s * .145, .075, .42);
            eye.rotation.z = s * .12;
            eye.userData.bx = s * .145;
            headGroup.add(eye);
            eyes.push(eye);
            var gs = glowSprite(.30);
            gs.position.set(s * .145, .075, .43);
            gs.userData.base = .30;
            headGroup.add(gs);
            eyeGlows.push(gs);
        });

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
        // cowl — bridges the hood into the shoulders so there are no gaps
        var cowl = new THREE.Mesh(new THREE.CylinderGeometry(.46, .66, .60, 56, 1, true), cloakMat);
        cowl.position.y = .90;
        char.add(cowl);
        var cowlBack = new THREE.Mesh(new THREE.SphereGeometry(.52, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2), cloakMat);
        cowlBack.position.set(0, 1.02, -.08);
        cowlBack.scale.set(1.05, .75, .95);
        char.add(cowlBack);
        // collar seam
        var collarSeam = new THREE.Mesh(new THREE.TorusGeometry(.41, .020, 10, 48), cloakInner);
        collarSeam.rotation.x = Math.PI / 2 - .12;
        collarSeam.position.set(0, .96, .04);
        char.add(collarSeam);
        // zipper line down the chest with a small pull
        var zipMat = new THREE.MeshStandardMaterial({ color: 0x2a3242, roughness: .3, metalness: .6 });
        var zip = new THREE.Mesh(new THREE.BoxGeometry(.022, .48, .03), zipMat);
        zip.position.set(0, .62, .55);
        zip.rotation.x = .42;
        char.add(zip);
        var zipPull = new THREE.Mesh(new THREE.BoxGeometry(.045, .07, .02), zipMat);
        zipPull.position.set(0, .42, .655);
        zipPull.rotation.x = .42;
        char.add(zipPull);

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
            new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: .08 }));
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -1.05;
        scene.add(glow);

        // ---- radar floor: concentric rings + rotating sweep ----
        var radar = new THREE.Group();
        radar.position.y = -1.02;
        [.45, .85, 1.25].forEach(function (rr, i) {
            var ring = new THREE.Mesh(new THREE.TorusGeometry(rr, .004, 6, 64),
                new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: .16 - i * .03 }));
            ring.rotation.x = Math.PI / 2;
            radar.add(ring);
        });
        var sweep = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40, 0, .75),
            new THREE.MeshBasicMaterial({
                color: 0x5eead4, transparent: true, opacity: .10,
                blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
            }));
        sweep.rotation.x = -Math.PI / 2;
        radar.add(sweep);
        scene.add(radar);

        // ---- rising scan pulse ----
        var scanRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, .006, 8, 64),
            new THREE.MeshBasicMaterial({
                color: 0x67e8f9, transparent: true, opacity: 0,
                blending: THREE.AdditiveBlending, depthWrite: false
            }));
        scanRing.rotation.x = Math.PI / 2;
        scanRing.visible = false;
        scene.add(scanRing);


        // ---- live-typing terminal windows ----
        var CMDS = [
            ['whoami', 'root'],
            ['sudo nmap -sS 10.0.0.0/24', '443/tcp open  https'],
            ['ssh root@10.0.0.5', 'access granted'],
            ['hashcat -m 1000 hash.txt', 'Cracked: ********'],
            ['python3 exploit.py --api', '[+] shell acquired'],
            ['cat /etc/shadow', 'permission... bypassed'],
            ['curl -s target/.env', 'AWS_SECRET=**********']
        ];
        function makeTerminal(seed) {
            var c = document.createElement('canvas');
            c.width = 256; c.height = 168;
            var ctx = c.getContext('2d');
            var tex = new THREE.CanvasTexture(c);
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(.80, .525),
                new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide }));
            // typing state
            var idx = Math.floor(Math.random() * CMDS.length);
            var phase = 'type', chars = 0, wait = 0, tick = 0;
            function draw() {
                var w = 256, h = 168, r = 14;
                ctx.clearRect(0, 0, w, h);
                ctx.beginPath();
                ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.arcTo(w, 0, w, r, r);
                ctx.lineTo(w, h - r); ctx.arcTo(w, h, w - r, h, r);
                ctx.lineTo(r, h); ctx.arcTo(0, h, 0, h - r, r);
                ctx.lineTo(0, r); ctx.arcTo(0, 0, r, 0, r);
                ctx.closePath();
                ctx.fillStyle = 'rgba(8,13,22,.85)'; ctx.fill();
                ctx.strokeStyle = 'rgba(94,234,212,.38)'; ctx.lineWidth = 2; ctx.stroke();
                ['#5eead4', '#a78bfa', '#f472b6'].forEach(function (col, i) {
                    ctx.beginPath(); ctx.arc(20 + i * 18, 16, 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = col; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1;
                });
                ctx.strokeStyle = 'rgba(255,255,255,.08)';
                ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(256, 30); ctx.stroke();
                ctx.font = '600 13px monospace';
                var cmd = CMDS[idx][0], out = CMDS[idx][1];
                var cur = (Math.floor(tick / 18) % 2) ? '█' : ' ';
                ctx.fillStyle = 'rgba(94,234,212,.95)';
                if (phase === 'type') {
                    ctx.fillText('$ ' + cmd.slice(0, chars) + cur, 14, 54);
                } else {
                    ctx.fillText('$ ' + cmd, 14, 54);
                    ctx.fillStyle = 'rgba(238,242,248,.82)';
                    if (phase === 'out') ctx.fillText(out.slice(0, chars) + cur, 14, 76);
                    else { ctx.fillText(out, 14, 76); ctx.fillStyle = 'rgba(94,234,212,.9)'; ctx.fillText('$ ' + cur, 14, 100); }
                }
                tex.needsUpdate = true;
            }
            draw();
            function update() {
                tick++;
                if (tick % 2 !== 0) { if (tick % 18 === 0) draw(); return; }
                if (phase === 'type') {
                    if (chars < CMDS[idx][0].length) { chars++; draw(); }
                    else { phase = 'pause'; wait = 24; }
                } else if (phase === 'pause') {
                    if (--wait <= 0) { phase = 'out'; chars = 0; }
                } else if (phase === 'out') {
                    if (chars < CMDS[idx][1].length) { chars++; draw(); }
                    else { phase = 'done'; wait = 90; draw(); }
                } else if (phase === 'done') {
                    if (--wait <= 0) { idx = (idx + 1) % CMDS.length; phase = 'type'; chars = 0; }
                }
            }
            return { mesh: mesh, update: update };
        }
        var termL = makeTerminal();
        termL.mesh.position.set(-1.4, .55, -.25);
        termL.mesh.rotation.y = .5;
        scene.add(termL.mesh);
        var termR = makeTerminal();
        termR.mesh.position.set(1.4, .9, -.35);
        termR.mesh.rotation.y = -.5;
        scene.add(termR.mesh);
        var panelL = termL.mesh, panelR = termR.mesh;

        // ---- easter-egg popup terminal (hidden until the figure is clicked) ----
        var eggCanvas = document.createElement('canvas');
        eggCanvas.width = 384; eggCanvas.height = 168;
        var ectx = eggCanvas.getContext('2d');
        var eggTex = new THREE.CanvasTexture(eggCanvas);
        var eggMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .656),
            new THREE.MeshBasicMaterial({ map: eggTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
        eggMesh.position.set(0, 1.35, 1.0);
        eggMesh.visible = false;
        scene.add(eggMesh);
        function drawEgg(msg, typed) {
            var w = 384, h = 168, r = 18;
            ectx.clearRect(0, 0, w, h);
            ectx.beginPath();
            ectx.moveTo(r, 0); ectx.lineTo(w - r, 0); ectx.arcTo(w, 0, w, r, r);
            ectx.lineTo(w, h - r); ectx.arcTo(w, h, w - r, h, r);
            ectx.lineTo(r, h); ectx.arcTo(0, h, 0, h - r, r);
            ectx.lineTo(0, r); ectx.arcTo(0, 0, r, 0, r);
            ectx.closePath();
            ectx.fillStyle = 'rgba(8,13,22,.95)'; ectx.fill();
            ectx.strokeStyle = 'rgba(244,114,182,.6)'; ectx.lineWidth = 2.5; ectx.stroke();
            ['#5eead4', '#a78bfa', '#f472b6'].forEach(function (col, i) {
                ectx.beginPath(); ectx.arc(24 + i * 20, 20, 5.5, 0, Math.PI * 2);
                ectx.fillStyle = col; ectx.globalAlpha = .9; ectx.fill(); ectx.globalAlpha = 1;
            });
            ectx.strokeStyle = 'rgba(255,255,255,.08)';
            ectx.beginPath(); ectx.moveTo(0, 38); ectx.lineTo(w, 38); ectx.stroke();
            ectx.font = '700 17px monospace';
            ectx.fillStyle = 'rgba(94,234,212,.95)';
            ectx.fillText('$ ./access.sh', 18, 72);
            ectx.fillStyle = 'rgba(244,114,182,.95)';
            ectx.fillText(msg.slice(0, typed) + ((Math.floor(t * 8) % 2) ? '█' : ''), 18, 108);
            eggTex.needsUpdate = true;
        }
        var eggStart = 0, eggMsg = '';

        var mx = 0, my = 0;
        var proximity = 0;      // 0..1 how close cursor is to the figure
        var proxTarget = 0;
        var staring = false;    // cursor directly over the figure
        document.addEventListener('mousemove', function (e) {
            mx = (e.clientX / window.innerWidth) * 2 - 1;
            my = (e.clientY / window.innerHeight) * 2 - 1;
            var r = mount.getBoundingClientRect();
            var cx = r.left + r.width / 2, cy = r.top + r.height * .42;
            var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            proxTarget = Math.max(0, 1 - dist / (r.width * .9));
            staring = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        mount.style.cursor = 'pointer';

        // click easter egg
        var egg = 0;
        var EGGS = ['access denied — nice try ;)', 'permission granted. now hire me.', 'you found me. let\'s talk.', 'trace initiated... just kidding.', 'root shell acquired. impressed?'];
        mount.addEventListener('click', function () {
            egg = 1.0;
            if (!eggStart) { eggMsg = EGGS[Math.floor(Math.random() * EGGS.length)]; eggStart = performance.now(); }
        });

        var t = 0;
        var visible = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { visible = en[0].isIntersecting; },
                { threshold: 0 }).observe(mount);
        }
        // scroll power-down: hero visibility 1..0
        var heroPower = 1;
        window.addEventListener('scroll', function () {
            var vh = window.innerHeight;
            heroPower = Math.max(0, Math.min(1, 1 - window.scrollY / (vh * .8)));
        }, { passive: true });

        // boot sequence (wall-clock based so it completes even if frames throttle)
        var bootStart = 0; // 0 = not started
        function boot() { return bootStart ? (performance.now() - bootStart) / 1000 : 0; }
        window.__prim30pBoot = function () { if (!bootStart) bootStart = performance.now(); };
        // if loader already gone (repeat visit / reduced motion), boot immediately
        if (!document.getElementById('loadingScreen')) bootStart = performance.now();

        var netTick = 0, frame = 0;
        (function animate() {
            requestAnimationFrame(animate);
            if (!visible) return;
            t += .016;
            frame++;

            // ---- boot sequence: 0 -> ~2.6s ignition flourish (figure always visible) ----
            var bt = boot();
            var booting = bt > 0 && bt < 2.6;
            var bootWake = booting ? Math.min(1, bt / 2.6) : 1;   // ignition ramp for eyes/glow only
            // ease proximity toward target; scroll power fades everything
            proximity += (proxTarget - proximity) * .08;
            var power = heroPower;                 // body/rings/terminals — scroll only
            var alive = heroPower * bootWake;      // eyes + screen light — includes boot ignition

            // hood tracks cursor (harder when staring)
            var trackK = staring ? .62 : .38;
            headGroup.rotation.y += ((mx * trackK) - headGroup.rotation.y) * (staring ? .11 : .06);
            headGroup.rotation.x += ((my * .20) - headGroup.rotation.x) * .06;

            // levitation (settles during boot)
            char.position.y = -.45 + Math.sin(t * 1.1) * .055 * power;
            char.rotation.y = Math.sin(t * .3) * .07;
            // gentle entrance pop (normal size, subtle overshoot)
            if (bt > 0 && bt < 1.0) {
                var pb = bt / 1.0;
                char.scale.setScalar(.6 + .4 * (1 - Math.pow(1 - pb, 3)) + Math.sin(pb * Math.PI) * .06);
            } else char.scale.setScalar(1);

            var flick = .85 + Math.sin(t * 17) * .08 + Math.sin(t * 53) * .07;
            screenLight.intensity = 1.35 * flick * alive;

            // eye pulse, blink, proximity brighten
            var ep = .75 + Math.sin(t * 2.2) * .25;
            var bp = t % 4.6;
            var blink = bp > 4.35 ? Math.max(.08, 1 - Math.sin((bp - 4.35) / .25 * Math.PI)) : 1;

            // glitch: periodic burst, plus a hard snap when clicked
            var gp = t % 7.3;
            var periodic = gp > 7.08 && !booting;
            var clickGlitch = egg > 1.0;
            var glitching = periodic || clickGlitch;
            if (egg > 0) egg -= .016;
            // boot: eyes ignite one at a time
            var eyeOn = [1, 1];
            if (booting) {
                eyeOn[0] = bt > 1.4 ? Math.min(1, (bt - 1.4) / .3) : 0;
                eyeOn[1] = bt > 1.75 ? Math.min(1, (bt - 1.75) / .3) : 0;
            }
            if (glitching) {
                var amp = clickGlitch ? .16 : .10;
                var gx = (Math.random() - .5) * amp;
                char.position.x = gx;
                headGroup.position.x = -gx * 1.5;
                headGroup.position.z = (Math.random() - .5) * .05;
                char.rotation.z = (Math.random() - .5) * (clickGlitch ? .05 : .03);
                rimM.intensity = clickGlitch ? 4.2 : 3.2;
            } else {
                char.position.x += (0 - char.position.x) * .3;
                headGroup.position.x += (0 - headGroup.position.x) * .3;
                headGroup.position.z += (0 - headGroup.position.z) * .3;
                char.rotation.z += (0 - char.rotation.z) * .3;
                rimM.intensity = 1.0;
            }
            eyes.forEach(function (e, i) {
                var on = eyeOn[i] * alive;
                if (glitching) e.material.color.setHex(Math.random() < .35 ? 0xf472b6 : 0x7df3e1);
                else e.material.color.setHSL(.46, .85, .35 + (.25 + proximity * .3) * (.6 + ep * .4));
                e.material.opacity = on;
                e.scale.y = blink * eyeOn[i];
                var g = eyeGlows[i];
                g.material.opacity = on * (glitching ? 1 : .8);
                g.scale.setScalar(g.userData.base * (1 + proximity * .35 + (glitching ? .3 : 0)) * eyeOn[i]);
            });

            // radar sweep + scan pulse
            sweep.rotation.z -= .012 * (.4 + power * .6);
            sweep.material.opacity = .10 * power;
            var st = t % 6;
            if (st < 1.5 && power > .3) {
                scanRing.visible = true;
                var sp2 = st / 1.5;
                scanRing.position.y = -1.0 + sp2 * 2.5;
                scanRing.material.opacity = .45 * Math.sin(sp2 * Math.PI) * power;
                scanRing.scale.setScalar(1 - sp2 * .38);
            } else scanRing.visible = false;

            // breathing
            shoulders.scale.y = 1.1 + Math.sin(t * 1.4) * .012;

            // terminals: live typing + drift (fade out on scroll / during early boot)
            termL.update(); termR.update();
            var termP = heroPower * (bt > 0 ? Math.min(1, Math.max(0, (bt - .8) / .8)) : 1);
            panelL.position.y = .55 + Math.sin(t * .8) * .05;
            panelR.position.y = .9 + Math.sin(t * .8 + 1.6) * .05;
            panelL.material.opacity = (.85 + Math.sin(t * 2.1) * .06) * termP;
            panelR.material.opacity = (.85 + Math.sin(t * 1.7 + .8) * .06) * termP;

            // rings (spin up fast during boot)
            var ringSpin = booting ? .02 : .0022;
            ring1.rotation.z += ringSpin;
            ring2.rotation.z -= ringSpin * .7;
            ring1.material.opacity = .28 * power;
            ring2.material.opacity = .16 * power;

            // particles rise
            var arr = particles.geometry.attributes.position.array;
            for (var i = 0; i < P; i++) {
                arr[i * 3 + 1] += speed[i] * .016;
                if (arr[i * 3 + 1] > 2.6) arr[i * 3 + 1] = -1.7;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = .55 * power;

            // ---- easter-egg terminal: pop big, type message, hold, shrink back (~3s) ----
            if (eggStart) {
                var e = (performance.now() - eggStart) / 1000;
                if (e < 3.0) {
                    eggMesh.visible = true;
                    var sc, op;
                    if (e < .35) { var pin = e / .35; sc = (1 - Math.pow(1 - pin, 3)) * (1 + (1 - pin) * .12); op = pin; }
                    else if (e > 2.7) { var pout = (3 - e) / .3; sc = pout; op = pout; }
                    else { sc = 1; op = 1; }
                    eggMesh.scale.setScalar(sc);
                    eggMesh.material.opacity = op;
                    eggMesh.position.y = 1.35 + Math.sin(t * 3) * .02;
                    var typed = Math.min(eggMsg.length, Math.floor(Math.max(0, e - .35) * 34));
                    drawEgg(eggMsg, typed);
                } else { eggMesh.visible = false; eggStart = 0; }
            }

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
