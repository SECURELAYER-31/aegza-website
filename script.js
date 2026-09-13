const config = window.AEGZA_CONFIG || { contactEmail: 'aegza.ai@gmail.com', whatsappUrl: 'https://wa.me/919699766615' };

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-btn');
const navLinksWrap = document.querySelector('.nav-links');
const form = document.querySelector('#partnershipForm');
const statusMessage = document.querySelector('#partnershipStatus');
const glow = document.querySelector('.cursor-glow');
const serviceDetail = document.querySelector('#serviceDetail');
const serviceTabs = document.querySelectorAll('.service-tab');
const revealItems = document.querySelectorAll('.reveal');
const progress = document.querySelector('.scroll-progress');
const loader = document.querySelector('.page-loader');
const toast = document.querySelector('.toast');
const motionAllowed = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

const services = {
  evaluation: {
    title: 'LLM evaluation and model review.',
    body: 'Structured human reviews that help teams assess model behavior, compare outputs, and surface quality issues with clarity.',
    items: ['LLM Evaluation', 'AI Response Evaluation', 'RLHF / Human Feedback', 'Multimodal Evaluation', 'Search / Relevance Evaluation', 'AI Model Testing']
  },
  annotation: {
    title: 'Data annotation for reliable model inputs.',
    body: 'Clear annotation workflows for text, visual, audio and video datasets that need consistent labeling and review.',
    items: ['Text Annotation', 'Image Annotation', 'Video Annotation', 'Audio Annotation', 'Computer Vision Data', 'Speech & Language Data']
  },
  operations: {
    title: 'Data operations built around your workflow.',
    body: 'Project-specific collection, validation, QA and dataset review workflows that keep delivery structured and traceable.',
    items: ['Data Collection', 'Data Validation', 'Quality Assurance', 'Content Moderation', 'Dataset Review']
  },
  emerging: {
    title: 'Emerging AI data support for new modalities.',
    body: 'Human review and data workflows for physical AI, robotics and multimodal systems that need careful operational support.',
    items: ['Physical AI Data', 'Robotics Data', 'Multimodal Human Feedback']
  }
};

const setMenu = (open) => {
  if (!navLinksWrap || !menuButton) return;
  navLinksWrap.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
};

if (menuButton && navLinksWrap) {
  menuButton.addEventListener('click', () => setMenu(!navLinksWrap.classList.contains('open')));
  navLinksWrap.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (navLinksWrap.classList.contains('open') && !event.target.closest('.nav') && !event.target.closest('.nav-links')) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
}

const renderService = (key) => {
  if (!serviceDetail) return;
  const service = services[key];
  if (!service) return;
  const heading = serviceDetail.querySelector('h3');
  const body = serviceDetail.querySelector('p');
  const list = serviceDetail.querySelector('ul');
  if (heading) heading.textContent = service.title;
  if (body) body.textContent = service.body;
  if (list) list.innerHTML = service.items.map((item) => `<li>${item}</li>`).join('');
};

serviceTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    serviceTabs.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    renderService(tab.dataset.service);
    history.replaceState(null, '', `#${tab.dataset.service}`);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

const updateScroll = () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 18);
  if (progress) {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${range ? (window.scrollY / range) * 100 : 0}%`;
  }
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2800);
};

const colorCards = document.querySelectorAll('.card-light');
if (motionAllowed) {
  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest('.card-light');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--y', `${event.clientY - rect.top}px`);
  }, { passive: true });
}

document.querySelectorAll('.magnetic').forEach((button) => {
  if (!motionAllowed) return;
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.08;
    button.style.transform = `translate(${Math.max(-5, Math.min(5, offsetX))}px, ${Math.max(-5, Math.min(5, offsetY))}px)`;
  });
  button.addEventListener('pointerleave', () => { button.style.transform = ''; });
});

document.querySelectorAll('.contact-links a').forEach((link) => {
  const href = link.getAttribute('href') || '';
  if (!href.startsWith('mailto:')) return;
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'copy-button';
  copyButton.textContent = 'Copy';
  copyButton.setAttribute('aria-label', `Copy ${link.textContent.trim()}`);
  copyButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = link.textContent.replace(/Copy|\s+/g, '').trim();
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = 'Copied';
      showToast('Copied to clipboard');
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1600);
    } catch (error) {
      showToast('Copy is unavailable in this browser');
    }
  });
  link.append(copyButton);
});

const emailLinks = document.querySelectorAll('[href^="mailto:"]');
emailLinks.forEach((link) => {
  const targetEmail = config.contactEmail || 'aegza.ai@gmail.com';
  link.href = `mailto:${targetEmail}`;
  if (link.textContent.includes('@')) link.textContent = targetEmail;
});

if (form) {
  const requiredFields = ['fullName', 'email', 'projectType', 'message'];
  form.noValidate = true;

  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
  };

  const showError = (name, message) => {
    const field = form.elements[name];
    if (!field) return;
    let error = form.querySelector(`[data-error="${name}"]`);
    if (!error) {
      error = document.createElement('small');
      error.className = 'field-error';
      error.dataset.error = name;
      field.closest('label')?.append(error);
    }
    error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  };

  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => {
      const error = field.closest('label')?.querySelector('.field-error');
      if (error) error.textContent = '';
      field.removeAttribute('aria-invalid');
    });
  });

  const honeypot = form.querySelector('.honeypot-input');
  if (!honeypot) {
    const trap = document.createElement('input');
    trap.type = 'text';
    trap.name = 'website';
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.className = 'honeypot-input';
    form.append(trap);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const data = Object.fromEntries(new FormData(form).entries());
    data.submissionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let valid = true;

    requiredFields.forEach((name) => {
      const value = String(data[name] || '').trim();
      if (!value) {
        valid = false;
        showError(name, 'This field is required.');
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
      valid = false;
      showError('email', 'Enter a valid business email.');
    }

    if (data.website && String(data.website).trim()) {
      valid = false;
      statusMessage.textContent = 'Invalid submission.';
      statusMessage.classList.add('error');
      return;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('.button-label');
    button.disabled = true;
    button.classList.add('is-loading');
    label.textContent = 'Sending...';
    statusMessage.textContent = 'Sending your project inquiry...';
    statusMessage.classList.remove('error', 'success');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Contact request failed');
      }

      form.reset();
      statusMessage.textContent = 'Thanks — your project inquiry has been received. Someone from Aegza will review the details and get back to you.';
      statusMessage.classList.add('success');
      showToast('Inquiry received');
    } catch (error) {
      console.error('Aegza inquiry submission failed', error);
      statusMessage.textContent = `Something went wrong while sending your inquiry. Please try again or contact ${config.contactEmail} directly.`;
      statusMessage.classList.add('error');
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
      label.textContent = 'Submit Project Inquiry';
    }
  });
}

if (glow && motionAllowed) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  }, { passive: true });

  const animateGlow = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);
    requestAnimationFrame(animateGlow);
  };
  requestAnimationFrame(animateGlow);
}

const loaderSeen = sessionStorage.getItem('aegza-loader-seen');
if (loader) {
  if (loaderSeen || !motionAllowed) {
    loader.classList.add('is-done');
  } else {
    setTimeout(() => {
      loader.classList.add('is-done');
      sessionStorage.setItem('aegza-loader-seen', '1');
    }, 700);
  }
}

const stageItems = document.querySelectorAll('.stage');
if (stageItems.length) {
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        stageItems.forEach((item) => item.classList.remove('active'));
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.7 });
  stageItems.forEach((stage) => stageObserver.observe(stage));
}

const timelineStages = document.querySelectorAll('.timeline-stage');
if (timelineStages.length) {
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        timelineStages.forEach((item) => item.classList.remove('active'));
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.7 });
  timelineStages.forEach((stage) => timelineObserver.observe(stage));
}

