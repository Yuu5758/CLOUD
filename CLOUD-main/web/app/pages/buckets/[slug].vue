<template>
  <div class="view-container">
    <div class="view-header-flex" style="align-items: center;">
      <div class="view-header-content">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <NuxtLink to="/buckets">
            <el-button :icon="Back" size="small">Back to Buckets</el-button>
          </NuxtLink>
        </div>
        <h1 class="view-title">
          <el-icon class="mr-2" style="color: var(--cf-brand-orange);"><FolderOpened /></el-icon>
          Bucket: {{ slug }}
        </h1> 
        <p class="view-desc">Browse uploaded objects, generate sharing links, and manage storage payloads in this bucket.</p>
        <div class="breadcrumb" style="margin-top: 12px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
          <span class="cursor-pointer" style="color: var(--cf-brand-orange); cursor: pointer; text-decoration: none;" @click="navigateToPrefix('')">Root</span>
          <template v-for="(part, idx) in breadcrumbParts" :key="idx">
            <span style="color: var(--text-muted); margin: 0 2px;">/</span>
            <span class="cursor-pointer" style="color: var(--cf-brand-orange); cursor: pointer; text-decoration: none;" @click="navigateToPrefix(part.path)">{{ part.name }}</span>
          </template>
        </div>
      </div>
      <div style="display: flex; gap: 12px;">
        <el-button :icon="Refresh" @click="loadObjects">Refresh</el-button>
        <el-button :icon="FolderAdd" @click="showCreateFolderDialog = true">Create Folder</el-button>
        <el-button type="primary" :icon="Upload" @click="showUploadDialog = true">Upload File</el-button>
      </div>
    </div>

    <!-- Objects Listing -->
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Object Key / Path</th>
            <th>File Size (Bytes)</th>
            <th>Last Modified</th>
            <th>Redundancy</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="table-empty">
              <el-icon class="is-loading mr-2"><Loading /></el-icon> Loading objects list...
            </td>
          </tr>
          <tr v-else-if="objectsList.length === 0">
            <td colspan="5" class="table-empty">
              No files or folders found here. Click "Create Folder" or "Upload File" to start.
            </td>
          </tr>
          <tr v-else-if="!loading" v-for="obj in objectsList" :key="obj.Key">
            <td>
              <span v-if="obj.isFolder" class="cursor-pointer hover-underline" style="cursor: pointer; color: var(--cf-brand-orange); font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" @click="navigateToPrefix(obj.Key)">
                <el-icon><Folder /></el-icon>
                <span>{{ getRelativeName(obj.Key) }}</span>
              </span>
              <span v-else style="display: inline-flex; align-items: center; gap: 8px;">
                <el-icon style="color: var(--text-muted);"><Document /></el-icon>
                <strong class="font-mono text-sm" style="color: var(--text-main);">{{ getRelativeName(obj.Key) }}</strong>
              </span>
            </td>
            <td class="font-mono" style="color: var(--text-main);">{{ obj.isFolder ? '-' : obj.Size?.toLocaleString() }}</td>
            <td style="color: var(--text-muted);">{{ obj.isFolder ? '-' : formatDate(obj.LastModified) }}</td>
            <td><span class="badge badge-orange">Reed-Solomon</span></td>
            <td style="text-align: right;">
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <el-button 
                  v-if="!obj.isFolder"
                  :icon="Link" 
                  size="small" 
                  @click="handleCopyUrl(obj.Key)" 
                >
                  Copy URL
                </el-button>
                <el-button 
                  v-if="!obj.isFolder"
                  type="success"
                  :icon="TopRight" 
                  size="small" 
                  @click="handleOpenObject(obj.Key)" 
                >
                  Open
                </el-button>
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  size="small" 
                  @click="handleDelete(obj.Key)" 
                >
                  Delete
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- dialog: Upload Object -->
    <el-dialog v-model="showUploadDialog" title="Upload File to Bucket" width="450px" align-center>
      <div class="form-group mb-4">
        <label class="form-label">Destination File Name</label>
        <el-input v-model="uploadObjectKey" placeholder="e.g. holiday.jpg">
          <template v-if="currentPrefix" #prepend>{{ currentPrefix }}</template>
        </el-input>
      </div>
      <div class="form-group mb-4">
        <label class="form-label">Source File</label>
        <div class="upload-drop-zone" @click="$refs.fileInputRef.click()">
          <el-icon size="30" class="mb-2" style="color: var(--cf-brand-orange);"><UploadFilled /></el-icon>
          <div class="upload-title font-semibold text-sm">Click to browse local files</div>
          <div class="upload-subtitle text-xs text-gray-500 mt-1">{{ selectedFile ? selectedFile.name : 'No file selected' }}</div>
          <input type="file" ref="fileInputRef" style="display: none;" @change="handleFileSelection">
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 mt-4">
          <el-button @click="showUploadDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpload">Upload to Bucket</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- dialog: Create Folder -->
    <el-dialog v-model="showCreateFolderDialog" title="Create Folder" width="400px" align-center>
      <div class="form-group mb-4">
        <label class="form-label">Folder Name</label>
        <el-input v-model="newFolderName" placeholder="e.g. assets, logs, users/john" />
        <span class="text-xs text-gray-500 mt-1 block">The folder path will automatically end with a '/'.</span>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 mt-4">
          <el-button @click="showCreateFolderDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleCreateFolder">Create Folder</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from '#app';
import { useS3 } from '../../composables/useS3';
import { Back, Refresh, Upload, Share, Delete, FolderOpened, Loading, UploadFilled, FolderAdd, Folder, Document, Link, TopRight } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug;

const { loadObjectsList, generatePresignedUrl, deleteObject, uploadObject, createFolder, getObjectBlob } = useS3();

const objectsList = ref([]);
const loading = ref(true);

const showUploadDialog = ref(false);
const uploadObjectKey = ref('');
const selectedFile = ref(null);
const fileInputRef = ref(null);

const showCreateFolderDialog = ref(false);
const newFolderName = ref('');

const currentPrefix = ref('');

const breadcrumbParts = computed(() => {
  if (!currentPrefix.value) return [];
  const parts = currentPrefix.value.split('/').filter(Boolean);
  let accumPath = '';
  return parts.map(p => {
    accumPath += p + '/';
    return {
      name: p,
      path: accumPath
    };
  });
});

function navigateToPrefix(prefix) {
  router.push({
    path: route.path,
    query: prefix ? { prefix } : {}
  });
}

function getRelativeName(key) {
  if (!key) return '';
  const current = currentPrefix.value;
  let rel = key;
  if (current && key.startsWith(current)) {
    rel = key.substring(current.length);
  }
  return rel;
}

async function loadObjects() {
  loading.value = true;
  try {
    const res = await loadObjectsList(slug, currentPrefix.value, '/');
    
    const folders = (res.commonPrefixes || []).map(p => ({
      Key: p.Prefix,
      isFolder: true,
      Size: 0,
      LastModified: null
    }));
    
    const files = (res.contents || [])
      .filter(f => f.Key !== currentPrefix.value)
      .map(f => ({
        Key: f.Key,
        isFolder: false,
        Size: f.Size,
        LastModified: f.LastModified
      }));
      
    objectsList.value = [...folders, ...files];
  } catch (error) {
    alert(`Failed to fetch objects list: ${error.message}`);
    objectsList.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleCopyUrl(key) {
  try {
    const url = `${window.location.origin}/api/s3/${slug}/${key}`;
    await navigator.clipboard.writeText(url);
    alert(`Direct S3 URL copied to clipboard!\n\nLink: ${url}`);
  } catch (error) {
    alert(`Failed to copy URL: ${error.message}`);
  }
}

async function handleOpenObject(key) {
  try {
    const blob = await getObjectBlob(slug, key);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    alert(`Failed to open S3 object: ${error.message}`);
  }
}

async function handleDelete(key) {
  if (!confirm(`Are you sure you want to permanently delete "${key}"?`)) return;

  try {
    await deleteObject(slug, key);
    await loadObjects();
  } catch (error) {
    alert(`Failed to delete: ${error.message}`);
  }
}

function handleFileSelection(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
    uploadObjectKey.value = selectedFile.value.name;
  }
}

async function handleUpload() {
  const fileName = uploadObjectKey.value.trim();
  
  if (!fileName) {
    alert("Specify a name for the uploaded file!");
    return;
  }
  if (!selectedFile.value) {
    alert("Please select a file to upload first.");
    return;
  }

  const fullKey = currentPrefix.value + fileName;

  try {
    await uploadObject(slug, fullKey, selectedFile.value);
    showUploadDialog.value = false;
    selectedFile.value = null;
    uploadObjectKey.value = '';
    await loadObjects();
  } catch (error) {
    alert(`Failed to upload file to S3: ${error.message}`);
  }
}

async function handleCreateFolder() {
  let folderName = newFolderName.value.trim();
  if (!folderName) {
    alert("Folder name cannot be empty!");
    return;
  }
  if (folderName.startsWith('/')) {
    folderName = folderName.substring(1);
  }
  const fullKey = currentPrefix.value + folderName;
  try {
    await createFolder(slug, fullKey);
    showCreateFolderDialog.value = false;
    newFolderName.value = '';
    await loadObjects();
  } catch (error) {
    alert(`Failed to create folder: ${error.message}`);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString();
}

watch(() => route.query.prefix, (newPrefix) => {
  currentPrefix.value = newPrefix || '';
  loadObjects();
}, { immediate: true });
</script>
