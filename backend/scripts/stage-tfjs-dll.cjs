const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

if (process.platform !== "win32") {
  process.exit(0);
}

const root = process.cwd();
const tfjsRoot = path.join(root, "node_modules", "@tensorflow", "tfjs-node");
const sourceDll = path.join(tfjsRoot, "deps", "lib", "tensorflow.dll");
const targetDll = path.join(tfjsRoot, "lib", "napi-v8", "tensorflow.dll");

if (!fs.existsSync(tfjsRoot) || !fs.existsSync(sourceDll)) {
  process.exit(0);
}

if (fs.existsSync(targetDll)) {
  console.log("tensorflow.dll already staged");
  process.exit(0);
}

try {
  execFileSync(
    process.execPath,
    [
      path.join(tfjsRoot, "scripts", "deps-stage.js"),
      "symlink",
      path.join("node_modules", "@tensorflow", "tfjs-node", "lib", "napi-v8"),
    ],
    { stdio: "inherit" }
  );
} catch (error) {
  const isBusy = String(error?.message || "").includes("EBUSY");
  if (isBusy && fs.existsSync(targetDll)) {
    console.warn("tensorflow.dll already present (locked); continuing");
    process.exit(0);
  }
  process.exit(1);
}
