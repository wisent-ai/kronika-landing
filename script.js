(() => {
  const toggle = document.querySelector('.nav-toggle');
  const sidebar = document.querySelector('.docs-sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  const filter = document.querySelector('[data-docs-filter]');
  const navigation = document.querySelector('[data-docs-nav]');
  const empty = document.querySelector('.filter-empty');

  if (filter && navigation) {
    const sections = [...navigation.querySelectorAll('section')];
    filter.addEventListener('input', () => {
      const query = filter.value.trim().toLocaleLowerCase();
      let visibleLinks = 0;

      sections.forEach((section) => {
        let sectionLinks = 0;
        section.querySelectorAll('a').forEach((link) => {
          const visible = !query || link.textContent.toLocaleLowerCase().includes(query);
          link.hidden = !visible;
          sectionLinks += visible ? 1 : 0;
        });
        section.hidden = sectionLinks === 0;
        visibleLinks += sectionLinks;
      });

      if (empty) empty.hidden = visibleLinks !== 0;
    });
  }
})();
