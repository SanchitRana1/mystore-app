/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript:{
    ignoreBuildErrors: true
  },
  eslint:{
    ignoreDuringBuilds:true``
  },
  experimental:{
    serverActions: {
      bodySizeLimit: "100MB"
    }
  },
  images:{
    remotePatterns:[{
      protocol:'https',
      hostname:'img.freepik.com'
    },
    {
      protocol:'https',
      hostname:'cloud.appwrite.io'
    }]
  }
};

export default nextConfig;
