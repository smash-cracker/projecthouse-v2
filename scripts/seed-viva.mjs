// Run once: node scripts/seed-viva.mjs
// Populates viva_qa table with dummy data. Safe to re-run — clears first.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Manually parse .env.local (no dotenv needed)
const env = {};
try {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) env[key.trim()] = rest.join("=").trim();
  }
} catch {
  console.error(" Could not read .env.local");
  process.exit(1);
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(" Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const VIVA_QA = {
  ml: [
    { question: "What is the bias-variance tradeoff and how did you handle it in your project?", answer: "Bias is the error from wrong assumptions; variance is the error from sensitivity to training data. A high-bias model underfits; high-variance overfits. In ML projects like credit scoring, cross-validation and regularisation (L1/L2) are used to find the sweet spot." },
    { question: "Why did you choose XGBoost over a simple decision tree?", answer: "XGBoost uses gradient boosting — it builds trees sequentially, each correcting errors of the previous. It handles missing values natively, supports regularisation, and typically outperforms single trees by a large margin on tabular data." },
    { question: "What is feature engineering and why is it critical for ML?", answer: "Feature engineering transforms raw data into meaningful inputs. For example, deriving 'debt-to-income ratio' from separate columns gives the model a signal it cannot easily learn on its own. Good features reduce model complexity requirements." },
    { question: "How did you evaluate your model? What metrics did you use and why?", answer: "Accuracy alone is misleading on imbalanced data. Precision, recall, F1-score, and AUC-ROC give a fuller picture. For a fraud/credit model, recall (catching actual positives) is usually prioritised over precision." },
    { question: "What is cross-validation and why is it better than a single train/test split?", answer: "k-Fold cross-validation splits the data into k folds, trains k times each using a different fold as the test set, and averages results. It gives a more reliable estimate of generalisation and reduces variance in the evaluation." },
    { question: "What steps did you take to handle class imbalance?", answer: "Common strategies include oversampling the minority class (SMOTE), undersampling the majority, using class-weight parameters in the model, and choosing metrics like F1 that reflect imbalance." },
    { question: "Explain your data preprocessing pipeline.", answer: "Steps typically include handling missing values (imputation), encoding categorical variables (one-hot / label encoding), scaling numeric features (StandardScaler / MinMaxScaler), and splitting into train/validation/test sets before any fitting." },
    { question: "What is overfitting? How would you detect and fix it?", answer: "Overfitting means the model memorises training data and fails on unseen data. Detect it by comparing train vs. validation loss. Fix it with more data, dropout, regularisation, early stopping, or simpler models." },
  ],
  dl: [
    { question: "What is backpropagation and how does it train a neural network?", answer: "Backpropagation computes the gradient of the loss with respect to each weight using the chain rule, then an optimiser (like Adam) updates the weights to minimise loss. It flows backward from output layer to input layer." },
    { question: "Why did you use LSTM / Transformer instead of a basic RNN?", answer: "Vanilla RNNs suffer from vanishing gradients over long sequences. LSTMs use gated cells (input, forget, output gates) to carry long-range context. Transformers use self-attention and are parallelisable, handling even longer dependencies." },
    { question: "What activation function did you use and why?", answer: "ReLU is the default hidden-layer choice — it avoids vanishing gradients and is computationally cheap. Sigmoid/Softmax are used in output layers for binary/multi-class classification respectively." },
    { question: "How did you prevent your deep learning model from overfitting?", answer: "Dropout randomly zeros activations during training, forcing redundant representations. Batch normalisation stabilises training. Data augmentation artificially expands the dataset. Early stopping halts training when validation loss stops improving." },
    { question: "What is transfer learning and why did you use a pre-trained model?", answer: "Transfer learning re-uses weights learned on large datasets (like ImageNet). The early layers capture generic features (edges, textures) that transfer well, so fine-tuning only the later layers achieves high accuracy with far less data and training time." },
    { question: "Explain your training loop — loss function, optimiser, learning rate.", answer: "The loss function measures prediction error (cross-entropy for classification, MSE for regression). The optimiser (Adam, SGD) computes weight updates. The learning rate controls step size; a scheduler (ReduceLROnPlateau, cosine annealing) adjusts it during training." },
    { question: "What is batch normalisation and what problem does it solve?", answer: "BatchNorm normalises activations within a mini-batch to zero mean and unit variance, then applies learnable scale and shift. It reduces internal covariate shift, allowing higher learning rates and faster convergence." },
    { question: "How did you handle limited labelled data for your deep learning project?", answer: "Strategies include data augmentation (flips, crops, colour jitter), semi-supervised learning, self-supervised pre-training, or using a pre-trained backbone and fine-tuning on the small labelled set." },
  ],
  cv: [
    { question: "What is a convolutional layer and what does it learn?", answer: "A conv layer applies learned filters (kernels) that slide across the input image computing dot products. Early layers learn low-level features (edges, colours); deeper layers learn complex shapes and object parts." },
    { question: "What is Grad-CAM and why is it useful?", answer: "Gradient-weighted Class Activation Mapping highlights which regions of an image influenced a CNN's prediction. It uses the gradients flowing into the final conv layer to produce a coarse heatmap, making model decisions interpretable." },
    { question: "Explain the YOLO architecture. How does it differ from two-stage detectors?", answer: "YOLO is a single-stage detector — it predicts bounding boxes and class probabilities in one forward pass over a grid. Two-stage detectors (Faster R-CNN) first propose regions then classify them. YOLO is faster; two-stage detectors are generally more accurate on small objects." },
    { question: "What datasets did you use and what was the train/val/test split?", answer: "Standard splits are 70/15/15 or 80/10/10. For medical imaging (APTOS, for example) the split must be stratified by class and patient to avoid data leakage between the sets." },
    { question: "How did you handle class imbalance in your image dataset?", answer: "Techniques include weighted loss functions, oversampling rare classes (duplication or synthetic augmentation with GANs), and under-sampling dominant classes. Confusion matrices and per-class F1 reveal which classes need attention." },
    { question: "What is mean Average Precision (mAP) in object detection?", answer: "mAP averages the Average Precision (area under the Precision-Recall curve) across all object classes and IoU thresholds. mAP@0.5 is the standard benchmark — a detection is counted correct if its IoU with the ground-truth box exceeds 0.5." },
    { question: "What augmentation techniques did you apply and why?", answer: "Random horizontal flips, rotation, brightness/contrast jitter, and random crops increase dataset diversity. Augmentations are applied only to training data and help the model generalise to real-world variation in lighting and orientation." },
  ],
  web: [
    { question: "Explain your system architecture. What does each component do?", answer: "A typical MERN/Next.js project has a React frontend (renders UI, handles state), a Node/Express backend (business logic, authentication, API routes), a MongoDB or PostgreSQL database, and optional third-party services (OpenAI, Stripe, etc.)." },
    { question: "How did you implement authentication and authorisation?", answer: "JWT (JSON Web Tokens) are stateless — the server issues a signed token on login; subsequent requests include it in the Authorization header. Middleware validates the token and attaches the user to the request. NextAuth simplifies OAuth flows." },
    { question: "What is REST vs GraphQL? Which did you use and why?", answer: "REST uses fixed endpoints per resource; GraphQL uses a single endpoint with a query language letting clients request exactly the data they need. REST is simpler to cache; GraphQL reduces over-fetching in complex UIs." },
    { question: "How does your application handle errors and edge cases?", answer: "Frontend: try/catch around fetch calls, user-friendly error states and loading skeletons. Backend: centralised error-handling middleware returns consistent JSON error objects with HTTP status codes. Validation at the boundary using Zod or Joi." },
    { question: "What security measures did you implement?", answer: "Input sanitisation to prevent XSS, parameterised queries / ORM to prevent SQL injection, CORS configuration, rate limiting on auth endpoints, environment variables for secrets, and HTTPS in deployment." },
    { question: "How did you deploy the project and what does the CI/CD pipeline look like?", answer: "Common setups: Vercel for the Next.js frontend (auto-deploys on git push), Railway or Render for the Node backend, MongoDB Atlas as a managed database. GitHub Actions runs tests and linting before deploying." },
    { question: "What is your database schema? Walk us through the main collections/tables.", answer: "This is project-specific. The panel expects you to explain entities, their relationships (1:1, 1:N, N:M), indexes used for query performance, and any denormalisation decisions you made for speed." },
  ],
  mob: [
    { question: "Why did you choose Flutter over React Native (or vice versa)?", answer: "Flutter uses Dart and its own rendering engine (Skia/Impeller), giving pixel-perfect consistency across platforms. React Native uses JavaScript bridge to native components, offering better ecosystem access. Flutter is faster to render; React Native has a larger JS library ecosystem." },
    { question: "How does on-device inference work in your TFLite app?", answer: "The trained model is converted to TFLite FlatBuffer format and bundled in the app assets. The TFLite interpreter loads it, runs quantised inference on the CPU or GPU delegate, and returns results locally — no internet required." },
    { question: "How did you manage state in your Flutter application?", answer: "Options include setState (local), Provider, Riverpod, or BLoC. Riverpod and BLoC suit larger apps by separating business logic from UI. The choice depends on complexity and team preference." },
    { question: "What is the difference between hot reload and hot restart in Flutter?", answer: "Hot reload injects updated Dart source into the running VM and rebuilds the widget tree, preserving app state. Hot restart resets the full Dart VM — useful when state or initialisation logic changes." },
    { question: "How did you handle offline functionality?", answer: "SQLite (via sqflite) stores data locally. Firebase's offline persistence caches Firestore reads and queues writes until connectivity is restored. The app detects connectivity with the connectivity_plus package and shows appropriate UI states." },
    { question: "How did you optimise the app for performance and battery?", answer: "Key strategies: use const constructors to avoid unnecessary rebuilds, cache images (cached_network_image), run heavy work (model inference, image processing) in Dart isolates to avoid janking the UI thread, and lazy-load lists with ListView.builder." },
    { question: "What permissions does your app require and how did you handle them?", answer: "Camera, storage, and location permissions are declared in AndroidManifest.xml and Info.plist. Runtime requests use the permission_handler package. The app gracefully degrades or explains why the permission is needed if the user denies." },
  ],
};

async function seed() {
  console.log("  Clearing existing viva_qa rows...");
  const { error: delErr } = await supabase.from("viva_qa").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) { console.error("Delete failed:", delErr.message); process.exit(1); }

  const rows = [];
  for (const [cat, questions] of Object.entries(VIVA_QA)) {
    questions.forEach((qa, i) => {
      rows.push({ cat, question: qa.question, answer: qa.answer, order_index: i });
    });
  }

  console.log(`📥  Inserting ${rows.length} questions...`);
  const { error: insErr } = await supabase.from("viva_qa").insert(rows);
  if (insErr) { console.error("Insert failed:", insErr.message); process.exit(1); }

  console.log(`✅  Done! ${rows.length} viva questions seeded.`);
}

seed();
