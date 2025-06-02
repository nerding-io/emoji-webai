# 🚀 Deployment Guide - Emoji Challenge

## GitHub Pages Deployment with CI/CD

This guide covers deploying the Emoji Challenge app to GitHub Pages with automated CI/CD using GitHub Actions.

## 📋 Prerequisites

- GitHub repository with the app code
- GitHub account with Pages enabled
- Basic understanding of Git/GitHub

## 🔧 Initial Setup

### 1. Repository Configuration

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit with deployment setup"
   git push origin main
   ```

2. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll to "Pages" section
   - Set source to "GitHub Actions"
   - Save the settings

### 2. Update Repository-Specific URLs

Replace placeholder URLs in these files with your actual repository information:

**README.md:**
```markdown
[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://YOUR_USERNAME.github.io/YOUR_REPO)
```

**scripts/health-check.js:**
```javascript
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://YOUR_USERNAME.github.io/YOUR_REPO';
```

## 🔄 CI/CD Pipeline

### Workflow Overview

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes:

1. **Build Stage:**
   - Checkout code
   - Setup Node.js 18
   - Install dependencies
   - Run tests (if available)
   - Run linting
   - Build project

2. **Deploy Stage:**
   - Deploy to GitHub Pages
   - Generate deployment URL

3. **Health Check Stage:**
   - Wait for deployment propagation
   - Verify app is accessible
   - Check essential elements
   - Report status

### Trigger Conditions

- **Automatic:** Push to `main` or `master` branch
- **Manual:** Can be triggered via GitHub Actions UI
- **Preview:** Pull requests get preview deployments

## 📊 Monitoring & Verification

### Deployment Status

Check deployment status at:
- GitHub Actions tab in your repository
- Badge in README.md
- GitHub Pages settings

### Health Check

The pipeline includes automated health checks:

```bash
# Manual health check
npm run health-check

# With custom URL
DEPLOYMENT_URL=https://your-custom-domain.com npm run health-check
```

### Expected Results

✅ **Successful deployment should show:**
- ✅ Build job completed
- ✅ Deploy job completed  
- ✅ Health check passed
- 🟢 Green badge in README

❌ **Failed deployment might show:**
- ❌ Build errors
- ❌ Deployment failures
- ❌ Health check failures
- 🔴 Red badge in README

## 🛠️ Local Development

### Quick Start

```bash
# Using the startup script
npm start

# Or manually
npm install
npm run dev
```

### HTTPS Development (for camera/microphone)

```bash
# Generate SSL certificates (one time)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start HTTPS server
HTTPS=true npm start
```

## 🌐 Custom Domain (Optional)

### Setup Steps

1. **Add CNAME file:**
   ```bash
   echo "your-domain.com" > CNAME
   git add CNAME && git commit -m "Add custom domain"
   git push origin main
   ```

2. **Configure DNS:**
   - Add CNAME record: `your-domain.com` → `username.github.io`
   - Wait for DNS propagation (up to 24 hours)

3. **Enable HTTPS:**
   - Go to repository Settings → Pages
   - Check "Enforce HTTPS"

### Domain Verification

```bash
# Check DNS propagation
nslookup your-domain.com

# Test HTTPS
curl -I https://your-domain.com
```

## 🔍 Troubleshooting

### Common Issues

**1. Deployment fails:**
```bash
# Check GitHub Actions logs
# Verify all files are committed
git status
git add -A && git commit -m "Fix deployment"
```

**2. Health check fails:**
```bash
# Manual check
curl -I https://username.github.io/repository-name

# Check if site loads
npm run health-check
```

**3. Assets not loading:**
- Verify file paths are relative
- Check case sensitivity
- Ensure all files are committed

**4. Chrome AI not working:**
- Verify HTTPS is enabled
- Check Chrome Canary setup
- Review browser console errors

### Debug Commands

```bash
# Check build status
npm run build

# Lint code
npm run lint

# Test locally
npm run dev

# Verify deployment
npm run health-check
```

## 📈 Performance Optimization

### Recommendations

1. **Enable compression** (automatic with GitHub Pages)
2. **Optimize images** before committing
3. **Minify CSS/JS** if needed
4. **Use CDN** for external resources

### Monitoring

- Use browser DevTools
- Check Core Web Vitals
- Monitor deployment times
- Track health check responses

## 🔒 Security Considerations

### Best Practices

1. **Content Security Policy** (already implemented)
2. **HTTPS enforcement** (GitHub Pages default)
3. **No sensitive data** in repository
4. **Regular dependency updates**

### Security Headers

GitHub Pages automatically provides:
- HTTPS redirection
- HSTS headers
- Content-Type headers
- XSS protection

## 📞 Support

### Getting Help

1. **GitHub Issues:** Report bugs and feature requests
2. **GitHub Discussions:** Community support
3. **Documentation:** This guide and README.md
4. **Logs:** Check GitHub Actions for deployment logs

### Useful Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/)

---

## 🎯 Quick Checklist

- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] Updated URLs in README.md and health-check.js
- [ ] First deployment successful
- [ ] Health check passing
- [ ] Custom domain configured (optional)
- [ ] Badge showing green status

**Deployment URL:** `https://username.github.io/repository-name`

**Ready to go!** 🚀 