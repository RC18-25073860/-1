import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { ProfileData } from '../types/profile';
import { THEMES } from './themes';
import { SCENES } from './scenes';
import { normalizeProfileData, planLayout } from './normalization';
import { ProfileCardRenderer } from '../components/preview/ProfileCardRenderer';

export function generateProfileHtml(data: ProfileData, css?: string): string {
  const theme = THEMES[data.themeId];
  const scene = SCENES.find(s => s.id === data.sceneId)!;
  const normalizedData = normalizeProfileData(data, scene);
  const layoutPlan = planLayout(normalizedData);

  // Render the component to static HTML
  const contentHtml = renderToStaticMarkup(
    React.createElement(ProfileCardRenderer, {
      data,
      normalizedData,
      layoutPlan,
      theme,
      activeSection: null,
      onSectionSelect: () => {},
      onUpdateField: () => {},
      mode: 'export'
    })
  );

  const tailwindScript = !css ? '<script src="https://unpkg.com/@tailwindcss/browser@4"></script>' : '';
  const inlineStyles = css ? `<style>${css}</style>` : '';

  return `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${normalizedData.name} | ${normalizedData.title}</title>
  ${tailwindScript}
  ${inlineStyles}
  <script type="text/tailwindcss">
    @theme {
      --font-sans: "Inter", "DM Sans", ui-sans-serif, system-ui, sans-serif;
      --font-serif: "Playfair Display", ui-serif, Georgia, serif;
      --font-display: "Outfit", sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, monospace;
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=DM+Sans:wght@300;400;500;700&family=Outfit:wght@300;400;700;900&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --background: ${theme.background};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --border: ${theme.border};
    }

    body {
      background-color: var(--background);
      color: var(--text);
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      height: auto !important;
      min-height: 100vh;
    }

    #root {
      width: 100%;
      max-width: ${data.size.width}px;
      margin: 0 auto;
      height: auto !important;
      overflow: visible !important;
    }

    .reveal-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .reveal-on-scroll.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Hover Interactions */
    .premium-lift {
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), 
                  box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                  opacity 0.6s ease !important;
    }
    .premium-lift:hover {
      transform: translateY(-8px) scale(1.02) !important;
      box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15), 0 18px 36px -18px rgba(0,0,0,0.2) !important;
      z-index: 10;
    }

    .timeline-dot::before {
      content: '';
      position: absolute;
      left: -1.25rem;
      top: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      background-color: var(--primary);
      border-radius: 50%;
    }

    /* Custom Cursor */
    #custom-cursor {
      position: fixed;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1), 
                  height 0.3s cubic-bezier(0.22, 1, 0.36, 1), 
                  background 0.3s ease;
      display: none;
    }

    @media (hover: hover) {
      #custom-cursor {
        display: block;
      }
      body {
        cursor: none;
      }
      a, button, .cursor-pointer, [data-tilt] {
        cursor: none !important;
      }
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: var(--background);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.2);
    }

    /* Grid and Collapsible */
    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      width: 100%;
    }

    .collapsible-content {
      transition: max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
      overflow: hidden;
      max-height: 2000px;
      opacity: 1;
    }
    .collapsible-content.collapsed {
      max-height: 0;
      opacity: 0;
    }
    .collapse-toggle {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .collapse-icon {
      transition: transform 0.3s ease;
    }
    .collapsed .collapse-icon {
      transform: rotate(-180deg);
    }

    /* Lightbox */
    #lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      backdrop-filter: blur(10px);
      z-index: 9999;
      cursor: zoom-out;
      padding: 2rem;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    #lightbox.active {
      display: flex;
      opacity: 1;
    }
    #lightbox img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 0.5rem;
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
      transform: scale(0.9);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    #lightbox.active img {
      transform: scale(1);
    }
    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.1);
      color: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: all 0.3s ease;
    }
    .lightbox-nav:hover {
      background: rgba(255,255,255,0.2);
      scale: 1.1;
    }
    .lightbox-prev { left: 2rem; }
    .lightbox-next { right: 2rem; }
  </style>
</head>
<body>
  <div id="custom-cursor"></div>

  <div id="root">
    ${contentHtml}
  </div>

  <div id="lightbox">
    <button class="lightbox-nav lightbox-prev">←</button>
    <img src="" alt="Enlarged view">
    <button class="lightbox-nav lightbox-next">→</button>
  </div>

  <script>
    // Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    const interactiveElements = document.querySelectorAll('a, button, .premium-lift, [role="button"], [data-tilt]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '60px';
        cursor.style.height = '60px';
        cursor.style.background = 'rgba(255, 255, 255, 0.15)';
        cursor.style.border = '1px solid rgba(255, 255, 255, 0.5)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.background = 'rgba(255, 255, 255, 0.1)';
        cursor.style.border = '1px solid rgba(255, 255, 255, 0.3)';
      });
    });

    // Collapse Logic
    document.querySelectorAll('.premium-lift').forEach(el => {
      const header = el.querySelector('.flex.items-center.justify-between.mb-4');
      const content = el.querySelector('.transition-all.duration-500');
      
      if (header && content) {
        header.classList.add('collapse-toggle');
        content.classList.add('collapsible-content');
        
        const icon = document.createElement('div');
        icon.className = 'collapse-icon';
        icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        header.appendChild(icon);
        
        header.addEventListener('click', () => {
          content.classList.toggle('collapsed');
          header.classList.toggle('collapsed');
        });
      }
    });

    // Collapse Logic
    document.querySelectorAll('.premium-lift').forEach(el => {
      const header = el.querySelector('.flex.items-center.justify-between.mb-4');
      const content = el.querySelector('.transition-all.duration-500');
      
      if (header && content) {
        header.classList.add('collapse-toggle');
        content.classList.add('collapsible-content');
        
        const icon = document.createElement('div');
        icon.className = 'collapse-icon';
        icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        header.appendChild(icon);
        
        header.addEventListener('click', () => {
          content.classList.toggle('collapsed');
          header.classList.toggle('collapsed');
        });
      }
    });

    // Tilt Effect
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        el.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });

    // Magnetic Effect
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px)';
      });
    });

    // Scroll Reveal Logic
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      observer.observe(el);
    });

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let currentImages = [];
    let currentIndex = 0;

    const updateLightbox = (index) => {
      currentIndex = index;
      lightboxImg.src = currentImages[currentIndex].src;
    };

    document.querySelectorAll('img').forEach((img, idx) => {
      if (img.offsetWidth > 50 || img.offsetHeight > 50) {
        currentImages.push(img);
        const localIndex = currentImages.length - 1;
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          updateLightbox(localIndex);
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      }
    });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateLightbox(newIndex);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newIndex = (currentIndex + 1) % currentImages.length;
      updateLightbox(newIndex);
    });

    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  </script>
</body>
</html>
  `;
}
