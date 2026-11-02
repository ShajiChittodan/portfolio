/**
 * Shaji Chittodan Executive Portfolio
 * Client Interactions & Time Synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Dubai Clock (GST: UTC+4)
  const clockEl = document.getElementById('dubai-clock');

  function updateDubaiClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat([], options);
      clockEl.textContent = `${formatter.format(now)} GST`;
    } catch (e) {
      // Fallback calculation for UTC+4
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * 4));
      const hours = String(nd.getHours()).padStart(2, '0');
      const minutes = String(nd.getMinutes()).padStart(2, '0');
      const seconds = String(nd.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds} GST`;
    }
  }

  updateDubaiClock();
  setInterval(updateDubaiClock, 1000);

  // 2. Interactive Workflow Scenario Tabs
  const tabs = document.querySelectorAll('.workflow-tab');
  const panels = document.querySelectorAll('.workflow-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      // Update tabs state
      tabs.forEach(t => {
        const isActive = (t === tab);
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update panels state
      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', '');
        }
      });
    });

    // Keyboard navigation for tabs
    tab.addEventListener('keydown', (e) => {
      let index = Array.from(tabs).indexOf(tab);
      if (e.key === 'ArrowRight') {
        const next = tabs[(index + 1) % tabs.length];
        next.focus();
        next.click();
      } else if (e.key === 'ArrowLeft') {
        const prev = tabs[(index - 1 + tabs.length) % tabs.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    // Close on navigation link click
    const mobileLinks = mobileDrawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // 4. Copy Email Interaction
  const copyBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  if (copyBtn && copyBtnText) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email') || 'shajicp@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = copyBtnText.textContent;
        copyBtnText.textContent = 'Copied to Clipboard!';
        copyBtn.style.borderColor = 'var(--color-accent)';
        setTimeout(() => {
          copyBtnText.textContent = originalText;
          copyBtn.style.borderColor = '';
        }, 2500);
      } catch (err) {
        // Fallback prompt if clipboard API blocked
        window.prompt('Copy email address:', email);
      }
    });
  }
});

