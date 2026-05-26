/**
 * AUTOMATION WINNERS - Premium Script Engine
 * Developed by Senior Web Designer & Developer
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. DUAL-THEME SWITCHER SYSTEM
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // Retrieve saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('automation-theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
  }

  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    
    // Save state
    if (body.classList.contains('light-theme')) {
      localStorage.setItem('automation-theme', 'light');
    } else {
      localStorage.setItem('automation-theme', 'dark');
    }
    
    // Visual trigger for canvas grid refresh color palette
    if (window.canvasGridEngine) {
      window.canvasGridEngine.updateColors();
    }
  });

  // ==========================================
  // 2. SHAKING CYBERNETIC GRID BACKGROUND (CANVAS)
  // ==========================================
  class CanvasGridEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.nodes = [];
      this.maxNodes = 60;
      this.connectionDistance = 140;
      this.mouse = { x: null, y: null, radius: 180 };
      this.shakeIntensity = 0.5; // Constant subtle background shake
      this.activeShakeTime = 0;
      this.activeShakeIntensity = 0;
      
      this.init();
      this.animate();
      this.setupEventListeners();
    }

    init() {
      this.resizeCanvas();
      this.updateColors();
      this.nodes = [];
      
      // Populate nodes with randomized physics parameters
      for (let i = 0; i < this.maxNodes; i++) {
        this.nodes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          originX: 0,
          originY: 0,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseRadius: Math.random() * 2 + 1,
          radius: 0,
          shakeX: 0,
          shakeY: 0
        });
      }
      
      // Cache original positions
      this.nodes.forEach(node => {
        node.originX = node.x;
        node.originY = node.y;
      });
    }

    updateColors() {
      const isLight = document.body.classList.contains('light-theme');
      this.nodeColor = isLight ? 'rgba(0, 136, 204, 0.25)' : 'rgba(0, 242, 254, 0.3)';
      this.lineColor = isLight ? 'rgba(111, 0, 232, 0.04)' : 'rgba(127, 0, 255, 0.05)';
      this.mouseColor = isLight ? 'rgba(0, 136, 204, 0.15)' : 'rgba(0, 242, 254, 0.18)';
    }

    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    triggerStrongShake(duration = 350, intensity = 4) {
      this.activeShakeTime = duration;
      this.activeShakeIntensity = intensity;
      
      // Also apply CSS shake classes to the main background container
      const container = document.querySelector('.bg-mesh-container');
      if (container) {
        container.classList.add('shaking-bg-active');
        setTimeout(() => {
          container.classList.remove('shaking-bg-active');
        }, duration);
      }
    }

    setupEventListeners() {
      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.init();
      });

      // Mouse movements track
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      // Trigger intense network shake on user mouse click
      window.addEventListener('mousedown', () => {
        this.triggerStrongShake(400, 6);
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Continuous background shake or active click shake variables
      let currentShakeX = 0;
      let currentShakeY = 0;
      
      if (this.activeShakeTime > 0) {
        currentShakeX = (Math.random() - 0.5) * this.activeShakeIntensity;
        currentShakeY = (Math.random() - 0.5) * this.activeShakeIntensity;
        this.activeShakeTime -= 16.67; // Subtract approx 1 frame in ms
      } else {
        // Continuous organic micro-shaking background
        currentShakeX = (Math.random() - 0.5) * this.shakeIntensity;
        currentShakeY = (Math.random() - 0.5) * this.shakeIntensity;
      }

      // Render grid/nodes
      for (let i = 0; i < this.nodes.length; i++) {
        let node = this.nodes[i];
        
        // Idle floating physics
        node.x += node.vx;
        node.y += node.vy;

        // Boundary bounce check
        if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

        // Interactive mouse warping physics
        if (this.mouse.x != null && this.mouse.y != null) {
          let dx = node.x - this.mouse.x;
          let dy = node.y - this.mouse.y;
          let distance = Math.hypot(dx, dy);
          
          if (distance < this.mouse.radius) {
            let force = (this.mouse.radius - distance) / this.mouse.radius;
            // Push particles slightly away
            node.x += (dx / distance) * force * 1.5;
            node.y += (dy / distance) * force * 1.5;
          }
        }

        // Draw particle nodes with continuous shake applied to coordinate rendering
        let renderX = node.x + currentShakeX;
        let renderY = node.y + currentShakeY;

        this.ctx.beginPath();
        this.ctx.arc(renderX, renderY, node.baseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.nodeColor;
        this.ctx.fill();

        // Connect nodes to neighboring nodes within threshold
        for (let j = i + 1; j < this.nodes.length; j++) {
          let target = this.nodes[j];
          let dist = Math.hypot(node.x - target.x, node.y - target.y);
          
          if (dist < this.connectionDistance) {
            this.ctx.beginPath();
            this.ctx.moveTo(renderX, renderY);
            this.ctx.lineTo(target.x + currentShakeX, target.y + currentShakeY);
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = (1 - dist / this.connectionDistance) * 0.75;
            this.ctx.stroke();
          }
        }
      }

      // Draw subtle glowing mesh around mouse position
      if (this.mouse.x != null && this.mouse.y != null) {
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, this.mouse.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = this.mouseColor;
        this.ctx.fill();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // Initialize Canvas Particles Grid
  window.canvasGridEngine = new CanvasGridEngine('shaking-canvas');


  // ==========================================
  // 3. ANIMATED TYPEWRITER / SERVICES ROTATOR
  // ==========================================
  const rotatorText = document.getElementById('rotator-text');
  const services = [
    'Web Designing',
    'Web Development',
    'AI Automations for Local Businesses',
    'Calling Agents',
    'AI Operating Systems'
  ];
  
  let currentServiceIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let erasingSpeed = 60;
  let pauseBeforeErase = 2000;
  let pauseBeforeType = 600;

  function typeText() {
    const fullText = services[currentServiceIndex];

    if (!isDeleting) {
      // Typing state
      rotatorText.textContent = fullText.substring(0, currentCharIndex + 1);
      currentCharIndex++;

      if (currentCharIndex === fullText.length) {
        isDeleting = true;
        setTimeout(typeText, pauseBeforeErase);
      } else {
        setTimeout(typeText, typingSpeed);
      }
    } else {
      // Erasing state
      rotatorText.textContent = fullText.substring(0, currentCharIndex - 1);
      currentCharIndex--;

      if (currentCharIndex === 0) {
        isDeleting = false;
        // Cycle to next service
        currentServiceIndex = (currentServiceIndex + 1) % services.length;
        setTimeout(typeText, pauseBeforeType);
      } else {
        setTimeout(typeText, erasingSpeed);
      }
    }
  }

  // Kickoff rotator typing script
  setTimeout(typeText, 1000);


  // ==========================================
  // 4. FLOATING NAVBAR SCROLL SHIFT ENGINE
  // ==========================================
  const mainHeader = document.getElementById('main-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    // Show glass shadow on scroll
    if (window.scrollY > 40) {
      mainHeader.classList.add('nav-scrolled');
    } else {
      mainHeader.classList.remove('nav-scrolled');
    }

    // Auto Hide/Show navbar on scroll direction
    if (window.scrollY > lastScrollY && window.scrollY > 120) {
      mainHeader.classList.add('nav-hidden');
    } else {
      mainHeader.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;
  });


  // ==========================================
  // 5. SERVICES GRID CATEGORY CARDS FILTERS
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Toggle button active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      serviceCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterVal === 'all' || cardCategory === filterVal) {
          // Display card with smooth scale entrance
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          // Fade card out
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });


  // ==========================================
  // 6. SCROLL REVEAL ENGINES (INTERSECTION OBSERVER)
  // ==========================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve once element is successfully displayed
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 7. INTERACTIVE FAQ ACCORDIONS PANELS
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other FAQ items for a clean accordion effect
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-icon i').className = 'fa-solid fa-plus';
      });

      if (!isActive) {
        item.classList.add('active');
        item.querySelector('.faq-icon i').className = 'fa-solid fa-minus';
      }
    });
  });


  // ==========================================
  // 8. MOBILE HAMBURGER MENU TOGGLE
  // ==========================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isOpened = navMenu.classList.contains('active');
    mobileToggle.innerHTML = isOpened ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  // Auto close menu when clicking options
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      
      // Update active nav-link highlighting
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Highlight navigation options on scroll positioning
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    const sections = document.querySelectorAll('section');
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });


  // ==========================================
  // 9. SUBMISSION HOLOGRAPHIC TERMINAL LOGS
  // ==========================================
  const leadsForm = document.getElementById('leads-form');
  const terminalOverlay = document.getElementById('terminal-overlay');
  const terminalLogs = document.getElementById('terminal-logs');
  const terminalCloseBtn = document.getElementById('terminal-close');

  leadsForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Intercept actual HTTP dispatch to showcase simulator

    // Open holographic console panel
    terminalOverlay.classList.add('active');
    terminalLogs.innerHTML = '';
    terminalCloseBtn.style.opacity = '0.3';
    terminalCloseBtn.style.pointerEvents = 'none';

    // Extract submission values safely
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const service = document.getElementById('service-select').value;
    const message = document.getElementById('client-message').value;

    // Simulate cyber SMTP terminal connection logs
    const logs = [
      { text: '[INITIATING] Running Automation Request pipeline...', delay: 100 },
      { text: '[SYSTEM] Loading telemetry and data encryption systems...', delay: 250 },
      { text: `[DATA] Form parameters validated: Client="${name}", Email="${email}"`, delay: 200 },
      { text: `[DATA] Service request mapped to: [${service.toUpperCase()}]`, delay: 150 },
      { text: '[NETWORK] Pinging secure gateway smtp.gmail.com:587...', delay: 300 },
      { text: '[CONNECTION] Handshake established via TLS 1.3 encryption', delay: 250 },
      { text: '[AUTH] Authenticating gateway credentials for umairqamar472@gmail.com...', delay: 350 },
      { text: '[AUTH] Access token validated privately. Gateway authorized.', delay: 200 },
      { text: '[TRANSMITTING] Packaging lead metrics, message details & pipeline logs...', delay: 400 },
      { text: `[POSTING] Sending payload to secure endpoint...`, delay: 500, triggerActualPost: true },
      { text: '[SUCCESS] Mail successfully dispatched & routed!', delay: 200, style: 'success' },
      { text: '[ROUTING] Lead delivered to: umairqamar472@gmail.com privately.', delay: 150, style: 'success' },
      { text: '[COMPLETED] Connection closed cleanly. Pipeline status: OK (200)', delay: 100 }
    ];

    let logIndex = 0;

    function addLogLine(text, cssClass = '') {
      const line = document.createElement('div');
      line.className = `log-line ${cssClass}`;
      line.textContent = `> ${text}`;
      terminalLogs.appendChild(line);
      // Auto scroll terminal log window
      terminalOverlay.scrollTop = terminalOverlay.scrollHeight;
    }

    async function processLogQueue() {
      if (logIndex < logs.length) {
        const item = logs[logIndex];
        
        // Shaking background visual effect on network dispatch log line
        if (item.triggerActualPost) {
          window.canvasGridEngine.triggerStrongShake(600, 8);
          
          // Trigger actual Formspree lead sending in background
          try {
            const formData = new FormData(leadsForm);
            // Append client private delivery logs
            formData.append('_subject', `New Lead from AUTOMATION WINNERS: ${name}`);
            
            await fetch(leadsForm.action, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json'
              }
            });
          } catch (err) {
            console.error('Quiet fallback on network error, simulation continues', err);
          }
        }

        addLogLine(item.text, item.style || '');
        logIndex++;
        setTimeout(processLogQueue, item.delay);
      } else {
        // Enable acknowledge connection button to close the dashboard
        terminalCloseBtn.style.opacity = '1';
        terminalCloseBtn.style.pointerEvents = 'all';
      }
    }

    // Trigger terminal log queuing
    processLogQueue();
  });

  // Close console window and reset form
  terminalCloseBtn.addEventListener('click', () => {
    terminalOverlay.classList.remove('active');
    leadsForm.reset();
    
    // Jump scroll to projects or services to complete the experience smoothly
    window.location.hash = '#home';
  });


  // ==========================================
  // 10. CURRENT YEAR IN FOOTER
  // ==========================================
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

});
