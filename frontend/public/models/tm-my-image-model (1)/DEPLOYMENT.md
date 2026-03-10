# Deployment Guide for Tinea Detector

## 🌐 Deployment Options

### Option 1: Vercel (Simplest - Recommended)

**Prerequisites:**
- GitHub account with your code pushed

**Steps:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" 
4. Select your repository
5. Vercel auto-detects Next.js
6. Click "Deploy"

**Important:** Make sure your model files are committed to Git in `public/model/`

### Option 2: Netlify

**Steps:**
1. Connect your GitHub repo to netlify.com
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Deploy

**Environment Variables:**
```
NODE_VERSION=18
```

### Option 3: AWS Amplify

**Steps:**
1. Push code to GitHub
2. Go to AWS Amplify Console
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
5. Deploy

### Option 4: Docker (Self-Hosted)

**Build:**
```bash
docker build -t tinea-detector .
```

**Run:**
```bash
docker run -p 3000:3000 tinea-detector
```

**Using Docker Compose:**
```bash
docker-compose up -d
```

### Option 5: Traditional VPS/Server

**Prerequisites:**
- Linux server with Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

**Setup:**
```bash
# SSH into server
ssh user@your-server

# Clone repository
git clone <your-repo> /var/www/tinea-detector
cd /var/www/tinea-detector

# Install and build
npm install
npm run build

# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "tinea-detector" -- start

# Save PM2 startup
pm2 startup
pm2 save
```

**Nginx Configuration:**
```nginx
upstream tinea_detector {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://tinea_detector;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Production Checklist

- [ ] All model files in `public/model/`
- [ ] `.env.local` configured (if needed)
- [ ] `npm run build` succeeds
- [ ] `npm start` runs without errors
- [ ] Health check endpoint works: `/api/health`
- [ ] Images load correctly
- [ ] Model inference works
- [ ] No console errors
- [ ] Performance acceptable
- [ ] CORS headers configured (if API calls)

## 📊 Performance Optimization

### Reduce Bundle Size
```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

# Analyze
ANALYZE=true npm run build
```

### Image Optimization
```bash
# Already handled by Next.js Image component
# No configuration needed
```

### Caching
- Browser caching: Set Cache-Control headers
- CDN: Use Vercel's built-in CDN
- Model caching: Handled client-side by TensorFlow.js

## 🔍 Monitoring

### Health Check
```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-03-09T13:00:00Z"
}
```

### Logs
- **Vercel**: Dashboard > Analytics > Logs
- **Netlify**: Deploys > Logs
- **Self-hosted**: `pm2 logs` or `docker logs`

## 🚚 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 🆘 Troubleshooting Deployment

### Build Fails
- Check build logs
- Verify all dependencies in `package.json`
- Ensure TypeScript types are correct

### Model Files Not Loading
- Verify files in `public/model/`
- Check file permissions
- Verify file names exactly
- Check CORS headers

### Slow Performance
- Use performance profiling
- Reduce model size
- Enable compression
- Use CDN

### Memory Issues
- Verify server has enough RAM
- Monitor TensorFlow.js memory usage
- Consider model quantization

## 🔗 Useful Links

- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

## 📈 Scaling Tips

- Use CDN for static files
- Implement caching strategies
- Monitor server resources
- Use load balancing for multiple instances
- Consider database for logging (if needed)

## ✅ Deployment Success Checklist

After deployment:
1. ✓ Visit your domain
2. ✓ Upload test image
3. ✓ Verify detection works
4. ✓ Check browser console (F12)
5. ✓ Test on mobile
6. ✓ Check health endpoint
7. ✓ Monitor logs
8. ✓ Performance acceptable

---

Happy deploying! 🚀
