# 🏠 Zoo Finder

A **collaborative** rental property tracking app for couples finding their perfect home. Share data in real-time, track Zillow listings, schedule tours, and manage preferences together.

## ✨ Features

- **🤝 Real-Time Collaboration**: Shared database syncs between you and your partner instantly
- **🔗 Zillow Integration**: Paste Zillow URLs to automatically extract property details
- **🗓️ Tour Calendar**: Visual calendar view for scheduled property tours
- **💝 Individual Preferences**: Heart filters for both partners (Maddie and Brittanie)
- **📊 Smart Filtering**: Filter by preferences, price, and tour status
- **🖼️ Custom Images**: Override property images with your own URLs
- **👥 Contact Management**: Store property owner/manager contact information
- **🔄 Auto-Sync**: Data refreshes every 30 seconds to stay in sync

## 🚀 Deploy to Vercel (Make it Shared!)

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for shared deployment"
   git push origin main
   ```

2. **Deploy with Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy

3. **Add Shared Database**:
   - In Vercel dashboard: Storage → Create KV Database
   - Connect it to your project
   - Redeploy your project
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add KV database through Vercel dashboard**

## 🤝 Perfect for Couples

Once deployed, you can:
- ✅ Share one URL between both partners
- ✅ See each other's changes in real-time
- ✅ Track preferences with individual heart filters
- ✅ Coordinate tours and outreach together
- ✅ No account creation needed - just visit the link!

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📱 How to Use

1. **Add Properties**: Paste Zillow URLs or use custom image/contact override
2. **Track Status**: Mark request sent, response received, tours scheduled
3. **Set Preferences**: Use individual heart buttons for each partner
4. **Filter Views**: Show only favorites, price ranges, etc.
5. **Calendar View**: Switch to calendar to see all scheduled tours
6. **Stay Synced**: Data auto-refreshes or click refresh for instant updates

## 🔧 Technical Details

- **Framework**: Next.js 14 with App Router
- **Database**: Vercel KV (Redis) for shared data
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Deployment**: Optimized for Vercel with shared storage
- **Real-time Sync**: Auto-refresh every 30 seconds

## 📋 Environment Setup

Vercel KV environment variables are automatically configured when you add the database:
- `KV_URL`
- `KV_REST_API_URL` 
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## 🎯 Perfect For

- 👫 **Couples** looking for rental properties together
- 🏠 **Real estate hunting** with shared progress tracking
- 📅 **Tour coordination** between partners
- 💌 **Collaborative outreach** management
- 🔄 **Real-time collaboration** on property decisions

## 🌟 Shared Data Benefits

- **📊 One Source of Truth**: All properties in shared database
- **⚡ Instant Updates**: Changes appear immediately for both users
- **🔄 Auto-Sync**: Refreshes every 30 seconds automatically
- **👥 Collaborative**: Perfect for decision-making together
- **📱 Multi-Device**: Works on phones, tablets, and computers

---
