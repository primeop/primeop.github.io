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
                scrollTrigger: { trigger: grid, start: 'top 82%' }
            });
        });

        // accordion items slide in from left
        gsap.utils.toArray('.accordion-item').forEach(function (el, i) {
            gsap.fromTo(el, { x: -60, opacity: 0 }, {
                x: 0, opacity: 1, duration: .7, delay: i * .05, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // about image
        var aboutImg = document.querySelector('.about-image');
        if (aboutImg) {
            gsap.fromTo(aboutImg, { x: 60, opacity: 0 }, {
                x: 0, opacity: 1, duration: .9, ease: 'power3.out',
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
                trigger: container, start: 'top 75%', end: 'bottom 55%', scrub: .5,
                onUpdate: function (self) {
                    line.style.setProperty('--tl', self.progress);
                    dot.style.top = (self.progress * 100) + '%';
                }
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
        var camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
        camera.position.set(0, 1.25, 5.2);
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        // lights — teal key, magenta rim (like inspiration)
        scene.add(new THREE.AmbientLight(0x8899aa, 0.55));
        var key = new THREE.DirectionalLight(0xffffff, 0.9);
        key.position.set(2, 4, 3);
        scene.add(key);
        var rimT = new THREE.PointLight(0x5eead4, 1.4, 12);
        rimT.position.set(-3, 1.5, 1.5);
        scene.add(rimT);
        var rimM = new THREE.PointLight(0xf472b6, 1.1, 12);
        rimM.position.set(3, 2.5, -1);
        scene.add(rimM);

        var char = new THREE.Group();
        var headGroup = new THREE.Group();

        var skinMat = new THREE.MeshStandardMaterial({ color: 0xc98e63, roughness: .6 });
        var darkMat = new THREE.MeshStandardMaterial({ color: 0x15181f, roughness: .55 });
        var capMat = new THREE.MeshStandardMaterial({ color: 0xd8dde6, roughness: .4 });
        var white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 });
        var irisMat = new THREE.MeshStandardMaterial({ color: 0x4433aa, roughness: .25 });

        // head
        var head = new THREE.Mesh(new THREE.SphereGeometry(.72, 40, 40), skinMat);
        head.scale.set(1, 1.08, .95);
        headGroup.add(head);
        // ears
        [-1, 1].forEach(function (s) {
            var ear = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 20), skinMat);
            ear.position.set(s * .70, 0, 0);
            headGroup.add(ear);
        });
        // eyes
        var eyes = [];
        [-1, 1].forEach(function (s) {
            var eg = new THREE.Group();
            var ball = new THREE.Mesh(new THREE.SphereGeometry(.155, 24, 24), white);
            var iris = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 20), irisMat);
            iris.position.z = .11;
            var pupil = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 12), darkMat);
            pupil.position.z = .15;
            eg.add(ball); eg.add(iris); eg.add(pupil);
            eg.position.set(s * .26, .08, .60);
            headGroup.add(eg);
            eyes.push(eg);
        });
        // brows
        [-1, 1].forEach(function (s) {
            var brow = new THREE.Mesh(new THREE.BoxGeometry(.30, .07, .08), darkMat);
            brow.position.set(s * .27, .30, .62);
            brow.rotation.z = s * -0.18;
            headGroup.add(brow);
        });
        // mouth (grin)
        var mouth = new THREE.Mesh(new THREE.BoxGeometry(.34, .1, .06), white);
        mouth.position.set(0, -.30, .62);
        headGroup.add(mouth);
        // cap: dome + brim
        var dome = new THREE.Mesh(
            new THREE.SphereGeometry(.74, 40, 24, 0, Math.PI * 2, 0, Math.PI * .52), capMat);
        dome.position.y = .18;
        dome.scale.set(1, .9, .97);
        headGroup.add(dome);
        var band = new THREE.Mesh(new THREE.TorusGeometry(.72, .05, 12, 40), darkMat);
        band.rotation.x = Math.PI / 2;
        band.position.y = .22;
        band.scale.set(1, 1, .6);
        headGroup.add(band);
        var brim = new THREE.Mesh(new THREE.CylinderGeometry(.34, .38, .06, 24, 1, false, 0, Math.PI), capMat);
        brim.rotation.y = -Math.PI / 2;
        brim.position.set(0, .24, .72);
        headGroup.add(brim);

        headGroup.position.y = 1.55;
        char.add(headGroup);

        // body — hoodie
        var body = new THREE.Mesh(new THREE.CylinderGeometry(.55, .85, 1.5, 32), darkMat);
        body.position.y = .1;
        char.add(body);
        var shoulders = new THREE.Mesh(new THREE.SphereGeometry(.56, 28, 20), darkMat);
        shoulders.position.y = .82;
        shoulders.scale.set(1.15, .55, .9);
        char.add(shoulders);
        // arms
        [-1, 1].forEach(function (s) {
            var arm = new THREE.Mesh(new THREE.CylinderGeometry(.16, .19, 1.15, 20), darkMat);
            arm.position.set(s * .78, .25, 0);
            arm.rotation.z = s * .22;
            char.add(arm);
            var hand = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 16), skinMat);
            hand.position.set(s * .92, -.36, 0);
            char.add(hand);
        });
        // glowing collar accent
        var collar = new THREE.Mesh(new THREE.TorusGeometry(.42, .035, 10, 40),
            new THREE.MeshBasicMaterial({ color: 0x5eead4 }));
        collar.rotation.x = Math.PI / 2;
        collar.position.y = .9;
        char.add(collar);

        char.position.y = -1.15;
        scene.add(char);

        // ground glow disc
        var glow = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40),
            new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: .12 }));
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -1.55;
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
            // head tracks mouse
            headGroup.rotation.y += ((mx * .55) - headGroup.rotation.y) * .08;
            headGroup.rotation.x += ((my * .28) - headGroup.rotation.x) * .08;
            eyes.forEach(function (e) {
                e.position.z = .60 + Math.abs(mx) * .01;
            });
            // idle bob + sway
            char.position.y = -1.15 + Math.sin(t * 1.6) * .045;
            char.rotation.y = Math.sin(t * .4) * .06;
            collar.material.color.setHSL(.45 + Math.sin(t) * .04, .75, .6);
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

    /* ================= BOOT ================= */
    function boot() {
        initLoader();
        initCursor();
        initNav();
        initReveals();
        initCharacter();
        initBallPit();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else boot();
})();
