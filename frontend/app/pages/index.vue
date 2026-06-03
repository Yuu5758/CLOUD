<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="view-title">Dashboard Overview</h1>
      <p class="view-desc">Monitor connection status, adjust endpoint configurations, and verify object storage health.</p>
    </div>

    <!-- Configuration Card -->
    <div class="config-card">
      <div class="card-title">
        <el-icon class="mr-2"><Setting /></el-icon>
        Connection Configuration
      </div>
      <div class="config-grid">
        <div class="form-group">
          <label class="form-label">S3 Endpoint URL</label>
          <el-select v-model="s3Config.endpoint" class="w-full">
            <el-option label="http://127.0.0.1:9000" value="http://127.0.0.1:9000" />
            <el-option label="http://localhost:9000" value="http://localhost:9000" />
            <el-option label="http://localhost:3000/api/s3" value="http://localhost:3000/api/s3" />
          </el-select>
        </div>
        <div class="form-group">
          <label class="form-label">Access Key</label>
          <el-input v-model="s3Config.accessKeyId" placeholder="rustfsadmin" />
        </div>
        <div class="form-group">
          <label class="form-label">Secret Key</label>
          <el-input v-model="s3Config.secretAccessKey" type="password" placeholder="rustfsadmin" show-password />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-4">
        <el-button type="primary" :icon="Check" @click="saveAndConnect">
          Save and Connect
        </el-button>
      </div>
    </div>

    <!-- Stats Widgets -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">Total Buckets</div>
          <div class="stat-value">{{ bucketsList.length }}</div>
        </div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-icon">
          <el-icon><Platform /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">Storage Engine</div>
          <div class="stat-value" style="font-size: 16px; margin-top: 6px;">Erasure Coding (EC)</div>
        </div>
      </div>
      <div class="stat-card stat-blue">
        <div class="stat-icon">
          <el-icon><Key /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">License Type</div>
          <div class="stat-value" style="font-size: 16px; margin-top: 6px;">Open Source (Apache 2.0)</div>
        </div>
      </div>
    </div>

    <!-- Features Table -->
    <h2 class="section-title">System Core Features</h2>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>S3 REST API Engine</strong></td>
            <td><span class="badge badge-success"><el-icon class="mr-1"><CircleCheck /></el-icon> Ready</span></td>
            <td>Full compatibility with bucket and object metadata APIs.</td>
          </tr>
          <tr>
            <td><strong>Reed-Solomon EC</strong></td>
            <td><span class="badge badge-success"><el-icon class="mr-1"><CircleCheck /></el-icon> Ready</span></td>
            <td>Provides bitrot protection and automatic background repair.</td>
          </tr>
          <tr>
            <td><strong>Audit Logs Fan-out</strong></td>
            <td><span class="badge badge-success"><el-icon class="mr-1"><CircleCheck /></el-icon> Ready</span></td>
            <td>Direct streaming output to MySQL, PostgreSQL, NATS, and Redis.</td>
          </tr>
          <tr>
            <td><strong>S3 Event Notifications</strong></td>
            <td><span class="badge badge-success"><el-icon class="mr-1"><CircleCheck /></el-icon> Ready</span></td>
            <td>Notify object uploads/removals to Redis queues or Webhooks.</td>
          </tr>
          <tr>
            <td><strong>Object Versioning</strong></td>
            <td><span class="badge badge-success"><el-icon class="mr-1"><CircleCheck /></el-icon> Ready</span></td>
            <td>Preserves file history layers dynamically.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useS3 } from '../composables/useS3';
import { Check, Setting, Folder, Platform, Key, CircleCheck } from '@element-plus/icons-vue';

const { s3Config, bucketsList, checkConnection } = useS3();

async function saveAndConnect() {
  const success = await checkConnection();
  if (success) {
    alert("Connection established successfully!");
  } else {
    alert("Could not connect to S3 Endpoint. Check your settings.");
  }
}
</script>
