// Shared helpers for the public pages (landing + customer account).
window.Site = (() => {
  // Where the "Donate" buttons send people: the real Museum of Fine Arts,
  // Houston. This demo collects no donations itself.
  const DONATION_URL = 'https://www.mfah.org/support';

  // Ticket prices shown to customers. The server sets the real price
  // when a ticket is booked (backend/routes/customerTickets.js).
  const TICKET_PRICES = { Adult: 20, Student: 12, Senior: 14, Child: 8 };

  // Images for each exhibition, matched by title.
  // "banner" is used when the works cannot be shown because of copyright.
  const EXHIBITION_MEDIA = {
    'Light & Color: Impressionist Masters': { src: '../artworks/water-lilies.jpg', credit: 'Claude Monet, Water Lilies, 1907. Wikimedia Commons, public domain' },
    'Hokusai and the Floating World': { src: 'hokusai.jpg', credit: 'Katsushika Hokusai, The Great Wave off Kanagawa. The Metropolitan Museum of Art, Open Access' },
    'American Modernism': { src: 'american-modernism.png', credit: 'Charles Demuth, I Saw the Figure 5 in Gold, 1928. The Metropolitan Museum of Art, Open Access' },
    'Frida Kahlo: Portraits of Self': { banner: 'Frida Kahlo', note: 'Works in this exhibition are protected by copyright.' },
    'Houston Voices: Contemporary Local Artists': { src: 'houston-voices.jpg', credit: 'Carol M. Highsmith Archive, Library of Congress' },
    'Rembrandt to Monet: Four Centuries': { src: 'rembrandt-to-monet.jpg', credit: 'Rembrandt, Self-Portrait with Two Circles. Wikimedia Commons, public domain' }
  };

  // Images for each artwork, matched by title.
  const ARTWORK_MEDIA = {
    'The Great Wave off Kanagawa': { src: 'great-wave.jpg', credit: 'The Metropolitan Museum of Art, Open Access' },
    'Fine Wind, Clear Morning (Red Fuji)': { src: 'red-fuji.jpg', credit: 'The Metropolitan Museum of Art, Open Access' },
    'Self-Portrait with Two Circles': { src: 'rembrandt-two-circles.jpg', credit: 'Wikimedia Commons, public domain' },
    'Little Dancer Aged Fourteen': { src: 'little-dancer.png', credit: 'National Gallery of Art, Washington, Open Access' },
    'The Rocks': { src: 'the-rocks.jpg', credit: 'Wikimedia Commons, public domain' },
    'Water Lilies': { src: 'water-lilies.jpg', credit: 'Wikimedia Commons, public domain' },
    'Untitled (Ship Channel)': { src: 'ship-channel.jpg', credit: 'Photo: Carol M. Highsmith Archive, Library of Congress' },
    'Bayou at Dusk': { src: 'bayou-at-dusk.jpg', credit: 'Photo: Carol M. Highsmith Archive, Library of Congress' },
    'Third Ward Morning': { src: 'third-ward-morning.jpg', credit: 'Photo: Carol M. Highsmith Archive, Library of Congress' },
    // Stand-in image: no real artwork exists for this title
    'The fall of Jake Paul': { src: 'fall-of-icarus.jpg', credit: 'Stand-in image: Pieter Bruegel the Elder (attrib.), Landscape with the Fall of Icarus. Wikimedia Commons, public domain' },
    // Still under copyright; low-resolution images used for educational purposes.
    'The Two Fridas': { src: 'two-fridas.jpg', credit: '© Banco de México Diego Rivera Frida Kahlo Museums Trust. Image via Wikipedia, used for educational purposes' },
    'Self-Portrait with Thorn Necklace and Hummingbird': { src: 'thorn-necklace.jpg', credit: '© Banco de México Diego Rivera Frida Kahlo Museums Trust. Image via Wikipedia, used for educational purposes' },
    'Jimson Weed/White Flower No. 1': { src: 'jimson-weed.jpg', credit: '© Georgia O\'Keeffe Museum. Image: Georgia O\'Keeffe Museum, used for educational purposes' },
    'No. 61 (Rust and Blue)': { src: 'rust-and-blue.jpg', credit: '© Kate Rothko Prizel & Christopher Rothko. Image via Wikipedia, used for educational purposes' }
  };

  // Gift-shop products are shown with the artwork they are based on.
  // Matched by a word in the product name; anything else gets a monogram.
  const PRODUCT_ART = [
    [/water lil|monet|impressionis/i, 'artworks/water-lilies.jpg'],
    [/great wave/i, 'artworks/great-wave.jpg'],
    [/hokusai/i, 'artworks/red-fuji.jpg'],
    [/frida|kahlo/i, 'artworks/two-fridas.jpg'],
    [/van gogh/i, 'artworks/the-rocks.jpg'],
    [/rothko/i, 'artworks/rust-and-blue.jpg'],
    [/postcard/i, 'exhibitions/rembrandt-to-monet.jpg'],
    [/kids|art kit/i, 'exhibitions/american-modernism.png']
  ];

  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null && text !== '') el.textContent = text;
    return el;
  }

  function placeholder(note) {
    const box = make('div', 'image-unavailable');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Image unavailable');
    box.append(make('span', 'label-title', 'Image unavailable'), make('span', 'label-note', note));
    return box;
  }

  // Returns the picture for a card: an image, a text banner, or a placeholder.
  function media(entry, folder, altText, className = 'art-image') {
    if (!entry) return placeholder('No image on file for this work yet.');
    if (entry.banner) {
      const banner = make('div', 'exhibit-banner');
      banner.append(make('span', 'banner-title', entry.banner), make('span', 'banner-note', entry.note));
      return banner;
    }
    const img = make('img', className);
    img.src = '/images/' + folder + '/' + entry.src;
    img.alt = altText;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => img.replaceWith(placeholder('Image could not be loaded.'));
    return img;
  }

  function productImage(name) {
    const hit = PRODUCT_ART.find(([pattern]) => pattern.test(name));
    return hit ? '/images/' + hit[1] : null;
  }

  function formatDate(value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
    if (!value) return '';
    const date = new Date(String(value).slice(0, 10) + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
  }

  const money = n => '$' + Number(n || 0).toFixed(2);

  // Header turns solid once the page scrolls past the hero top.
  function stickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header || header.classList.contains('solid')) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Fade elements in as they scroll into view. Content is only hidden once
  // this script runs, so the page still shows everything if JS fails.
  // Add ?static to the URL to skip the effect (used for screenshots).
  const animate = 'IntersectionObserver' in window && !new URLSearchParams(location.search).has('static');
  if (animate) document.documentElement.classList.add('js-reveal');
  const observer = animate
    ? new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;

  function reveal(root = document) {
    const items = root.querySelectorAll ? root.querySelectorAll('.reveal:not(.in)') : [];
    const list = root.classList && root.classList.contains('reveal') ? [root, ...items] : items;
    for (const el of list) {
      if (observer) observer.observe(el); else el.classList.add('in');
    }
  }

  // Wire up donation links on any page that has them.
  function donationLinks() {
    for (const link of document.querySelectorAll('[data-donate]')) {
      link.href = DONATION_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'Opens the Museum of Fine Arts, Houston website (external)';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    stickyHeader();
    donationLinks();
    reveal();
  });

  return {
    DONATION_URL, TICKET_PRICES, EXHIBITION_MEDIA, ARTWORK_MEDIA,
    make, media, placeholder, productImage, formatDate, money, reveal
  };
})();
