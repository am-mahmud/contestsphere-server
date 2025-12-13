# ContestSphere

**ContestSphere** is a modern, full-stack web platform that empowers creative and technical talents to showcase their skills, compete in exciting contests, and earn rewards. Our mission is to provide a global community where participants can challenge themselves, build their portfolios, and connect with like-minded individuals.

---

## 🌐 Live Site URL

**Frontend:** https://contestsphere-client.vercel.app

**Backend API:** https://contestsphere-server.vercel.app

**Github Client Repo:** https://github.com/am-mahmud/contestsphere-client

**Github Server Repo:** https://github.com/am-mahmud/contestsphere-server

---

## ✨ Website Features

✅ **Advanced Contest Search & Filtering**
- Real-time search across contest names, descriptions,types and filter by  categories 
- Sort by popularity, deadline, and newest first
- Instant search results with pagination

✅ **Secure Stripe Payment Integration**
- Safe and encrypted payment processing for contest registration
- Support for multiple payment methods (Credit Cards, Debit Cards, Digital Wallets)

✅ **Complete User Authentication System**
- Firebase authentication with email/password login
- Role-based access control (User, Creator, Admin)
- Secure profile management with photo uploads
- Session persistence and auto-logout

✅ **Contest Management System**
- Create, edit, and manage contests as a creator
- Admin approval workflow for contest validation
- Track contest status (Pending, Confirmed, Rejected)
- Real-time participant counter and deadline countdown

✅ **Global Leaderboard & Rankings**
- Live leaderboard showing top performers worldwide
- Track user rankings based on contest wins
- Display earnings and achievement badges
- Filter leaderboard by contest type

✅ **Seamless Contest Participation**
- One-click contest registration with Stripe payment
- Submit task solutions through user-friendly interface
- View submission status and contest results

✅ **Dark Mode & Theme Switching**
- Full dark mode implementation across entire platform
- One-click theme toggle (Light/Dark)
- Persistent theme preference using localStorage
- Smooth transitions between themes

✅ **Fully Responsive Mobile Design**
- Mobile-first approach with responsive layout
- Touch-optimized navigation and buttons
- Fast loading on slow internet connections
- Optimized for all screen sizes 

✅ **Newsletter Section**
- Subscribe to contest announcements
- Weekly updates on new contests
- Winner announcements and success stories
- Unsubscribe anytime with one click

✅ **Comprehensive Documentation & Support**
- "How to Use" guide with step-by-step tutorials
- Contact form with direct support team access

✅ **High Performance & Optimization**
- Lightning-fast page loads with Vite
- Lazy loading and image optimization
- React Query for smart data caching
- Server-side pagination for scalability
- Minified and optimized build for production

---

## 🛠️ Technology Stack

### Frontend Technologies
- **React 19** - Modern UI library with hooks
- **Vite 7** - Next-generation build tool
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5** - Beautiful component library
- **React Router 7** - Client-side routing
- **React Query 5** - Server state management
- **React Hook Form 7** - Form validation
- **Firebase 12** - Authentication & backend
- **Stripe React** - Payment gateway integration
- **Recharts 3** - Data visualization
- **React Icons 5** - Icon components
- **SweetAlert2** - Beautiful alerts
- **Axios** - HTTP client

### Development Tools
- **Vite** - Ultra-fast build tool
- **Tailwind CSS Vite Plugin** - CSS optimization
- **ESLint** - Code linting
- **Node.js 18+** - Runtime

---

## 📋 Requirements

Before installation, ensure you have:
- Node.js v18 or higher
- npm or yarn package manager
- Git installed
- Code editor (VS Code recommended)
- Vercel account for deployment (optional)

---

## 🚀 Installation Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/contestsphere-client.git
cd contestsphere-client
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create `.env` file in root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_AUTH_DOMAIN=contestsphere.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=contestsphere
VITE_FIREBASE_STORAGE_BUCKET=contestsphere.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=https://contestsphere-server.vercel.app
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser

### Step 5: Build for Production
```bash
npm run build
```

### Step 6: Preview Production Build
```bash
npm run preview
```

---

## 🔑 Main Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with contests showcase |
| All Contests | `/allcontests` | Browse and search all contests |
| Contest Details | `/contest/:id` | Full contest information |
| Leaderboard | `/leaderboard` | Global rankings |
| Dashboard | `/dashboard` | User profile & settings |
| My Contests | `/dashboard/my-contests` | Creator's contests |
| Add Contest | `/dashboard/add-contest` | Create new contest |
| Edit Contest | `/dashboard/edit-contest/:id` | Edit contest details |
| Documentation | `/documentation` | How to use guide |
| About | `/about` | About ContestSphere |
| Contact | `/contact` | Contact support |
| Login | `/login` | User login |
| Register | `/register` | New user registration |

---

## 🔐 Authentication

### Firebase Authentication
- Email/Password signup and login
- Session management with JWT tokens
- Automatic logout on session expiry
- Password reset functionality
- Role-based access control

### User Roles
- **User** - Can participate in contests
- **Creator** - Can create and manage contests
- **Admin** - Can approve/reject contests and manage platform

---

## 💳 Payment Integration

### Stripe Payment Gateway
- PCI compliant payment processing
- Multiple payment methods supported
- Real-time transaction verification
- Automatic receipt generation
- Payment history tracking

### Test Mode
- **Test Card:** 4242 4242 4242 4242
- **Expiry:** Any future date
- **CVC:** Any 3-digit number

---

## 🚨 Troubleshooting

### Issue: Node modules not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Vite port already in use
```bash
npm run dev -- --port 3000
```

### Issue: Firebase auth not working
- Verify `.env` variables are correct
- Check Firebase project settings
- Clear browser cache and cookies

### Issue: Stripe payment failing
- Verify Stripe keys in `.env`
- Check browser console for errors
- Use test card for development

---

## 📱 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy (automatic on push)

---

## 👥 Developer 

**ContestSphere** is built by a passionate developer and designer Asif Mahmud.

---

## 🔮 Future Roadmap

- [ ] Native mobile app (iOS & Android)
- [ ] AI-powered contest recommendations
- [ ] Live streaming for announcements
- [ ] Community forums and discussions
- [ ] Public API for integrations
- [ ] Advanced analytics dashboard
- [ ] Contest collaboration features
- [ ] Blockchain-based certificates