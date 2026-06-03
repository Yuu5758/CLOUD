<template>
  <div class="view-container">
    <div class="view-header">
      <h1 class="view-title">RustFS Integration Guides</h1>
      <p class="view-desc">Integrate your application stack seamlessly with S3 SDKs pointing to local RustFS storage.</p>
    </div>

    <div class="docs-layout">
      <div class="docs-content">
        <h2 id="cli">🚀 AWS CLI Configurations</h2>
        <p>Setup your system profile to communicate with your standalone local RustFS endpoint URL:</p>
        <div class="code-box">
          <div class="code-box-header">
            <span>Shell / Terminal</span>
            <el-button size="small" :icon="CopyDocument" @click="copyCodeText('cli-cmd')">Copy</el-button>
          </div>
          <pre class="code-box-code" id="cli-cmd"># Set access credentials
aws configure set aws_access_key_id rustfsadmin
aws configure set aws_secret_access_key rustfsadmin

# List local RustFS storage buckets
aws s3 ls --endpoint-url http://127.0.0.1:9000

# Create a bucket
aws s3 mb s3://media-storage --endpoint-url http://127.0.0.1:9000</pre>
        </div>

        <h2 id="python">🐍 Python (Boto3)</h2>
        <p>Setup S3 client inside python backend, specifying the custom endpoint:</p>
        <div class="code-box">
          <div class="code-box-header">
            <span>Python SDK</span>
            <el-button size="small" :icon="CopyDocument" @click="copyCodeText('py-cmd')">Copy</el-button>
          </div>
          <pre class="code-box-code" id="py-cmd">import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://127.0.0.1:9000',
    aws_access_key_id='rustfsadmin',
    aws_secret_access_key='rustfsadmin',
    region_name='us-east-1'
)

# List all available buckets
buckets = s3.list_buckets()
for b in buckets['Buckets']:
    print(f"Bucket Name: {b['Name']}")</pre>
        </div>

        <h2 id="rust">🦀 Rust (aws-sdk-s3)</h2>
        <p>Connect S3 client using the official AWS SDK for Rust:</p>
        <div class="code-box">
          <div class="code-box-header">
            <span>Rust Code</span>
            <el-button size="small" :icon="CopyDocument" @click="copyCodeText('rust-cmd')">Copy</el-button>
          </div>
          <pre class="code-box-code" id="rust-cmd">let config = aws_config::from_env()
    .endpoint_url("http://127.0.0.1:9000")
    .load().await;

let s3_client = aws_sdk_s3::Client::new(&config);
let resp = s3_client.list_buckets().send().await?;</pre>
        </div>
      </div>
      
      <div class="docs-sticky-nav">
        <div class="sticky-title font-semibold text-xs tracking-wider uppercase mb-3 text-slate-400">Content Sections</div>
        <ul class="flex flex-col gap-2 list-none">
          <li><a href="#cli" class="sticky-link">AWS CLI Guide</a></li>
          <li><a href="#python" class="sticky-link">Python Boto3</a></li>
          <li><a href="#rust" class="sticky-link">Rust SDK</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CopyDocument } from '@element-plus/icons-vue';

async function copyCodeText(id) {
  const code = document.getElementById(id).innerText;
  try {
    await navigator.clipboard.writeText(code);
    alert("Copied to clipboard successfully!");
  } catch (err) {
    alert("Copy failed.");
  }
}
</script>
