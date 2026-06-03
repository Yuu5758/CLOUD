<template>
  <div class="cloudflare-layout" :data-theme="theme">
    <!-- If login page, render full screen without layout elements -->
    <template v-if="$route.path === '/login'">
      <NuxtPage />
    </template>

    <!-- Otherwise, render full S3 console layout -->
    <template v-else>
      <!-- Sidebar component -->
      <Sidebar />

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Topbar Header -->
        <div class="top-bar">
          <div class="connection-status" :class="{ online: isConnected }">
            <span class="status-dot" :class="{ online: isConnected }"></span>
            <span>{{ isConnected ? 'Server Online' : 'Server Offline' }}</span>
          </div>
          <div class="top-bar-right">
            <button class="icon-btn" @click="toggleTheme" title="Toggle Dark/Light Mode">
              <el-icon size="16">
                <component :is="theme === 'dark' ? Sunny : Moon" />
              </el-icon>
            </button>
            <NuxtLink to="/terminal" class="btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Live API Tester</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Scrollable Main Container -->
        <div class="scroll-container">
          <NuxtPage />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from '#app';
import Sidebar from './components/Sidebar.vue';
import { useS3 } from './composables/useS3';
import { Sunny, Moon, Lightning } from '@element-plus/icons-vue';

// Theme state
const theme = ref('light');
const { isConnected, checkConnection } = useS3();
const route = useRoute();
const router = useRouter();

watch(theme, (newTheme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', newTheme);
  }
}, { immediate: true });

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

const checkAuth = async () => {
  const connected = await checkConnection();
  if (!connected && route.path !== '/login') {
    router.push('/login');
  } else if (connected && route.path === '/login') {
    router.push('/');
  }
};

onMounted(async () => {
  await checkAuth();
  // Periodically check connection every 10 seconds
  setInterval(checkConnection, 10000);
});

// Watch route changes to enforce S3 credentials verification
watch(() => route.path, async (newPath) => {
  if (!isConnected.value && newPath !== '/login') {
    const connected = await checkConnection();
    if (!connected) router.push('/login');
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ============================================================
   CLAYMORPHIC DESIGN SYSTEM
   ============================================================ */

:root {
  /* Claymorphic Light Theme (Default) */
  --clay-bg-page: #edf1f7;
  --clay-bg-card: rgba(255, 255, 255, 0.72);
  --clay-bg-sidebar: rgba(255, 255, 255, 0.65);
  --clay-bg-input: linear-gradient(145deg, #f0f3f9, #e6eaf4);
  --clay-bg-hover: rgba(235, 240, 250, 0.7);
  --clay-border: rgba(200, 210, 230, 0.45);
  --clay-border-light: rgba(255, 255, 255, 0.85);
  --clay-text-main: #1e293b;
  --clay-text-muted: #7b8db0;
  --clay-text-label: #4a5568;
  --clay-accent: #5b7bb5;
  --clay-accent-hover: #3d5fa0;
  --clay-success: #10b981;
  --clay-error: #ef4444;
  --clay-orange: #e67e22;
  --clay-orange-hover: #d35400;
  --clay-blue: #3b82f6;

  /* Theme-aware Element Plus helper variables */
  --clay-bg-btn-sec: linear-gradient(145deg, #edf0f7, #e0e5ef);
  --clay-bg-btn-sec-hover: linear-gradient(145deg, #e8ecf5, #dce1ec);
  --clay-bg-btn-danger-plain: linear-gradient(145deg, #fce8e8, #f5d5d5);
  --clay-bg-btn-danger-plain-hover: linear-gradient(145deg, #fce0e0, #f0cbcb);
  --clay-bg-select-popper: rgba(255, 255, 255, 0.98);
  --clay-bg-dialog: rgba(255, 255, 255, 0.85);

  /* Shadows */
  --clay-shadow-card: 
    10px 10px 20px rgba(166, 180, 210, 0.3),
    -6px -6px 14px rgba(255, 255, 255, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  --clay-shadow-raised:
    6px 6px 12px rgba(166, 180, 210, 0.35),
    -4px -4px 8px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --clay-shadow-inset:
    inset 3px 3px 6px rgba(166, 180, 210, 0.3),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8);
  --clay-shadow-btn:
    6px 6px 12px rgba(90, 125, 191, 0.25),
    -3px -3px 8px rgba(160, 195, 255, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);

  --sidebar-w: 260px;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --trans-speed: 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* Legacy mappings used by pages */
  --bg-primary: var(--clay-bg-page);
  --bg-secondary: var(--clay-bg-card);
  --bg-tertiary: rgba(235, 240, 250, 0.6);
  --border-c: var(--clay-border);
  --text-main: var(--clay-text-main);
  --text-muted: var(--clay-text-muted);
  --cf-brand-orange: var(--clay-accent);
  --cf-brand-hover: var(--clay-accent-hover);
  --cf-brand-blue: var(--clay-blue);
  --cf-brand-success: var(--clay-success);
  --cf-brand-error: var(--clay-error);
  --cf-brand-gray: #94a3b8;
  --font-display: 'Inter', sans-serif;
  --font-mono: 'Fira Code', 'Cascadia Code', monospace;
}

[data-theme="dark"] {
  --clay-bg-page: #141724;
  --clay-bg-card: rgba(25, 29, 44, 0.85);
  --clay-bg-sidebar: rgba(20, 23, 36, 0.9);
  --clay-bg-input: linear-gradient(145deg, #1e2133, #24293f);
  --clay-bg-hover: rgba(35, 41, 64, 0.7);
  --clay-border: rgba(50, 60, 90, 0.5);
  --clay-border-light: rgba(50, 60, 90, 0.3);
  --clay-text-main: #edf2f7;
  --clay-text-muted: #8b9bb4;
  --clay-text-label: #a0aec0;
  --clay-accent: #7c9ed5;
  --clay-accent-hover: #94b2e3;

  /* Theme-aware Element Plus helper variables */
  --clay-bg-btn-sec: linear-gradient(145deg, #1e2133, #181a28);
  --clay-bg-btn-sec-hover: linear-gradient(145deg, #25293f, #1c1e2d);
  --clay-bg-btn-danger-plain: linear-gradient(145deg, #3d1c1c, #2d1515);
  --clay-bg-btn-danger-plain-hover: linear-gradient(145deg, #4d2323, #351919);
  --clay-bg-select-popper: rgba(20, 23, 36, 0.98);
  --clay-bg-dialog: rgba(20, 23, 36, 0.9);

  --clay-shadow-card: 
    8px 8px 16px rgba(0, 0, 0, 0.45),
    -4px -4px 10px rgba(50, 60, 80, 0.2),
    inset 0 1px 0 rgba(60, 75, 100, 0.3);
  --clay-shadow-raised:
    4px 4px 10px rgba(0, 0, 0, 0.4),
    -3px -3px 6px rgba(50, 60, 80, 0.15),
    inset 0 1px 0 rgba(60, 75, 100, 0.2);
  --clay-shadow-inset:
    inset 3px 3px 6px rgba(0, 0, 0, 0.35),
    inset -2px -2px 5px rgba(50, 60, 80, 0.2);
  --clay-shadow-btn:
    4px 4px 10px rgba(0, 0, 0, 0.3),
    -2px -2px 6px rgba(50, 60, 80, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.08),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);

  --bg-primary: var(--clay-bg-page);
  --bg-secondary: var(--clay-bg-card);
  --bg-tertiary: rgba(40, 50, 70, 0.5);
  --border-c: var(--clay-border);
  --text-main: var(--clay-text-main);
  --text-muted: var(--clay-text-muted);
  --cf-brand-orange: var(--clay-accent);
  --cf-brand-hover: var(--clay-accent-hover);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
  background-color: var(--clay-bg-page);
  color: var(--clay-text-main);
  overflow: hidden;
  transition: background-color var(--trans-speed), color var(--trans-speed);
}

/* ====== MASTER LAYOUT ====== */
.cloudflare-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, 
    var(--clay-bg-page) 0%, 
    color-mix(in srgb, var(--clay-bg-page), #d0d8f0 15%) 50%,
    var(--clay-bg-page) 100%);
}

/* ====== SIDEBAR ====== */
.sidebar {
  width: var(--sidebar-w);
  background: var(--clay-bg-sidebar);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--clay-border-light);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  transition: var(--trans-speed);
  box-shadow: 4px 0 20px rgba(166, 180, 210, 0.15);
}

.sidebar-header {
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--clay-border);
}

.logo-container {
  background: linear-gradient(135deg, #6b8cce, #5a7bbf);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow:
    4px 4px 8px rgba(90, 123, 191, 0.25),
    -2px -2px 5px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.logo-text {
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.3px;
  color: var(--clay-text-main);
  transition: color var(--trans-speed);
}

.sidebar-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.menu-item {
  background: none;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-radius: 12px;
  color: var(--clay-text-muted);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: var(--font-family);
  text-decoration: none;
}

.menu-item:hover {
  color: var(--clay-text-main);
  background: var(--clay-bg-hover);
  box-shadow: var(--clay-shadow-raised);
  transform: translateX(2px);
}

.menu-item.active {
  color: var(--clay-accent);
  background: var(--clay-bg-hover);
  font-weight: 600;
  border: 1px solid var(--clay-border);
  box-shadow: var(--clay-shadow-raised);
}

.menu-item-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #6b8cce, #5a7bbf);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 700;
  box-shadow: 2px 2px 4px rgba(90, 123, 191, 0.2);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--clay-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-version {
  font-size: 11px;
  text-align: center;
  color: var(--clay-text-muted);
  margin-top: 4px;
}

/* ====== MAIN CONTENT ====== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ====== TOP BAR ====== */
.top-bar {
  height: 64px;
  border-bottom: 1px solid var(--clay-border);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--clay-bg-card);
  backdrop-filter: blur(16px);
  transition: var(--trans-speed);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(145deg, #fce8e8, #f5d5d5);
  color: var(--clay-error);
  box-shadow: var(--clay-shadow-raised);
  transition: all 0.3s ease;
}

.connection-status.online {
  background: linear-gradient(145deg, #e0f5ec, #d0ede2);
  color: var(--clay-success);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background-color: var(--clay-error);
  box-shadow: 0 0 6px var(--clay-error);
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.online {
  background-color: var(--clay-success);
  box-shadow: 0 0 6px var(--clay-success);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ====== BUTTONS ====== */
.btn {
  background: linear-gradient(135deg, #6b8cce, #5a7bbf);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  font-family: var(--font-family);
  box-shadow: var(--clay-shadow-btn);
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow:
    8px 8px 16px rgba(90, 125, 191, 0.3),
    -4px -4px 10px rgba(160, 195, 255, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.25);
  background: linear-gradient(135deg, #7598d4, #6389c5);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: linear-gradient(145deg, #edf0f7, #e0e5ef);
  color: var(--clay-text-main);
  box-shadow: var(--clay-shadow-raised);
}

.btn-secondary:hover {
  background: linear-gradient(145deg, #e8ecf5, #dce1ec);
}

.btn-danger {
  background: linear-gradient(135deg, #ef6b6b, #dc4444);
  box-shadow:
    4px 4px 10px rgba(239, 68, 68, 0.2),
    -2px -2px 6px rgba(255, 200, 200, 0.15);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #f07777, #e05050);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
}

.icon-btn {
  background: linear-gradient(145deg, #edf0f7, #e0e5ef);
  border: 1px solid var(--clay-border);
  color: var(--clay-text-main);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: var(--clay-shadow-raised);
}

.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    8px 8px 14px rgba(166, 180, 210, 0.4),
    -5px -5px 10px rgba(255, 255, 255, 0.85);
}

/* ====== SCROLL CONTAINER ====== */
.scroll-container {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
}

/* ====== VIEWS & HEADERS ====== */
.view-container {
  animation: viewFade 0.35s ease;
}

@keyframes viewFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
  margin-bottom: 28px;
}

.view-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}

.view-header-content {
  flex: 1;
}

.view-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
  color: var(--clay-text-main);
}

.view-desc {
  color: var(--clay-text-muted);
  font-size: 14px;
}

/* ====== CLAYMORPHIC CARDS ====== */
.config-card {
  background: var(--clay-bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--clay-border-light);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: var(--clay-shadow-card);
  transition: all 0.3s ease;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  color: var(--clay-text-main);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--clay-text-label);
}

.form-input {
  background: var(--clay-bg-input);
  border: 1px solid var(--clay-border);
  color: var(--clay-text-main);
  padding: 10px 14px;
  border-radius: 12px;
  font-family: var(--font-family);
  font-size: 14px;
  outline: none;
  transition: var(--trans-speed);
  box-shadow: var(--clay-shadow-inset);
}

.form-input:focus {
  border-color: rgba(100, 140, 220, 0.5);
  box-shadow:
    var(--clay-shadow-inset),
    0 0 0 3px rgba(100, 140, 220, 0.12);
}

/* ====== STAT CARDS ====== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--clay-bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--clay-border-light);
  border-radius: 18px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  transition: all 0.3s ease;
  box-shadow: var(--clay-shadow-card);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow:
    12px 12px 24px rgba(166, 180, 210, 0.35),
    -8px -8px 18px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.stat-icon {
  background: linear-gradient(145deg, #edf0f7, #e0e5ef);
  color: var(--clay-accent);
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--clay-shadow-raised);
}

.stat-card.stat-blue .stat-icon {
  color: var(--clay-blue);
}
.stat-card.stat-orange .stat-icon {
  color: var(--clay-orange);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--clay-text-muted);
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--clay-text-main);
}

/* ====== DATA TABLES ====== */
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--clay-text-main);
}

.table-container {
  background: var(--clay-bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--clay-border-light);
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 28px;
  box-shadow: var(--clay-shadow-card);
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table th {
  background: rgba(235, 240, 250, 0.5);
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--clay-text-muted);
  border-bottom: 1px solid var(--clay-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 14px 20px;
  font-size: 14px;
  border-bottom: 1px solid var(--clay-border);
  color: var(--clay-text-main);
}

.table td strong {
  color: var(--clay-text-main);
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background: rgba(235, 240, 250, 0.35);
}

.table-empty {
  text-align: center;
  color: var(--clay-text-muted);
  padding: 32px !important;
}

.bucket-name-txt {
  color: var(--clay-text-main);
  text-decoration: none;
  font-weight: 600;
}

.bucket-name-txt:hover {
  color: var(--clay-accent);
}

/* ====== BADGES ====== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  background: linear-gradient(145deg, #e0f5ec, #d0ede2);
  color: var(--clay-success);
  box-shadow: 2px 2px 4px rgba(16, 185, 129, 0.1);
}

.badge-blue {
  background: linear-gradient(145deg, #e0ecfc, #d0e0f5);
  color: var(--clay-blue);
  box-shadow: 2px 2px 4px rgba(59, 130, 246, 0.1);
}

.badge-orange {
  background: linear-gradient(145deg, #fce8d5, #f5dcc5);
  color: var(--clay-orange);
  box-shadow: 2px 2px 4px rgba(230, 126, 34, 0.1);
}

.badge-gray {
  background: linear-gradient(145deg, #edf0f7, #e0e5ef);
  color: var(--clay-text-muted);
  box-shadow: 2px 2px 4px rgba(148, 163, 184, 0.1);
}

/* ====== MODALS ====== */
.overlay-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.overlay-modal.active {
  display: flex;
}

.modal {
  background: var(--clay-bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--clay-border-light);
  border-radius: 22px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: var(--clay-shadow-card);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--clay-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: var(--clay-text-muted);
  cursor: pointer;
  font-size: 14px;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-hint {
  font-size: 11px;
  color: var(--clay-text-muted);
}

.modal-footer {
  padding: 14px 20px;
  background: rgba(235, 240, 250, 0.4);
  border-top: 1px solid var(--clay-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ====== UPLOAD ZONE ====== */
.upload-drop-zone {
  border: 2px dashed var(--clay-border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.25s ease;
  background: rgba(235, 240, 250, 0.3);
}

.upload-drop-zone:hover {
  border-color: var(--clay-accent);
  background: rgba(235, 240, 250, 0.6);
  box-shadow: var(--clay-shadow-inset);
}

.upload-title {
  font-size: 13px;
  font-weight: 600;
}

.upload-subtitle {
  font-size: 11px;
  color: var(--clay-text-muted);
  margin-top: 4px;
}

/* ====== TERMINAL ====== */
.grid-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.terminal-container {
  background: #0d1117;
  border: 1px solid var(--clay-border);
  border-radius: 18px;
  height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--clay-shadow-card);
}

.terminal-header {
  background: #161b26;
  border-bottom: 1px solid rgba(60, 75, 100, 0.4);
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terminal-title {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--clay-text-muted);
}

.terminal-dots {
  display: flex;
  gap: 5px;
}

.dot-t {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}

.dot-t.red { background-color: var(--clay-error); }
.dot-t.yellow { background-color: var(--clay-orange); }
.dot-t.green { background-color: var(--clay-success); }

.terminal-body {
  flex: 1;
  padding: 16px;
  background: #0d1117;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.terminal-line {
  display: flex;
  gap: 6px;
}

.terminal-prompt {
  color: var(--clay-accent);
  user-select: none;
}

.terminal-text {
  white-space: pre-wrap;
  word-break: break-all;
  color: #38bdf8;
  font-family: var(--font-mono);
}

.terminal-text.cmd { color: #f8fafc; }
.terminal-text.sys { color: #7b8db0; }
.terminal-text.err { color: var(--clay-error); }
.terminal-text.success { color: var(--clay-success); }
.terminal-text.meta { color: #a78bfa; }

/* ====== DOCS ====== */
.docs-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 28px;
  align-items: start;
}

.docs-content {
  background: var(--clay-bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--clay-border-light);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--clay-shadow-card);
}

.docs-content h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--clay-border);
  padding-bottom: 6px;
}

.docs-content p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--clay-text-muted);
  margin-bottom: 16px;
}

.code-box {
  border: 1px solid var(--clay-border);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: var(--clay-shadow-raised);
}

.code-box-header {
  background: rgba(235, 240, 250, 0.5);
  padding: 8px 16px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--clay-text-muted);
  display: flex;
  justify-content: space-between;
}

.code-box-header button {
  background: none;
  border: none;
  color: var(--clay-text-muted);
  cursor: pointer;
  font-size: 11px;
}

.code-box-header button:hover {
  color: var(--clay-text-main);
}

.code-box-code {
  background: #0d1117;
  padding: 16px;
  color: #f8fafc;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
}

.docs-sticky-nav {
  background: var(--clay-bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--clay-border-light);
  border-radius: 18px;
  padding: 16px;
  position: sticky;
  top: 20px;
  box-shadow: var(--clay-shadow-raised);
}

.sticky-title {
  color: var(--clay-text-muted);
}

.sticky-link {
  color: var(--clay-text-muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sticky-link:hover {
  color: var(--clay-accent);
  padding-left: 4px;
}

/* ====== UTILITIES ====== */
.w-full { width: 100%; }
.m-0 { margin: 0; }
.p-5 { padding: 20px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-1 { flex: 1; }
.align-end { align-items: flex-end; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mt-1 { margin-top: 4px; }
.mt-4 { margin-top: 16px; }
.text-xl { font-size: 20px; }
.text-3xl { font-size: 30px; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 12px; }
.font-mono { font-family: var(--font-mono); }
.font-semibold { font-weight: 600; }
.uppercase { text-transform: uppercase; }
.tracking-wider { letter-spacing: 0.5px; }
.text-slate-400 { color: var(--clay-text-muted); }
.text-gray-500 { color: var(--clay-text-muted); }
.resize-none { resize: none; }
.w-32 { width: 128px; }
.list-none { list-style: none; }
.block { display: block; }

@media (max-width: 768px) {
  .flex-row-responsive {
    flex-direction: column;
    align-items: stretch !important;
  }
  .grid-dual {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   ELEMENT PLUS CLAYMORPHIC OVERRIDE
   ========================================================================== */

/* 1. Element Plus Buttons */
.el-button {
  font-family: var(--font-family) !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  transition: all 0.25s ease !important;
}

.el-button--primary {
  background: linear-gradient(135deg, #6b8cce, #5a7bbf) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: var(--clay-shadow-btn) !important;
}

.el-button--primary:hover,
.el-button--primary:focus {
  background: linear-gradient(135deg, #7598d4, #6389c5) !important;
  border: none !important;
  color: #ffffff !important;
  transform: translateY(-1px);
}

.el-button--danger {
  background: linear-gradient(135deg, #ef6b6b, #dc4444) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow:
    4px 4px 10px rgba(239, 68, 68, 0.2),
    -2px -2px 6px rgba(255, 200, 200, 0.15) !important;
}

.el-button--danger:hover {
  filter: brightness(1.08) !important;
  transform: translateY(-1px);
}

/* Plain / Secondary Button Style */
.el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--success) {
  background: var(--clay-bg-btn-sec) !important;
  border: 1px solid var(--clay-border) !important;
  color: var(--clay-text-main) !important;
  box-shadow: var(--clay-shadow-raised) !important;
}

.el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--success):hover,
.el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--success):focus {
  background: var(--clay-bg-btn-sec-hover) !important;
  border-color: var(--clay-border) !important;
  color: var(--clay-text-main) !important;
  transform: translateY(-1px);
}

.el-button--success {
  background: linear-gradient(135deg, #34d399, #10b981) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow:
    4px 4px 10px rgba(16, 185, 129, 0.2),
    -2px -2px 6px rgba(200, 255, 230, 0.15) !important;
}

/* Danger Plain Button Style */
.el-button.is-plain.el-button--danger {
  background: var(--clay-bg-btn-danger-plain) !important;
  border: none !important;
  color: #ef4444 !important;
  box-shadow: var(--clay-shadow-raised) !important;
}

.el-button.is-plain.el-button--danger:hover {
  background: var(--clay-bg-btn-danger-plain-hover) !important;
  color: #ef4444 !important;
}

/* 2. Element Plus Inputs */
.el-input__wrapper,
.el-select__wrapper,
.el-textarea__inner {
  background: var(--clay-bg-input) !important;
  box-shadow: var(--clay-shadow-inset) !important;
  border-radius: 12px !important;
  color: var(--clay-text-main) !important;
  transition: all 0.25s ease !important;
  border: 1px solid var(--clay-border) !important;
}

.el-input__inner,
.el-textarea__inner,
.el-select__selected-item {
  color: var(--clay-text-main) !important;
  font-family: var(--font-family) !important;
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focus,
.el-textarea__inner:focus {
  box-shadow: var(--clay-shadow-inset), 0 0 0 3px rgba(100, 140, 220, 0.12) !important;
  border-color: rgba(100, 140, 220, 0.5) !important;
}

/* 3. Element Plus Select Dropdown */
.el-select-dropdown__item {
  color: var(--clay-text-main) !important;
  font-family: var(--font-family) !important;
  font-size: 13px !important;
  transition: background-color 0.2s ease !important;
}

.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background: var(--clay-bg-hover) !important;
  color: var(--clay-text-main) !important;
}

.el-select-dropdown__item.selected {
  background: linear-gradient(135deg, #6b8cce, #5a7bbf) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.el-select__popper {
  background: var(--clay-bg-select-popper) !important;
  backdrop-filter: blur(16px) !important;
  border: 1px solid var(--clay-border) !important;
  border-radius: 14px !important;
  box-shadow: var(--clay-shadow-card) !important;
}

.el-select-dropdown {
  background: transparent !important;
}

.el-select-dropdown__wrap {
  background: transparent !important;
}

/* 4. Element Plus Dialog */
.el-dialog {
  background: var(--clay-bg-dialog) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--clay-border-light) !important;
  border-radius: 22px !important;
  box-shadow: var(--clay-shadow-card) !important;
  font-family: var(--font-family) !important;
  overflow: hidden !important;
}

.el-dialog__header {
  margin-right: 0 !important;
  border-bottom: 1px solid var(--clay-border) !important;
  padding: 16px 24px !important;
  color: var(--clay-text-main) !important;
}

.el-dialog__title {
  font-weight: 700 !important;
  font-size: 17px !important;
  color: var(--clay-text-main) !important;
}

.el-dialog__body {
  padding: 20px 24px !important;
  color: var(--clay-text-main) !important;
  background: transparent !important;
}

.el-dialog__footer {
  border-top: 1px solid var(--clay-border) !important;
  padding: 14px 24px !important;
  background: var(--clay-bg-btn-sec) !important;
}

/* 5. Element Plus Tabs */
.el-tabs__item {
  font-weight: 600 !important;
  color: var(--clay-text-muted) !important;
}

.el-tabs__item.is-active {
  color: var(--clay-accent) !important;
}

.el-tabs__active-bar {
  background-color: var(--clay-accent) !important;
}

/* 6. Element Plus Switch */
.el-switch.is-checked .el-switch__core {
  background-color: var(--clay-accent) !important;
  border-color: var(--clay-accent) !important;
}

/* 7. Element Plus Radio Buttons */
.el-radio-button__inner {
  font-family: var(--font-family) !important;
}
</style>
