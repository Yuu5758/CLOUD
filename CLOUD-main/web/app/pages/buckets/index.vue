<template>
  <div class="view-container">
    <div class="view-header-flex">
      <div class="view-header-content">
        <h1 class="view-title">Bucket Manager</h1>
        <p class="view-desc">Create, browse, and delete S3-compatible buckets. Click on a bucket to browse its files.</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="showCreateBucketDialog = true">
        Create Bucket
      </el-button>
    </div>

    <!-- Buckets Listing -->
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Bucket Name</th>
            <th>Access Permission</th>
            <th>Region</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="bucketsList.length === 0">
            <td colspan="4" class="table-empty">
              No active buckets found. Create a bucket to start storing objects.
            </td>
          </tr>
          <tr v-for="bucket in bucketsList" :key="bucket.Name">
            <td>
              <NuxtLink :to="'/buckets/' + bucket.Name" class="bucket-name-txt font-semibold">
                <el-icon class="mr-2" style="color: var(--cf-brand-orange);"><Folder /></el-icon>
                {{ bucket.Name }}
              </NuxtLink>
            </td>
            <td><span class="badge badge-blue">Private</span></td>
            <td><span class="badge badge-gray">us-east-1</span></td>
            <td style="text-align: right;">
              <el-button 
                type="danger" 
                :icon="Delete" 
                size="small" 
                @click="handleDelete(bucket.Name)" 
              >
                Delete
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- dialog: Create Bucket -->
    <el-dialog v-model="showCreateBucketDialog" title="Create New S3 Bucket" width="450px" align-center>
      <div class="form-group mb-4">
        <label class="form-label">Bucket Name</label>
        <el-input v-model="newBucketName" placeholder="e.g. static-media-assets" />
        <p class="input-hint mt-1 text-xs text-gray-500">Name must contain only lowercase alphanumeric characters or hyphens.</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 mt-4">
          <el-button @click="showCreateBucketDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleCreate">Create Bucket</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useS3 } from '../../composables/useS3';
import { Plus, Delete, Folder } from '@element-plus/icons-vue';

const { bucketsList, createBucket, deleteBucket } = useS3();
const showCreateBucketDialog = ref(false);
const newBucketName = ref('');

async function handleCreate() {
  const name = newBucketName.value.trim().toLowerCase();
  if (!name) {
    alert("Bucket name cannot be empty!");
    return;
  }

  try {
    await createBucket(name);
    showCreateBucketDialog.value = false;
    newBucketName.value = '';
  } catch (error) {
    alert(`Failed to create bucket: ${error.message}`);
  }
}

async function handleDelete(name) {
  if (!confirm(`Are you sure you want to permanently delete the bucket "${name}"?`)) return;

  try {
    await deleteBucket(name);
  } catch (error) {
    alert(`Failed to delete bucket: ${error.message}\n(Ensure the bucket is empty first)`);
  }
}
</script>
