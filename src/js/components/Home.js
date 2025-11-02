import { templates, select, classNames } from '../setting.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
    thisHome.initActions();
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.homePage();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    // referencje do elementów Flickity i przycisków
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.home__review-carousel');
    thisHome.dom.orderBtn = thisHome.dom.wrapper.querySelector('.home__btn--order');
    thisHome.dom.bookingBtn = thisHome.dom.wrapper.querySelector('.home__btn--booking');
  }

  initWidgets() {
    const thisHome = this;

    thisHome.flickity = new Flickity(thisHome.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: 3000, // co 3 sekundy
      prevNextButtons: false,
      pageDots: false,
      draggable: false,
      pauseAutoPlayOnHover: false,
    });
  }

  initActions() {
    const thisHome = this;

    // Obsługa kliknięcia ORDER ONLINE
    thisHome.dom.orderBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const pageId = 'order';
      thisHome.activatePage(pageId);
    });

    // Obsługa kliknięcia BOOK A TABLE
    thisHome.dom.bookingBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const pageId = 'booking';
      thisHome.activatePage(pageId);
    });
  }

  activatePage(pageId) {
    const pages = document.querySelector(select.containerOf.pages).children;
    const navLinks = document.querySelectorAll(select.nav.links);

    for (let page of pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for (let link of navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

    window.location.hash = '#/' + pageId;
  }
}

export default Home;
