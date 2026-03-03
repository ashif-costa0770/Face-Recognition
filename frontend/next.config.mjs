/** @type {import('next').NextConfig} */
const nextConfig = {
  // Work around Windows lock/permission issues with hidden .next folders.
  distDir: "buildcache",
};

export default nextConfig;
