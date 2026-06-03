<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <el-icon size="20"><Platform /></el-icon>
      </div>
      <div class="logo-text">RustFS Console</div>
    </div>
    
    <div class="sidebar-menu">
      <NuxtLink to="/" class="menu-item" active-class="active" exact-active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>Dashboard</span>
      </NuxtLink>
      
      <NuxtLink to="/buckets" class="menu-item" active-class="active" :class="{ active: $route.path.startsWith('/buckets') }">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Bucket Manager</span>
        <span class="menu-item-badge" v-if="bucketsList.length > 0">{{ bucketsList.length }}</span>
      </NuxtLink>
      
      <NuxtLink to="/terminal" class="menu-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        <span>REST Playground</span>
      </NuxtLink>
      
      <NuxtLink to="/docs" class="menu-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>Documentation</span>
      </NuxtLink>
    </div>

    <div class="sidebar-footer">
      <button class="sidebar-btn sidebar-btn-default" @click="checkConnection">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span>Test Connection</span>
      </button>

      <button class="sidebar-btn sidebar-btn-danger" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Disconnect</span>
      </button>

      <div class="footer-version">
        v1.0.0-beta.6 · Claymorphic Theme
      </div>
    </div>
  </div>
</template>

<script setup>
import { useS3 } from '../composables/useS3';
import { useRouter } from '#app';
import { Refresh, SwitchButton, Platform, Menu, Folder, Lightning, Document } from '@element-plus/icons-vue';

const { bucketsList, checkConnection, logout } = useS3();
const router = useRouter();

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<style scoped>
.sidebar-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  border: none;
}

.sidebar-btn-default {
  background: var(--clay-bg-btn-sec);
  color: var(--clay-text-main);
  border: 1px solid var(--clay-border);
  box-shadow: var(--clay-shadow-raised);
}

.sidebar-btn-default:hover {
  background: var(--clay-bg-btn-sec-hover);
  transform: translateY(-1px);
  box-shadow: var(--clay-shadow-raised);
}

.sidebar-btn-danger {
  background: var(--clay-bg-btn-danger-plain);
  color: var(--clay-error);
  border: 1px solid var(--clay-border);
  box-shadow: var(--clay-shadow-raised);
}

.sidebar-btn-danger:hover {
  background: var(--clay-bg-btn-danger-plain-hover);
  transform: translateY(-1px);
  box-shadow: var(--clay-shadow-raised);
}
</style>
