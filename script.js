/*
 * Custom JavaScript for MindCare web app
 * Handles responsive navigation toggling and basic contact form interaction
 */

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  // Toggle mobile navigation menu
  navToggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      // Skip if link refers to external or nav toggle button
      if (this.getAttribute('href') === '#') return;
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        // Offset scroll for fixed header height
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const offsetTop = targetElem.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        // Close mobile nav after clicking link
        nav.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  });

  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Show a simple thank you message to the user
      alert('ขอบคุณสำหรับข้อความของคุณ! เราจะติดต่อกลับโดยเร็วที่สุด');
      contactForm.reset();
    });
  }
});