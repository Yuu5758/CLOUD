<template>
  <div class="login-page">
    <!-- Decorative background blobs -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>

    <div class="login-card-container">
      <div class="login-card">

        <!-- Header / Logo -->
        <div class="login-header">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </div>
          <h2 class="brand-name">RustFS Console</h2>
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to manage your storage clusters</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Username -->
          <div class="form-group">
            <label class="form-label">Username or Email</label>
            <div class="input-wrapper">
              <input
                v-model="loginData.username"
                type="text"
                class="clay-input"
                placeholder="admin@rustfs.io"
                required
              />
              <span class="input-icon-right">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                v-model="loginData.password"
                :type="showPassword ? 'text' : 'password'"
                class="clay-input"
                placeholder="••••••••"
                required
              />
              <span class="input-icon-right clickable" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </span>
            </div>
          </div>

          <!-- Remember me / Forgot password -->
          <div class="form-options">
            <label class="remember-label">
              <input type="checkbox" v-model="rememberMe" class="clay-checkbox" />
              <span class="checkbox-custom"></span>
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <!-- Error Alert -->
          <div class="error-alert" v-if="errorMessage">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="clay-btn-submit"
            :disabled="loading"
          >
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>Sign In</span>
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>

        <!-- Footer links -->
        <div class="login-footer-links">
          <span>Don't have an account? <a href="#">Contact your administrator</a>.</span>
        </div>

        <!-- Copyright -->
        <div class="login-footer-copy">
          <span>© 2026 RustFS Console. Built with Rust.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from '#app';
import { useS3 } from '../composables/useS3';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const { login } = useS3();

const loginData = ref({
  username: '',
  password: ''
});

const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  const user = loginData.value.username.trim();
  const pass = loginData.value.password.trim();

  // Verify Admin credentials
  if (user === 'Admin' && pass === 'Laskar57') {
    try {
      const success = await login({
        username: user,
        password: pass
      });

      if (success) {
        router.push('/');
      } else {
        errorMessage.value = "Administrator verified, but failed to connect to local S3 Server (http://127.0.0.1:9000). Ensure RustFS is running.";
      }
    } catch (err) {
      errorMessage.value = "S3 Connection Error: " + (err.message || err);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
    errorMessage.value = "Invalid username or password. Please try again.";
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ====== PAGE ====== */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8edf5 0%, #f0f4fa 30%, #f8f9fc 60%, #f4f6fb 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Decorative background blobs */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(147, 171, 255, 0.35), transparent 70%);
  top: -120px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(186, 200, 255, 0.3), transparent 70%);
  bottom: -80px;
  right: -60px;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(200, 180, 255, 0.2), transparent 70%);
  top: 50%;
  left: 60%;
  transform: translate(-50%, -50%);
}

/* ====== CARD CONTAINER ====== */
.login-card-container {
  width: 100%;
  max-width: 460px;
  padding: 20px;
  z-index: 10;
  animation: cardFloatIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardFloatIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ====== CLAYMORPHIC CARD ====== */
.login-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 44px 40px 36px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  /* Claymorphic multi-layer shadow */
  box-shadow:
    12px 12px 24px rgba(166, 180, 210, 0.35),
    -8px -8px 20px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(200, 210, 230, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5);
}

/* ====== HEADER ====== */
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, #e8eef8, #d5dded);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5c8a;
  margin-bottom: 14px;
  /* Clay effect on icon */
  box-shadow:
    6px 6px 12px rgba(166, 180, 210, 0.4),
    -4px -4px 10px rgba(255, 255, 255, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo-icon:hover {
  transform: translateY(-2px);
  box-shadow:
    8px 8px 16px rgba(166, 180, 210, 0.45),
    -5px -5px 12px rgba(255, 255, 255, 0.95),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: #5b7bb5;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.login-subtitle {
  color: #7b8db0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* ====== FORM ====== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  letter-spacing: 0.2px;
}

/* ====== CLAYMORPHIC INPUT ====== */
.input-wrapper {
  position: relative;
  width: 100%;
}

.clay-input {
  width: 100%;
  padding: 14px 48px 14px 18px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
  background: linear-gradient(145deg, #f0f3f9, #e6eaf4);
  border: 1px solid rgba(200, 210, 230, 0.5);
  border-radius: 14px;
  outline: none;
  transition: all 0.3s ease;
  /* Claymorphic inset effect */
  box-shadow:
    inset 3px 3px 6px rgba(166, 180, 210, 0.3),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

.clay-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.clay-input:focus {
  border-color: rgba(100, 140, 220, 0.5);
  background: linear-gradient(145deg, #edf1f9, #e3e8f3);
  box-shadow:
    inset 3px 3px 6px rgba(150, 170, 210, 0.35),
    inset -2px -2px 5px rgba(255, 255, 255, 0.85),
    0 0 0 3px rgba(100, 140, 220, 0.12);
}

.input-icon-right {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8896b3;
  display: flex;
  align-items: center;
}

.input-icon-right.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.input-icon-right.clickable:hover {
  color: #5b7bb5;
}

/* ====== FORM OPTIONS ====== */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5a6a85;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.clay-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(145deg, #edf0f7, #e0e5ef);
  border: 1px solid rgba(180, 195, 220, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  box-shadow:
    inset 2px 2px 4px rgba(166, 180, 210, 0.3),
    inset -1px -1px 3px rgba(255, 255, 255, 0.8);
  position: relative;
}

.clay-checkbox:checked + .checkbox-custom {
  background: linear-gradient(135deg, #6b8cce, #5a7bbf);
  border-color: rgba(90, 123, 191, 0.6);
  box-shadow:
    3px 3px 6px rgba(90, 123, 191, 0.25),
    -2px -2px 4px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.clay-checkbox:checked + .checkbox-custom::after {
  content: '';
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translate(-1px, -1px);
  position: absolute;
}

.forgot-link {
  font-size: 13px;
  font-weight: 500;
  color: #5b7bb5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #3d5fa0;
  text-decoration: underline;
}

/* ====== ERROR ALERT ====== */
.error-alert {
  background: linear-gradient(145deg, #fef0f0, #fde8e8);
  border: 1px solid rgba(239, 120, 120, 0.3);
  color: #c53030;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 12.5px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
  box-shadow:
    inset 2px 2px 4px rgba(220, 140, 140, 0.15),
    inset -1px -1px 3px rgba(255, 255, 255, 0.5);
  animation: shakeIn 0.4s ease;
}

.error-alert svg {
  flex-shrink: 0;
  margin-top: 1px;
}

@keyframes shakeIn {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}

/* ====== SUBMIT BUTTON ====== */
.clay-btn-submit {
  width: 100%;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  color: white;
  background: linear-gradient(135deg, #8aabdb 0%, #6b90c9 40%, #5a7dbf 100%);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Claymorphic raised button */
  box-shadow:
    8px 8px 16px rgba(90, 125, 191, 0.3),
    -4px -4px 10px rgba(160, 195, 255, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
  margin-top: 4px;
}

.clay-btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    10px 10px 20px rgba(90, 125, 191, 0.35),
    -5px -5px 12px rgba(160, 195, 255, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.25),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #92b3df 0%, #7398d0 40%, #6285c4 100%);
}

.clay-btn-submit:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    4px 4px 8px rgba(90, 125, 191, 0.3),
    -2px -2px 5px rgba(160, 195, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
}

.clay-btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ====== FOOTER ====== */
.login-footer-links {
  text-align: center;
  margin-top: 28px;
  font-size: 13px;
  color: #7b8db0;
}

.login-footer-links a {
  color: #5b7bb5;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-footer-links a:hover {
  color: #3d5fa0;
  text-decoration: underline;
}

.login-footer-copy {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(200, 210, 230, 0.4);
  font-size: 11.5px;
  color: #a0aec0;
  letter-spacing: 0.2px;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 520px) {
  .login-card {
    padding: 32px 24px 28px;
    border-radius: 22px;
  }

  .login-card-container {
    padding: 16px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
