import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = path.resolve(__dirname, '..');
const MODEL_DIR = path.join(ROOT_DIR, 'src/ml/models');
const TRAINING_DIR = path.join(ROOT_DIR, 'src/ml/training');
const REPORT_FILE = path.join(ROOT_DIR, 'reports', 'MODEL_FRESHNESS_REPORT.md');

const MODEL_FILE = path.join(MODEL_DIR, 'mastery_model.pkl');
const PROVENANCE_FILE = path.join(MODEL_DIR, 'provenance_report.json');
const TRAINING_SCRIPT = path.join(TRAINING_DIR, 'train_mastery_model.py');
const TRAINING_DATA = path.join(TRAINING_DIR, 'training_data.csv');

// Interfaces
interface ProvenanceData {
  model_name: string;
  version: string;
  training_timestamp: string;
  provenance: {
    git_commit_hash: string;
    script_hash: string;
    data_hash: string;
    data_source: string;
    data_generation_metadata?: any;
  };
  parameters: any;
  metrics: any;
  environment: any;
}

function calculateHash(filepath: string): string {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function generateReport() {
  console.log('🔍 Starting Model Freshness Check...');
  console.log(`   Running from: ${ROOT_DIR}`);

  // 1. Check if files exist
  if (!fs.existsSync(PROVENANCE_FILE)) {
    console.error(`❌ Provenance file not found: ${PROVENANCE_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(TRAINING_SCRIPT)) {
    console.error(`❌ Training script not found: ${TRAINING_SCRIPT}`);
    process.exit(1);
  }

  if (!fs.existsSync(TRAINING_DATA)) {
    console.error(`❌ Training data not found: ${TRAINING_DATA}`);
    process.exit(1);
  }

  // 2. Read provenance data
  const provenance: ProvenanceData = JSON.parse(fs.readFileSync(PROVENANCE_FILE, 'utf-8'));
  const storedScriptHash = provenance.provenance.script_hash;
  const storedDataHash = provenance.provenance.data_hash;
  const trainingTimestamp = provenance.training_timestamp;

  console.log(`📄 Loaded provenance for model: ${provenance.model_name} (v${provenance.version})`);
  console.log(`   Training Timestamp: ${trainingTimestamp}`);

  // 3. Calculate current hashes
  const currentScriptHash = calculateHash(TRAINING_SCRIPT);
  const currentDataHash = calculateHash(TRAINING_DATA);

  console.log(`   Stored Script Hash: ${storedScriptHash}`);
  console.log(`   Current Script Hash: ${currentScriptHash}`);
  console.log(`   Stored Data Hash: ${storedDataHash}`);
  console.log(`   Current Data Hash: ${currentDataHash}`);

  // 4. Check model file existence and size
  let modelStatus = 'UNKNOWN';
  let modelSize = 0;
  if (fs.existsSync(MODEL_FILE)) {
    const stats = fs.statSync(MODEL_FILE);
    modelSize = stats.size;
    if (modelSize > 0) {
      modelStatus = 'EXISTS';
    } else {
      modelStatus = 'EMPTY';
    }
  } else {
    modelStatus = 'MISSING';
  }

  // 5. Compare and determine status
  let status = 'FRESH';
  const issues: string[] = [];

  if (modelStatus === 'MISSING') {
    status = 'MISSING';
    issues.push('- ❌ **Model Missing:** The model file `src/ml/models/mastery_model.pkl` does not exist.');
  } else if (modelStatus === 'EMPTY') {
    status = 'CORRUPT';
    issues.push('- ❌ **Model Corrupt:** The model file exists but is empty.');
  }

  if (currentScriptHash !== storedScriptHash) {
    status = 'STALE';
    issues.push('- ⚠️ **Script Drift:** The training script `src/ml/training/train_mastery_model.py` has changed since the model was trained.');
  }

  if (currentDataHash !== storedDataHash) {
    status = 'STALE'; // Can be STALE even if missing/corrupt, but let's accumulate issues
    issues.push('- ⚠️ **Data Drift:** The training data `src/ml/training/training_data.csv` has changed since the model was trained.');
  }

  // 6. Generate Report Content
  let reportContent = `# ML Model Freshness Report\n\n`;
  reportContent += `**Date:** ${new Date().toISOString()}\n`;
  reportContent += `**Model:** Topic Mastery Prediction Model (v${provenance.version})\n`;
  reportContent += `**Status:** ${status === 'FRESH' ? '✅ FRESH' : (status === 'STALE' ? '⚠️ STALE' : '❌ ' + status)}\n\n`;

  reportContent += `## Provenance Summary\n`;
  reportContent += `- **Training Timestamp:** ${trainingTimestamp}\n`;
  reportContent += `- **Model Artifact:** \`src/ml/models/mastery_model.pkl\` (${modelStatus === 'EXISTS' ? (modelSize / 1024).toFixed(2) + ' KB' : modelStatus})\n`;
  reportContent += `- **Training Script:** \`src/ml/training/train_mastery_model.py\`\n`;
  reportContent += `- **Training Data:** \`src/ml/training/training_data.csv\`\n\n`;

  reportContent += `## Integrity Check\n\n`;

  reportContent += `| Component | Stored Hash (Provenance) | Current Hash (File System) | Status |\n`;
  reportContent += `| :--- | :--- | :--- | :--- |\n`;
  reportContent += `| **Training Script** | \`${storedScriptHash.substring(0, 16)}...\` | \`${currentScriptHash.substring(0, 16)}...\` | ${currentScriptHash === storedScriptHash ? '✅ Match' : '❌ Mismatch'} |\n`;
  reportContent += `| **Training Data** | \`${storedDataHash.substring(0, 16)}...\` | \`${currentDataHash.substring(0, 16)}...\` | ${currentDataHash === storedDataHash ? '✅ Match' : '❌ Mismatch'} |\n\n`;

  if (issues.length > 0) {
    reportContent += `## Issues Detected\n\n`;
    issues.forEach(issue => reportContent += `${issue}\n`);
    reportContent += `\n`;

    reportContent += `## Recommended Actions\n\n`;
    reportContent += `To resolve these issues, verify the changes in the script or data and verify if retraining is required. If so, run the following command:\n\n`;
    reportContent += `\`\`\`bash\npython3 src/ml/training/train_mastery_model.py\n\`\`\`\n`;
  } else {
    reportContent += `## Conclusion\n\n`;
    reportContent += `The model is **up-to-date** and consistent with the current codebase and data. No action is required.\n`;
  }

  // 7. Write Report
  if (!fs.existsSync(path.dirname(REPORT_FILE))) {
    fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  }
  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`✅ Report generated at: ${REPORT_FILE}`);
}

generateReport();
