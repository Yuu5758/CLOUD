<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="view-title">REST API Playground</h1>
      <p class="view-desc">Send manual REST queries directly to the S3 compatible RustFS server and inspect response metrics.</p>
    </div>

    <div class="grid-dual">
      <!-- Form Card -->
      <div class="config-card m-0" style="display: flex; flex-direction: column;">
        <div class="card-title" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-icon style="color: var(--cf-brand-orange);"><Promotion /></el-icon>
            <span>Compose REST Request</span>
          </div>
          <!-- Endpoint Template Dropdown -->
          <div style="width: 240px; flex-shrink: 0;">
            <el-select v-model="selectedTemplate" placeholder="API Endpoint Template" size="small" @change="applyTemplate" style="width: 100%;">
              <el-option label="List Buckets (GET /)" value="list-buckets" />
              <el-option label="Create Bucket (PUT /:bucket)" value="create-bucket" />
              <el-option label="Delete Bucket (DELETE /:bucket)" value="delete-bucket" />
              <el-option label="List Objects V2 (GET /:bucket?list-type=2)" value="list-objects" />
              <el-option label="Put Object - Text (PUT /:bucket/:key)" value="put-object-text" />
              <el-option label="Put Object - File (PUT /:bucket/:key)" value="put-object-file" />
              <el-option label="Get Object - Download (GET /:bucket/:key)" value="get-object" />
              <el-option label="Delete Object (DELETE /:bucket/:key)" value="delete-object" />
            </el-select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
          <!-- Postman-like Request URL Bar -->
          <div style="display: flex; gap: 0; align-items: stretch; border: 1px solid var(--clay-border); border-radius: 12px; overflow: hidden; background: var(--clay-bg-card); height: 40px; flex-shrink: 0;">
            <div style="width: 110px; flex-shrink: 0; border-right: 1px solid var(--clay-border);">
              <el-select v-model="restRequest.method" placeholder="Method" style="width: 100%;" class="postman-method-select">
                <el-option label="GET" value="GET" style="color: #0cbb52; font-weight: bold;" />
                <el-option label="POST" value="POST" style="color: #e3a008; font-weight: bold;" />
                <el-option label="PUT" value="PUT" style="color: #2563eb; font-weight: bold;" />
                <el-option label="DELETE" value="DELETE" style="color: #dc2626; font-weight: bold;" />
              </el-select>
            </div>
            <div style="flex: 1; min-width: 0; display: flex; align-items: center; padding-left: 12px; background: var(--clay-bg-input);">
              <span style="color: var(--clay-text-muted); font-size: 13px; font-family: monospace; user-select: none; margin-right: 4px; flex-shrink: 0;">/api/s3</span>
              <el-input 
                v-model="restRequest.path" 
                placeholder="/bucket/object" 
                style="width: 100%;" 
                class="postman-url-input"
                clearable
              />
            </div>
            <el-button 
              type="primary" 
              :icon="VideoPlay"
              style="border-radius: 0; padding: 0 24px; font-weight: 600; background: var(--clay-accent); border: none; height: 100%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" 
              @click="executeRestRequest"
            >
              Send
            </el-button>
          </div>

          <!-- S3 Authorization Signer Widget -->
          <div style="border: 1px solid var(--clay-border); border-radius: 12px; padding: 12px; background: var(--clay-bg-input);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: var(--clay-text-main);">
                <el-icon style="color: var(--clay-accent);"><Key /></el-icon>
                <span>AWS S3 Signature V4 Signer</span>
              </div>
              <el-switch v-model="restRequest.autoSign" size="small" active-text="Auto-Sign" />
            </div>
            <div v-if="restRequest.autoSign" style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 180px;">
                <label style="font-size: 11px; color: var(--clay-text-muted); display: block; margin-bottom: 4px;">S3 Access Key ID</label>
                <el-input v-model="restRequest.accessKey" placeholder="e.g. Admin" size="small" />
              </div>
              <div style="flex: 1; min-width: 180px;">
                <label style="font-size: 11px; color: var(--clay-text-muted); display: block; margin-bottom: 4px;">S3 Secret Access Key</label>
                <el-input v-model="restRequest.secretKey" placeholder="e.g. Laskar57" type="password" show-password size="small" />
              </div>
            </div>
          </div>

          <!-- Postman-like Tabs -->
          <el-tabs v-model="activeTab" style="margin-top: 4px;" class="postman-tabs">
            <!-- Headers Tab -->
            <el-tab-pane name="headers">
              <template #label>
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span>Headers</span>
                  <el-badge :value="headersCount" :max="10" type="info" size="small" />
                </span>
              </template>
              <div style="padding: 12px 0;">
                <label class="form-label" style="margin-bottom: 8px; display: block;">Request Headers (JSON format)</label>
                <el-input 
                  v-model="restRequest.headersText" 
                  type="textarea"
                  :rows="6"
                  class="font-mono text-sm" 
                  placeholder='{\n  "Accept": "application/xml"\n}'
                />
              </div>
            </el-tab-pane>

            <!-- Body Tab (Postman Style) -->
            <el-tab-pane label="Body" name="body">
              <div style="padding: 12px 0;">
                <!-- Body Type Radio Selector -->
                <div style="margin-bottom: 16px;">
                  <el-radio-group v-model="restRequest.payloadType" size="small">
                    <el-radio-button label="none">none</el-radio-button>
                    <el-radio-button label="form-data">form-data</el-radio-button>
                    <el-radio-button label="raw">raw (text)</el-radio-button>
                    <el-radio-button label="binary">binary (file)</el-radio-button>
                  </el-radio-group>
                </div>

                <!-- none description -->
                <div v-if="restRequest.payloadType === 'none'" style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 13px;">
                  This request does not have a body.
                </div>

                <!-- form-data list editor -->
                <div v-if="restRequest.payloadType === 'form-data'">
                  <div style="border: 1px solid var(--clay-border); border-radius: 12px; overflow: hidden; background: var(--clay-bg-card);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                      <thead>
                        <tr style="background: var(--clay-bg-input); border-bottom: 1px solid var(--clay-border); font-size: 12px; color: var(--clay-text-muted); font-weight: 600;">
                          <th style="padding: 8px 12px; width: 30%;">Key</th>
                          <th style="padding: 8px 12px; width: 15%;">Type</th>
                          <th style="padding: 8px 12px; width: 45%;">Value</th>
                          <th style="padding: 8px 12px; width: 10%; text-align: center;"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in formDataRows" :key="idx" style="border-bottom: 1px solid var(--border-color);">
                          <td style="padding: 6px 12px;">
                            <el-input v-model="row.key" placeholder="Key" size="small" style="font-family: monospace;" />
                          </td>
                          <td style="padding: 6px 12px;">
                            <el-select v-model="row.type" size="small" style="width: 80px;">
                              <el-option label="Text" value="text" />
                              <el-option label="File" value="file" />
                            </el-select>
                          </td>
                          <td style="padding: 6px 12px;">
                            <!-- text input -->
                            <el-input 
                              v-if="row.type === 'text'" 
                              v-model="row.textValue" 
                              placeholder="Value" 
                              size="small" 
                            />
                            <!-- file picker -->
                            <div v-else style="display: flex; align-items: center; gap: 8px;">
                              <el-button size="small" type="info" plain @click="triggerRowFileSelect(idx)">
                                {{ row.fileValue ? 'Change File' : 'Select File' }}
                              </el-button>
                              <span class="text-xs text-gray-500 font-mono" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block;">
                                {{ row.fileValue ? row.fileValue.name : 'No file selected' }}
                              </span>
                              <!-- Hidden file input -->
                              <input 
                                type="file" 
                                :id="'row-file-input-' + idx"
                                style="display: none;" 
                                @change="handleRowFileSelection($event, idx)"
                              >
                            </div>
                          </td>
                          <td style="padding: 6px 12px; text-align: center;">
                            <el-button 
                              :icon="Delete" 
                              type="danger" 
                              size="small" 
                              circle 
                              plain 
                              @click="removeFormDataRow(idx)" 
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <el-button 
                    size="small" 
                    :icon="Plus" 
                    type="primary" 
                    plain 
                    @click="addFormDataRow" 
                    style="margin-top: 12px;"
                  >
                    Add Row
                  </el-button>
                </div>

                <!-- raw (text) input -->
                <div v-if="restRequest.payloadType === 'raw'">
                  <el-input 
                    v-model="restRequest.body" 
                    type="textarea"
                    placeholder="Enter raw text payload..." 
                    :rows="6" 
                    class="font-mono text-sm" 
                  />
                </div>

                <!-- binary dropzone -->
                <div v-if="restRequest.payloadType === 'binary'">
                  <div class="upload-drop-zone border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition-colors" style="background: var(--clay-bg-card);" @click="$refs.restFileInputRef.click()">
                    <el-icon size="30" class="mb-2" style="color: var(--cf-brand-orange);"><UploadFilled /></el-icon>
                    <div class="upload-title font-semibold text-sm">Select binary file for S3 upload</div>
                    <div class="upload-subtitle text-xs text-gray-500 mt-1">{{ restSelectedFile ? restSelectedFile.name : 'No file selected' }}</div>
                    <input type="file" ref="restFileInputRef" style="display: none;" @change="handleRestFileSelection">
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- Terminal Output -->
      <div class="terminal-container">
        <div class="terminal-header">
          <div class="terminal-title">
            <el-icon class="mr-2"><Monitor /></el-icon>
            s3_response_stdout
          </div>
          <div class="terminal-dots">
            <span class="dot-t red"></span>
            <span class="dot-t yellow"></span>
            <span class="dot-t green"></span>
          </div>
        </div>
        <div class="terminal-body" ref="terminalBodyRef">
          <div v-for="(log, idx) in terminalLogs" :key="idx" class="terminal-line">
            <span class="terminal-prompt" v-if="log.type === 'cmd'">$</span>
            <pre class="terminal-text" :class="log.type">{{ log.text }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { useS3 } from '../composables/useS3';
import { VideoPlay, Promotion, UploadFilled, Monitor, Plus, Delete, Key } from '@element-plus/icons-vue';

const { s3Config } = useS3();

const activeTab = ref('headers');
const selectedTemplate = ref('');

const restRequest = reactive({
  method: 'GET',
  path: '/',
  headersText: '{\n  "Accept": "application/xml"\n}',
  body: '',
  payloadType: 'none',
  autoSign: true,
  accessKey: '',
  secretKey: ''
});

onMounted(() => {
  if (s3Config.value) {
    restRequest.accessKey = s3Config.value.accessKeyId || '';
    restRequest.secretKey = s3Config.value.secretAccessKey || '';
  }
});

watch(() => s3Config.value, (newVal) => {
  if (newVal) {
    restRequest.accessKey = newVal.accessKeyId || '';
    restRequest.secretKey = newVal.secretAccessKey || '';
  }
}, { deep: true });

const restSelectedFile = ref(null);
const restFileInputRef = ref(null);

const formDataRows = ref([
  { key: 'file', type: 'file', textValue: '', fileValue: null }
]);

function triggerRowFileSelect(idx) {
  const el = document.getElementById(`row-file-input-${idx}`);
  if (el) el.click();
}

function handleRowFileSelection(event, idx) {
  const files = event.target.files;
  if (files && files.length > 0) {
    formDataRows.value[idx].fileValue = files[0];
  }
}

function addFormDataRow() {
  formDataRows.value.push({ key: '', type: 'text', textValue: '', fileValue: null });
}

function removeFormDataRow(idx) {
  formDataRows.value.splice(idx, 1);
  if (formDataRows.value.length === 0) {
    addFormDataRow();
  }
}

function handleRestFileSelection(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    restSelectedFile.value = files[0];
  }
}

watch(() => restRequest.payloadType, (newType) => {
  try {
    const parsed = JSON.parse(restRequest.headersText) || {};
    if (newType === 'binary' || newType === 'form-data') {
      parsed['Accept'] = 'application/json';
      delete parsed['Content-Type'];
    } else if (newType === 'raw') {
      parsed['Content-Type'] = 'application/json';
      delete parsed['Accept'];
    } else {
      parsed['Accept'] = 'application/xml';
      delete parsed['Content-Type'];
    }
    restRequest.headersText = JSON.stringify(parsed, null, 2);
  } catch (e) {
    if (newType === 'binary' || newType === 'form-data') {
      restRequest.headersText = '{\n  "Accept": "application/json"\n}';
    } else if (newType === 'raw') {
      restRequest.headersText = '{\n  "Content-Type": "application/json"\n}';
    } else {
      restRequest.headersText = '{\n  "Accept": "application/xml"\n}';
    }
  }
});

const headersCount = computed(() => {
  try {
    const parsed = JSON.parse(restRequest.headersText);
    return Object.keys(parsed).length;
  } catch (e) {
    return 0;
  }
});

function applyTemplate(val) {
  if (val === 'list-buckets') {
    restRequest.method = 'GET';
    restRequest.path = '/';
    restRequest.headersText = '{\n  "Accept": "application/xml"\n}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  } else if (val === 'create-bucket') {
    restRequest.method = 'PUT';
    restRequest.path = '/new-bucket';
    restRequest.headersText = '{\n  "Accept": "application/xml"\n}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  } else if (val === 'delete-bucket') {
    restRequest.method = 'DELETE';
    restRequest.path = '/new-bucket';
    restRequest.headersText = '{}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  } else if (val === 'list-objects') {
    restRequest.method = 'GET';
    restRequest.path = '/new-bucket?list-type=2';
    restRequest.headersText = '{\n  "Accept": "application/xml"\n}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  } else if (val === 'put-object-text') {
    restRequest.method = 'PUT';
    restRequest.path = '/new-bucket/document.txt';
    restRequest.headersText = '{\n  "Content-Type": "text/plain"\n}';
    restRequest.payloadType = 'raw';
    restRequest.body = 'Hello, this is a plain text payload stored in S3!';
  } else if (val === 'put-object-file') {
    restRequest.method = 'PUT';
    restRequest.path = '/new-bucket/avatar.png';
    restRequest.headersText = '{\n  "Content-Type": "image/png"\n}';
    restRequest.payloadType = 'binary';
    restRequest.body = '';
  } else if (val === 'get-object') {
    restRequest.method = 'GET';
    restRequest.path = '/new-bucket/document.txt';
    restRequest.headersText = '{}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  } else if (val === 'delete-object') {
    restRequest.method = 'DELETE';
    restRequest.path = '/new-bucket/document.txt';
    restRequest.headersText = '{}';
    restRequest.payloadType = 'none';
    restRequest.body = '';
  }
  
  if (restRequest.payloadType !== 'none') {
    activeTab.value = 'body';
  } else {
    activeTab.value = 'headers';
  }
}

const terminalLogs = ref([
  { type: 'sys', text: 'System terminal REST API playground initialized.' },
  { type: 'sys', text: 'Select an API Endpoint Template or compose manual queries to execute.' }
]);

const terminalBodyRef = ref(null);

// Web Crypto SigV4 Signing Helpers
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key, message) {
  const gKey = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    gKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const msgBuffer = new TextEncoder().encode(message);
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  return new Uint8Array(signature);
}

function hex(uint8Array) {
  return Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getAwsSigV4Headers({ method, path, headers, body, accessKeyId, secretAccessKey, region = 'us-east-1', service = 's3' }) {
  const amzDate = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
  const dateStamp = amzDate.substring(0, 8);

  const [pathPart, queryPart] = path.split('?');
  const canonicalUri = '/' + pathPart.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  
  const queryParams = new URLSearchParams(queryPart || '');
  const sortedQueryKeys = Array.from(queryParams.keys()).sort();
  const canonicalQueryString = sortedQueryKeys
    .map(key => {
      const vals = queryParams.getAll(key).sort();
      return vals.map(val => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
    })
    .filter(Boolean)
    .join('&');

  const canonicalHeadersMap = {
    'host': window.location.host,
    'x-amz-date': amzDate,
    ...headers
  };
  
  const sortedHeaderKeys = Object.keys(canonicalHeadersMap).map(k => k.toLowerCase()).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key}:${canonicalHeadersMap[key].toString().trim()}`)
    .join('\n') + '\n';
    
  const signedHeaders = sortedHeaderKeys.join(';');

  let payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  if (body) {
    if (typeof body === 'string') {
      payloadHash = await sha256(body);
    } else {
      payloadHash = 'UNSIGNED-PAYLOAD';
    }
  }
  
  canonicalHeadersMap['x-amz-content-sha256'] = payloadHash;
  const sortedKeysWithHash = Object.keys(canonicalHeadersMap).map(k => k.toLowerCase()).sort();
  const finalCanonicalHeaders = sortedKeysWithHash
    .map(key => `${key}:${canonicalHeadersMap[key].toString().trim()}`)
    .join('\n') + '\n';
  const finalSignedHeaders = sortedKeysWithHash.join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    finalCanonicalHeaders,
    finalSignedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalReqHash = await sha256(canonicalRequest);
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalReqHash
  ].join('\n');

  const kDate = await hmacSha256('AWS4' + secretAccessKey, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signatureBytes = await hmacSha256(kSigning, stringToSign);
  const signature = hex(signatureBytes);

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${finalSignedHeaders}, Signature=${signature}`;

  return {
    ...headers,
    'Authorization': authorizationHeader,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash
  };
}

async function executeRestRequest() {
  const method = restRequest.method;
  const path = restRequest.path;
  const isBrowser = typeof window !== 'undefined';
  const url = isBrowser 
    ? `${window.location.origin}/api/s3${path}` 
    : `${s3Config.value.endpoint}${path}`;
  
  terminalLogs.value.push({
    type: 'cmd',
    text: `curl -X ${method} "${url}"`
  });

  let parsedHeaders = {};
  try {
    parsedHeaders = JSON.parse(restRequest.headersText);
  } catch (e) {
    terminalLogs.value.push({
      type: 'err',
      text: 'Error: Invalid Headers JSON formatting!'
    });
    return;
  }

  const fetchOpts = {
    method,
    headers: { ...parsedHeaders }
  };

  if (method === 'PUT' || method === 'POST') {
    if (restRequest.payloadType === 'raw' && restRequest.body) {
      fetchOpts.body = restRequest.body;
      if (!Object.keys(parsedHeaders).some(k => k.toLowerCase() === 'content-type')) {
        fetchOpts.headers['Content-Type'] = 'application/json';
      }
    } else if (restRequest.payloadType === 'form-data') {
      const formData = new FormData();
      formDataRows.value.forEach(row => {
        if (row.key) {
          if (row.type === 'file' && row.fileValue) {
            formData.append(row.key, row.fileValue);
          } else if (row.type === 'text') {
            formData.append(row.key, row.textValue);
          }
        }
      });
      fetchOpts.body = formData;
      // Remove content-type so browser sets boundary for multipart/form-data
      for (const k of Object.keys(fetchOpts.headers)) {
        if (k.toLowerCase() === 'content-type') {
          delete fetchOpts.headers[k];
        }
      }
    } else if (restRequest.payloadType === 'binary' && restSelectedFile.value) {
      const formData = new FormData();
      formData.append('file', restSelectedFile.value);
      fetchOpts.body = formData;
      // Remove content-type so browser sets boundary for multipart/form-data
      for (const k of Object.keys(fetchOpts.headers)) {
        if (k.toLowerCase() === 'content-type') {
          delete fetchOpts.headers[k];
        }
      }
    }
  }

  // Apply S3 AWS Signature V4 if autoSign is enabled
  if (restRequest.autoSign && restRequest.accessKey && restRequest.secretKey) {
    try {
      const signedHeaders = await getAwsSigV4Headers({
        method,
        path,
        headers: fetchOpts.headers,
        body: fetchOpts.body,
        accessKeyId: restRequest.accessKey,
        secretAccessKey: restRequest.secretKey,
        region: s3Config.value.region || 'us-east-1'
      });
      fetchOpts.headers = signedHeaders;
    } catch (sigErr) {
      terminalLogs.value.push({
        type: 'err',
        text: `AWS Signature V4 signing failed: ${sigErr.message}`
      });
    }
  }

  try {
    const res = await fetch(url, fetchOpts);
    const text = await res.text();
    
    terminalLogs.value.push({
      type: 'success',
      text: `HTTP Status: ${res.status} ${res.statusText}`
    });

    let headersStr = 'Response Headers:\n';
    res.headers.forEach((val, key) => {
      headersStr += `  ${key}: ${val}\n`;
    });
    
    terminalLogs.value.push({
      type: 'meta',
      text: headersStr
    });

    terminalLogs.value.push({
      type: 'output',
      text: text || '(Empty response body)'
    });
  } catch (err) {
    terminalLogs.value.push({
      type: 'err',
      text: `Connection failed / CORS error:\n${err.message}\n\nEnsure S3 server is online at ${s3Config.value.endpoint}`
    });
  }

  nextTick(() => {
    if (terminalBodyRef.value) {
      terminalBodyRef.value.scrollTop = terminalBodyRef.value.scrollHeight;
    }
  });
}
</script>

<style>
/* Custom overrides to achieve clean, premium Postman-like single bar */
.postman-method-select .el-select__wrapper {
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background: var(--clay-bg-card) !important;
  height: 40px !important;
}

.postman-url-input .el-input__wrapper {
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0 !important;
}

.postman-tabs .el-tabs__item {
  font-weight: 600 !important;
  color: var(--clay-text-muted) !important;
}

.postman-tabs .el-tabs__item.is-active {
  color: var(--clay-accent) !important;
}

.postman-tabs .el-tabs__active-bar {
  background-color: var(--clay-accent) !important;
}
</style>
