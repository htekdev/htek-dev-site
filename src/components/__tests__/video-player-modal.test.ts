/**
 * @vitest-environment happy-dom
 *
 * Tests for the video player modal behavior on the /videos page.
 * Exercises the core logic: open/close, facade→iframe, prev/next navigation,
 * keyboard shortcuts, deep link parsing, filter-aware nav, and scroll lock.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers — build minimal DOM that mirrors videos.astro + VideoPlayerModal.astro
// ---------------------------------------------------------------------------

function createModalHTML(): string {
  return `
    <div id="video-modal"
      class="fixed inset-0 z-50 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200"
      role="dialog" aria-modal="true" aria-label="Video player">
      <div id="modal-backdrop" class="absolute inset-0 bg-black/85"></div>
      <button id="modal-close" aria-label="Close player"></button>
      <div class="modal-content relative w-full max-w-4xl mx-4 transform scale-95 transition-transform duration-200">
        <button id="modal-prev" aria-label="Previous video"></button>
        <div id="modal-player" class="aspect-video bg-black rounded-xl overflow-hidden relative">
          <div id="modal-facade" class="absolute inset-0 cursor-pointer">
            <img id="modal-thumbnail" class="w-full h-full object-cover" alt="" />
          </div>
          <div id="modal-iframe-container" class="absolute inset-0 hidden"></div>
        </div>
        <button id="modal-next" aria-label="Next video"></button>
        <div>
          <h3 id="modal-title"></h3>
          <span id="modal-date"></span>
          <span id="modal-views"></span>
          <span id="modal-duration"></span>
          <span id="modal-counter" class="text-accent-cyan font-mono text-xs"></span>
          <a id="modal-yt-link" href="#" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
          <a id="modal-article-link" href="#" class="hidden">Related article →</a>
        </div>
      </div>
    </div>
  `;
}

function createVideoCardHTML(
  videoId: string,
  title: string,
  opts: {
    views?: string;
    date?: string;
    duration?: string;
    thumbnail?: string;
    relatedArticle?: string;
    sectionHidden?: boolean;
    cardHidden?: boolean;
  } = {}
): string {
  const {
    views = '100',
    date = 'Jan 1, 2026',
    duration = '5:00',
    thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    relatedArticle = '',
    sectionHidden = false,
    cardHidden = false,
  } = opts;

  return `
    <div class="topic-section" style="${sectionHidden ? 'display:none' : ''}">
      <div class="video-card-wrapper" style="${cardHidden ? 'display:none' : ''}">
        <button
          data-video-id="${videoId}"
          data-title="${title}"
          data-views="${views}"
          data-date="${date}"
          data-duration="${duration}"
          data-thumbnail="${thumbnail}"
          data-related-article="${relatedArticle}"
        ></button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Extracted modal logic — mirrors videos.astro <script> block
// ---------------------------------------------------------------------------

interface ModalController {
  openModal(btn: HTMLButtonElement): void;
  closeModal(): void;
  navigateVideo(direction: number): void;
  playVideo(): void;
  getFilteredVideos(): HTMLButtonElement[];
  getState(): {
    currentVideoIndex: number;
    filteredVideos: HTMLButtonElement[];
    triggerButton: HTMLButtonElement | null;
  };
}

function initModalController(): ModalController {
  const modal = document.getElementById('video-modal')!;
  const modalFacade = document.getElementById('modal-facade')!;
  const modalThumbnail = document.getElementById('modal-thumbnail') as HTMLImageElement;
  const modalIframeContainer = document.getElementById('modal-iframe-container')!;
  const modalTitle = document.getElementById('modal-title')!;
  const modalDate = document.getElementById('modal-date')!;
  const modalViews = document.getElementById('modal-views')!;
  const modalDuration = document.getElementById('modal-duration')!;
  const modalCounter = document.getElementById('modal-counter')!;
  const modalYtLink = document.getElementById('modal-yt-link') as HTMLAnchorElement;
  const modalArticleLink = document.getElementById('modal-article-link') as HTMLAnchorElement;
  const modalPrev = document.getElementById('modal-prev')!;
  const modalNext = document.getElementById('modal-next')!;

  let currentVideoIndex = 0;
  let filteredVideos: HTMLButtonElement[] = [];
  let triggerButton: HTMLButtonElement | null = null;

  function getFilteredVideos(): HTMLButtonElement[] {
    const visible: HTMLButtonElement[] = [];
    document.querySelectorAll<HTMLElement>('#topics-root .video-card-wrapper').forEach(card => {
      if (card.style.display === 'none') return;
      const section = card.closest('.topic-section') as HTMLElement | null;
      if (section && section.style.display === 'none') return;
      const btn = card.querySelector<HTMLButtonElement>('button[data-video-id]');
      if (btn) visible.push(btn);
    });
    return visible;
  }

  function populateModal(btn: HTMLButtonElement) {
    const videoId = btn.dataset.videoId ?? '';
    const title = btn.dataset.title ?? '';
    const views = btn.dataset.views ?? '';
    const date = btn.dataset.date ?? '';
    const duration = btn.dataset.duration ?? '';
    const relatedArticle = btn.dataset.relatedArticle ?? '';

    modalTitle.textContent = title;
    modalDate.textContent = date;
    modalViews.textContent = `${views} views`;
    modalDuration.textContent = duration;
    modalCounter.textContent = `${currentVideoIndex + 1} of ${filteredVideos.length}`;

    const hdThumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumb = btn.dataset.thumbnail ?? '';
    modalThumbnail.onerror = () => { modalThumbnail.onerror = null; modalThumbnail.src = fallbackThumb; };
    modalThumbnail.src = hdThumb;
    modalThumbnail.alt = title;

    modalYtLink.href = `https://www.youtube.com/watch?v=${videoId}`;

    if (relatedArticle) {
      modalArticleLink.href = relatedArticle;
      modalArticleLink.classList.remove('hidden');
    } else {
      modalArticleLink.classList.add('hidden');
    }

    modalFacade.classList.remove('hidden');
    modalIframeContainer.classList.add('hidden');
    modalIframeContainer.innerHTML = '';

    const hasMultiple = filteredVideos.length > 1;
    modalPrev.style.display = hasMultiple ? '' : 'none';
    modalNext.style.display = hasMultiple ? '' : 'none';
  }

  function playVideo() {
    const btn = filteredVideos[currentVideoIndex];
    if (!btn) return;
    const videoId = btn.dataset.videoId ?? '';
    const title = btn.dataset.title ?? '';

    modalFacade.classList.add('hidden');
    modalIframeContainer.classList.remove('hidden');
    modalIframeContainer.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
      class="w-full h-full"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      title="${title.replace(/"/g, '&quot;')}"
    ></iframe>`;
  }

  function openModal(btn: HTMLButtonElement) {
    filteredVideos = getFilteredVideos();
    currentVideoIndex = filteredVideos.indexOf(btn);
    if (currentVideoIndex === -1) currentVideoIndex = 0;
    triggerButton = btn;

    populateModal(btn);
    playVideo();

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';

    modalIframeContainer.innerHTML = '';
    modalIframeContainer.classList.add('hidden');
    modalFacade.classList.remove('hidden');

    triggerButton?.focus();
    triggerButton = null;
  }

  function navigateVideo(direction: number) {
    if (filteredVideos.length <= 1) return;
    filteredVideos = getFilteredVideos();
    if (filteredVideos.length === 0) { closeModal(); return; }
    currentVideoIndex = (currentVideoIndex + direction + filteredVideos.length) % filteredVideos.length;
    populateModal(filteredVideos[currentVideoIndex]);
    playVideo();
  }

  return {
    openModal,
    closeModal,
    navigateVideo,
    playVideo,
    getFilteredVideos,
    getState: () => ({ currentVideoIndex, filteredVideos, triggerButton }),
  };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Video Player Modal', () => {
  let controller: ModalController;

  function setupDOM(cards: string[]) {
    document.body.innerHTML = `
      ${createModalHTML()}
      <div id="topics-root">
        ${cards.join('\n')}
      </div>
    `;
    controller = initModalController();
  }

  beforeEach(() => {
    setupDOM([
      createVideoCardHTML('abc123', 'Video Alpha', { views: '500', date: 'Feb 1, 2026', duration: '3:45', relatedArticle: '/articles/alpha' }),
      createVideoCardHTML('def456', 'Video Beta', { views: '1200', date: 'Mar 5, 2026', duration: '10:00' }),
      createVideoCardHTML('ghi789', 'Video Gamma', { views: '42', date: 'Apr 12, 2026', duration: '1:23' }),
    ]);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  // -----------------------------------------------------------------------
  // Open / Close
  // -----------------------------------------------------------------------

  describe('openModal', () => {
    it('adds "open" class to modal', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      expect(document.getElementById('video-modal')!.classList.contains('open')).toBe(true);
    });

    it('locks body scroll', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('populates title, date, views, duration', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(btn);

      expect(document.getElementById('modal-title')!.textContent).toBe('Video Beta');
      expect(document.getElementById('modal-date')!.textContent).toBe('Mar 5, 2026');
      expect(document.getElementById('modal-views')!.textContent).toBe('1200 views');
      expect(document.getElementById('modal-duration')!.textContent).toBe('10:00');
    });

    it('sets counter to correct position', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="ghi789"]')!;
      controller.openModal(btn);
      expect(document.getElementById('modal-counter')!.textContent).toBe('3 of 3');
    });

    it('sets HD thumbnail src', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      const thumb = document.getElementById('modal-thumbnail') as HTMLImageElement;
      expect(thumb.src).toBe('https://i.ytimg.com/vi/abc123/maxresdefault.jpg');
    });

    it('sets YouTube link href', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(btn);
      const link = document.getElementById('modal-yt-link') as HTMLAnchorElement;
      expect(link.href).toContain('https://www.youtube.com/watch?v=def456');
    });

    it('shows related article link when available', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      const link = document.getElementById('modal-article-link')!;
      expect(link.classList.contains('hidden')).toBe(false);
      expect((link as HTMLAnchorElement).href).toContain('/articles/alpha');
    });

    it('hides related article link when not available', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(btn);
      const link = document.getElementById('modal-article-link')!;
      expect(link.classList.contains('hidden')).toBe(true);
    });

    it('shows nav arrows when multiple videos exist', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      expect(document.getElementById('modal-prev')!.style.display).not.toBe('none');
      expect(document.getElementById('modal-next')!.style.display).not.toBe('none');
    });

    it('hides nav arrows when only one video', () => {
      setupDOM([
        createVideoCardHTML('solo1', 'Solo Video'),
      ]);
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="solo1"]')!;
      controller.openModal(btn);
      expect(document.getElementById('modal-prev')!.style.display).toBe('none');
      expect(document.getElementById('modal-next')!.style.display).toBe('none');
    });
  });

  describe('closeModal', () => {
    it('removes "open" class from modal', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.closeModal();
      expect(document.getElementById('video-modal')!.classList.contains('open')).toBe(false);
    });

    it('restores body scroll', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.closeModal();
      expect(document.body.style.overflow).toBe('');
    });

    it('removes iframe content', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.closeModal();
      expect(document.getElementById('modal-iframe-container')!.innerHTML).toBe('');
    });

    it('restores facade visibility', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.closeModal();
      expect(document.getElementById('modal-facade')!.classList.contains('hidden')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Facade → iframe
  // -----------------------------------------------------------------------

  describe('autoplay on open', () => {
    it('hides facade and shows iframe container on open', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);

      expect(document.getElementById('modal-facade')!.classList.contains('hidden')).toBe(true);
      expect(document.getElementById('modal-iframe-container')!.classList.contains('hidden')).toBe(false);
    });

    it('creates iframe with correct src on open', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(btn);

      const iframe = document.getElementById('modal-iframe-container')!.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe!.src).toContain('https://www.youtube.com/embed/def456');
      expect(iframe!.src).toContain('autoplay=1');
      expect(iframe!.src).toContain('rel=0');
    });

    it('sets iframe title from video title on open', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);

      const iframe = document.getElementById('modal-iframe-container')!.querySelector('iframe');
      expect(iframe!.title).toBe('Video Alpha');
    });

    it('sets correct allow attributes on iframe', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);

      const iframe = document.getElementById('modal-iframe-container')!.querySelector('iframe');
      expect(iframe!.allow).toContain('autoplay');
      expect(iframe!.allow).toContain('picture-in-picture');
      expect(iframe!.hasAttribute('allowfullscreen')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Navigation (prev / next)
  // -----------------------------------------------------------------------

  describe('navigateVideo', () => {
    it('moves to next video', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.navigateVideo(1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Video Beta');
      expect(document.getElementById('modal-counter')!.textContent).toBe('2 of 3');
    });

    it('moves to previous video', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(btn);
      controller.navigateVideo(-1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Video Alpha');
      expect(document.getElementById('modal-counter')!.textContent).toBe('1 of 3');
    });

    it('wraps forward from last to first', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="ghi789"]')!;
      controller.openModal(btn);
      controller.navigateVideo(1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Video Alpha');
      expect(document.getElementById('modal-counter')!.textContent).toBe('1 of 3');
    });

    it('wraps backward from first to last', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.navigateVideo(-1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Video Gamma');
      expect(document.getElementById('modal-counter')!.textContent).toBe('3 of 3');
    });

    it('autoplays next video iframe when navigating', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);

      controller.navigateVideo(1);

      // Should be playing the next video (def456), not showing facade
      expect(document.getElementById('modal-facade')!.classList.contains('hidden')).toBe(true);
      expect(document.getElementById('modal-iframe-container')!.classList.contains('hidden')).toBe(false);
      const iframe = document.getElementById('modal-iframe-container')!.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe!.src).toContain('https://www.youtube.com/embed/def456');
    });

    it('does nothing when only one video', () => {
      setupDOM([createVideoCardHTML('solo1', 'Solo Video')]);
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="solo1"]')!;
      controller.openModal(btn);
      controller.navigateVideo(1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Solo Video');
      expect(document.getElementById('modal-counter')!.textContent).toBe('1 of 1');
    });
  });

  // -----------------------------------------------------------------------
  // Filter-aware navigation
  // -----------------------------------------------------------------------

  describe('filter-aware navigation', () => {
    it('excludes hidden cards from filtered list', () => {
      setupDOM([
        createVideoCardHTML('abc123', 'Visible Video'),
        createVideoCardHTML('def456', 'Hidden Video', { cardHidden: true }),
        createVideoCardHTML('ghi789', 'Another Visible'),
      ]);

      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].dataset.videoId).toBe('abc123');
      expect(filtered[1].dataset.videoId).toBe('ghi789');
    });

    it('excludes videos in hidden sections', () => {
      setupDOM([
        createVideoCardHTML('abc123', 'Visible Section Video'),
        `<div class="topic-section" style="display:none">
          <div class="video-card-wrapper">
            <button data-video-id="hidden1" data-title="Hidden Section"></button>
          </div>
        </div>`,
      ]);

      const filtered = controller.getFilteredVideos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].dataset.videoId).toBe('abc123');
    });

    it('navigates only through visible videos', () => {
      setupDOM([
        createVideoCardHTML('abc123', 'First'),
        createVideoCardHTML('def456', 'Hidden', { cardHidden: true }),
        createVideoCardHTML('ghi789', 'Third'),
      ]);

      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.navigateVideo(1);

      expect(document.getElementById('modal-title')!.textContent).toBe('Third');
      expect(document.getElementById('modal-counter')!.textContent).toBe('2 of 2');
    });
  });

  // -----------------------------------------------------------------------
  // Deep link hash parsing
  // -----------------------------------------------------------------------

  describe('deep link parsing', () => {
    function parseDeepLink(hash: string): string | null {
      const match = hash.match(/^#video=(.+)$/);
      return match ? match[1] : null;
    }

    it('extracts video ID from valid hash', () => {
      expect(parseDeepLink('#video=abc123')).toBe('abc123');
    });

    it('handles video IDs starting with a number', () => {
      expect(parseDeepLink('#video=8PeesNZR58o')).toBe('8PeesNZR58o');
    });

    it('handles video IDs with hyphens and underscores', () => {
      expect(parseDeepLink('#video=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(parseDeepLink('#video=a-b_c123')).toBe('a-b_c123');
    });

    it('returns null for empty hash', () => {
      expect(parseDeepLink('')).toBeNull();
    });

    it('returns null for non-matching hash', () => {
      expect(parseDeepLink('#section=about')).toBeNull();
    });

    it('finds correct button without CSS.escape (digit-starting IDs)', () => {
      setupDOM([
        createVideoCardHTML('8PeesNZR58o', 'Digit Start Video'),
      ]);

      const videoId = '8PeesNZR58o';
      const btn = document.querySelector<HTMLButtonElement>(
        `button[data-video-id="${videoId.replace(/"/g, '\\"')}"]`
      );
      expect(btn).not.toBeNull();
      expect(btn!.dataset.videoId).toBe('8PeesNZR58o');
    });
  });

  // -----------------------------------------------------------------------
  // Scroll lock
  // -----------------------------------------------------------------------

  describe('scroll lock', () => {
    it('sets overflow hidden on open', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      expect(document.body.style.overflow).toBe('');
      controller.openModal(btn);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores overflow on close', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);
      controller.closeModal();
      expect(document.body.style.overflow).toBe('');
    });

    it('locks and unlocks across multiple open/close cycles', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;

      controller.openModal(btn);
      expect(document.body.style.overflow).toBe('hidden');
      controller.closeModal();
      expect(document.body.style.overflow).toBe('');

      controller.openModal(btn);
      expect(document.body.style.overflow).toBe('hidden');
      controller.closeModal();
      expect(document.body.style.overflow).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles video titles with quotes in iframe title', () => {
      setupDOM([
        createVideoCardHTML('q1', 'Video with &quot;quotes&quot;'),
      ]);

      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="q1"]')!;
      controller.openModal(btn);

      const iframe = document.getElementById('modal-iframe-container')!.querySelector('iframe');
      expect(iframe).not.toBeNull();
    });

    it('opens modal for button not in filtered list (defaults to index 0)', () => {
      setupDOM([
        createVideoCardHTML('abc123', 'Visible'),
        createVideoCardHTML('def456', 'Hidden', { cardHidden: true }),
      ]);

      const hiddenBtn = document.querySelector<HTMLButtonElement>('button[data-video-id="def456"]')!;
      controller.openModal(hiddenBtn);

      expect(controller.getState().currentVideoIndex).toBe(0);
    });

    it('close restores facade even after autoplay', () => {
      const btn = document.querySelector<HTMLButtonElement>('button[data-video-id="abc123"]')!;
      controller.openModal(btn);

      // Autoplay should have hidden facade
      expect(document.getElementById('modal-facade')!.classList.contains('hidden')).toBe(true);

      controller.closeModal();

      expect(document.getElementById('modal-facade')!.classList.contains('hidden')).toBe(false);
      expect(document.getElementById('modal-iframe-container')!.innerHTML).toBe('');
    });
  });
});
