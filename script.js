document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const header = document.getElementById('mainHeader');
  const scrollProgressBar = document.getElementById('scrollProgressBar');

  const desktopDropdownItems = document.querySelectorAll('.desktop-nav .has-dropdown');
  const nestedSubItems = document.querySelectorAll('.desktop-nav .nested-item.has-sub');

  const searchTriggers = document.querySelectorAll('.search-trigger-btn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const suggestionTags = document.querySelectorAll('.suggestion-tag');

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.mobile-drawer a');

  const mainAccordionHeaders = document.querySelectorAll('.accordion-header');
  const nestedAccordionHeaders = document.querySelectorAll('.nested-accordion-header');
  const level3AccordionHeaders = document.querySelectorAll('.level3-accordion-header');

  /* Scroll Physics */
  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (windowHeight > 0 && scrollProgressBar) {
      const scrollPercent = Math.min(Math.max((currentScrollY / windowHeight) * 100, 0), 100);
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    if (currentScrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    const isAnyDesktopMenuOpen = document.querySelector('.desktop-nav .menu-open');
    const isMobileDrawerOpen = mobileDrawer.classList.contains('is-active');

    if (!isAnyDesktopMenuOpen && !isMobileDrawerOpen) {
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        header.classList.add('header-hidden');
      } else if (currentScrollY < lastScrollY) {
        header.classList.remove('header-hidden');
      }
    }

    lastScrollY = Math.max(currentScrollY, 0);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  handleScroll();

  /* Desktop Dropdowns & A11y */
  const closeAllDesktopDropdowns = () => {
    desktopDropdownItems.forEach(item => {
      item.classList.remove('menu-open');
      const toggle = item.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });

    nestedSubItems.forEach(subItem => {
      subItem.classList.remove('menu-open');
      const toggle = subItem.querySelector('.nested-link');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  };

  const adjustSubMenuPosition = (subMenu) => {
    if (!subMenu) return;
    const rect = subMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 20) {
      subMenu.classList.add('open-left');
    } else {
      subMenu.classList.remove('open-left');
    }
  };

  desktopDropdownItems.forEach(item => {
    const toggleBtn = item.querySelector('.dropdown-toggle');
    if (!toggleBtn) return;

    item.addEventListener('mouseenter', () => {
      closeAllDesktopDropdowns();
      item.classList.add('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('menu-open');
      closeAllDesktopDropdowns();

      if (!isOpen) {
        item.classList.add('menu-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('menu-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  nestedSubItems.forEach(subItem => {
    const subToggle = subItem.querySelector('button.nested-link');
    const subPanel = subItem.querySelector('.sub-menu-panel');
    if (!subToggle || !subPanel) return;

    subItem.addEventListener('mouseenter', () => {
      subItem.classList.add('menu-open');
      subToggle.setAttribute('aria-expanded', 'true');
      adjustSubMenuPosition(subPanel);
    });

    subItem.addEventListener('mouseleave', () => {
      subItem.classList.remove('menu-open');
      subToggle.setAttribute('aria-expanded', 'false');
    });

    subToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = subItem.classList.contains('menu-open');

      const siblings = subItem.parentElement.querySelectorAll(':scope > .nested-item.has-sub');
      siblings.forEach(sib => {
        if (sib !== subItem) {
          sib.classList.remove('menu-open');
          const btn = sib.querySelector('button.nested-link');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      if (!isOpen) {
        subItem.classList.add('menu-open');
        subToggle.setAttribute('aria-expanded', 'true');
        adjustSubMenuPosition(subPanel);
      } else {
        subItem.classList.remove('menu-open');
        subToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-nav')) {
      closeAllDesktopDropdowns();
    }
  });

  /* Search Modal */
  const openSearch = () => {
    searchOverlay.removeAttribute('hidden');
    void searchOverlay.offsetWidth;
    searchOverlay.classList.add('is-active');
    document.body.classList.add('no-scroll');
    closeAllDesktopDropdowns();
    setTimeout(() => { if (searchInput) searchInput.focus(); }, 120);
  };

  const closeSearch = () => {
    searchOverlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      searchOverlay.setAttribute('hidden', '');
      if (searchInput) searchInput.value = '';
      if (searchClearBtn) searchClearBtn.classList.remove('is-visible');
    }, 280);
  };

  searchTriggers.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openSearch(); }));
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

  if (searchInput && searchClearBtn) {
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim().length > 0) {
        searchClearBtn.classList.add('is-visible');
      } else {
        searchClearBtn.classList.remove('is-visible');
      }
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.classList.remove('is-visible');
      searchInput.focus();
    });
  }

  suggestionTags.forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = tag.textContent.trim();
        searchClearBtn.classList.add('is-visible');
        searchInput.focus();
      }
    });
  });

  /* Mobile Drawer */
  const openMobileDrawer = () => {
    mobileDrawer.classList.add('is-active');
    drawerBackdrop.classList.add('is-active');
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    header.classList.remove('header-hidden');
  };

  const closeMobileDrawer = () => {
    mobileDrawer.classList.remove('is-active');
    drawerBackdrop.classList.remove('is-active');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('is-active')) closeMobileDrawer();
      else openMobileDrawer();
    });
  }

  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', () => setTimeout(closeMobileDrawer, 180)));

  /* Mobile Accordion Engine */
  const updateAncestorHeights = (element) => {
    let parentCollapse = element.closest('.accordion-collapse');
    while (parentCollapse) {
      parentCollapse.style.maxHeight = `${parentCollapse.scrollHeight}px`;
      const nextParent = parentCollapse.parentElement.closest('.accordion-collapse');
      parentCollapse = nextParent;
    }
  };

  mainAccordionHeaders.forEach(headerBtn => {
    headerBtn.addEventListener('click', () => {
      const parentItem = headerBtn.closest('.accordion-item');
      const collapseContent = parentItem.querySelector('.accordion-collapse');
      const isCurrentlyOpen = parentItem.classList.contains('is-open');

      if (isCurrentlyOpen) {
        collapseContent.style.maxHeight = null;
        parentItem.classList.remove('is-open');
        headerBtn.setAttribute('aria-expanded', 'false');
      } else {
        collapseContent.style.maxHeight = `${collapseContent.scrollHeight}px`;
        parentItem.classList.add('is-open');
        headerBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  nestedAccordionHeaders.forEach(headerBtn => {
    headerBtn.addEventListener('click', () => {
      const parentItem = headerBtn.closest('.nested-accordion-item');
      const collapseContent = parentItem.querySelector('.nested-accordion-collapse');
      const isCurrentlyOpen = parentItem.classList.contains('is-open');

      if (isCurrentlyOpen) {
        collapseContent.style.maxHeight = null;
        parentItem.classList.remove('is-open');
        headerBtn.setAttribute('aria-expanded', 'false');
      } else {
        collapseContent.style.maxHeight = `${collapseContent.scrollHeight}px`;
        parentItem.classList.add('is-open');
        headerBtn.setAttribute('aria-expanded', 'true');
      }
      setTimeout(() => updateAncestorHeights(parentItem), 20);
    });
  });

  level3AccordionHeaders.forEach(headerBtn => {
    headerBtn.addEventListener('click', () => {
      const parentItem = headerBtn.closest('.level-3-accordion-item');
      const collapseContent = parentItem.querySelector('.level3-accordion-collapse');
      const isCurrentlyOpen = parentItem.classList.contains('is-open');

      if (isCurrentlyOpen) {
        collapseContent.style.maxHeight = null;
        parentItem.classList.remove('is-open');
        headerBtn.setAttribute('aria-expanded', 'false');
      } else {
        collapseContent.style.maxHeight = `${collapseContent.scrollHeight}px`;
        parentItem.classList.add('is-open');
        headerBtn.setAttribute('aria-expanded', 'true');
      }
      setTimeout(() => updateAncestorHeights(parentItem), 20);
    });
  });

  /* ESC Key Handling */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (searchOverlay.classList.contains('is-active')) {
        closeSearch();
        const firstSearchTrigger = document.querySelector('.search-trigger-btn');
        if (firstSearchTrigger) firstSearchTrigger.focus();
        return;
      }
      if (mobileDrawer.classList.contains('is-active')) {
        closeMobileDrawer();
        if (hamburgerBtn) hamburgerBtn.focus();
        return;
      }
      const activeDesktopDropdown = document.querySelector('.desktop-nav .menu-open');
      if (activeDesktopDropdown) {
        const toggle = activeDesktopDropdown.querySelector('.dropdown-toggle');
        closeAllDesktopDropdowns();
        if (toggle) toggle.focus();
      }
    }
  });

  /* Active Section Highlighting */
  const sections = document.querySelectorAll('section[id], main > [id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link, .drawer-nav .accordion-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) link.classList.add('active');
            else if (href && href.startsWith('#') && href !== `#${activeId}`) link.classList.remove('active');
          });
        }
      });
    }, { root: null, rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(sec => observer.observe(sec));
  }
});