(() => {
  'use strict';
  const header = document.querySelector('#siteHeader');
  const progress = document.querySelector('#scrollProgress');
  const menuToggle = document.querySelector('#menuToggle');
  const mainNav = document.querySelector('#mainNav');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const footerYear = document.querySelector('#footerYear');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  function updateScroll() {
    const y = window.scrollY || 0;
    header?.classList.toggle('is-scrolled', y > 20);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function closeMenu() {
    mainNav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  }
  menuToggle?.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    mainNav?.classList.toggle('is-open', opening);
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', opening);
  });
  mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 970) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px 30px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
      });
    }, { rootMargin: '-28% 0px -59% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  }

  // Portfolio category filters, with keyboard-accessible native buttons.
  const cards = [...document.querySelectorAll('.project-card')];
  const filters = [...document.querySelectorAll('.filter-btn')];
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => {
      card.hidden = selected !== 'todos' && !(card.dataset.category || '').split(' ').includes(selected);
    });
  }));

  // Full-screen photographic gallery.
  const dialog = document.querySelector('#galleryDialog');
  const bigImage = document.querySelector('#galleryDialogImage');
  const imageTitle = document.querySelector('#galleryDialogTitle');
  const imageDescription = document.querySelector('#galleryDialogDescription');
  const imageCount = document.querySelector('#dialogCount');
  let activeIndex = 0;
  const visibleCards = () => cards.filter(card => !card.hidden);
  function showCard(index) {
    const shown = visibleCards();
    if (!shown.length) return;
    activeIndex = (index + shown.length) % shown.length;
    const card = shown[activeIndex];
    if (bigImage) {
      bigImage.src = card.dataset.image;
      bigImage.alt = card.querySelector('img')?.alt || card.dataset.title;
    }
    if (imageTitle) imageTitle.textContent = card.dataset.title;
    if (imageDescription) imageDescription.textContent = card.dataset.description;
    if (imageCount) imageCount.textContent = `${String(activeIndex + 1).padStart(2,'0')} / ${String(shown.length).padStart(2,'0')}`;
  }
  cards.forEach(card => card.addEventListener('click', () => {
    const shown = visibleCards();
    showCard(shown.indexOf(card));
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelector('#dialogClose')?.addEventListener('click', () => dialog?.close());
  document.querySelector('#dialogPrev')?.addEventListener('click', () => showCard(activeIndex - 1));
  document.querySelector('#dialogNext')?.addEventListener('click', () => showCard(activeIndex + 1));
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showCard(activeIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showCard(activeIndex + 1); }
  });

  // Real WhatsApp hand-off. Nothing is claimed to have been sent by the website.
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#formStatus');
  const contactNumber = '351914164613'; // Confirmed public telephone; WhatsApp availability must be checked before publishing.
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) {
        status.textContent = 'Por favor, preencha os campos obrigatórios e aceite a informação de privacidade.';
        status.classList.add('is-error');
      }
      return;
    }
    const get = name => String(form.elements.namedItem(name)?.value || '').trim();
    const message = [
      'Olá, gostaria de obter informações sobre um projeto.',
      '',
      `Nome: ${get('nome')}`,
      `Email: ${get('email')}`,
      `Telefone: ${get('telefone') || 'Não indicado'}`,
      `Tipo de projeto: ${get('assunto')}`,
      '',
      'Mensagem:',
      get('mensagem')
    ].join('\n');
    const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`;
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (status) {
      status.classList.remove('is-error');
      status.replaceChildren(document.createTextNode('O WhatsApp deverá abrir com a sua mensagem preparada. Confirme aí o envio. Se não abrir, '));
      const fallback = document.createElement('a');
      fallback.href = whatsappUrl;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'clique aqui para abrir a mensagem';
      fallback.style.textDecoration = 'underline';
      status.appendChild(fallback);
      status.appendChild(document.createTextNode('.'));
    }
  });
})();