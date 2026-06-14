# CRITICAL: Regaining Control of iOS & Android App

## Executive Summary

The previous development team has abandoned the project. This guide outlines the **immediate steps required** to regain full control of the iLab Mobile Manager app on iOS and Android app stores, fix the backend infrastructure, and establish your own development workflow.

---

## 🔴 CRITICAL ACCESS - Secure These IMMEDIATELY

### Priority 1: App Store Developer Accounts

#### Apple App Store Connect
**URL:** https://appstoreconnect.apple.com

**Actions:**
1. Log in with your credentials
2. Change account password immediately
3. Remove old developer's access:
   - Users and Access → Remove former developers
4. Enable 2-Factor Authentication (2FA)
5. Download signing certificates & provisioning profiles:
   - Certificates, Identifiers & Profiles
   - Download all `.cer` and `.mobileprovision` files
   - Store securely (these control iOS app updates)

**Why critical:** Without these, you cannot submit iOS updates.

---

#### Google Play Console
**URL:** https://play.google.com/console

**Actions:**
1. Log in with your credentials
2. Change account owner email
3. Change password immediately
4. Remove former developers:
   - Settings → User and permissions → Remove users
5. Download the Upload Key (signing certificate):
   - Settings → App signing → Download upload key
   - This is your `.keystore` file - **do not lose it**
6. Store securely in password manager

**Why critical:** Without this keystore, you cannot submit Android updates to existing app.

---

### Priority 2: Signing Certificates & Keys

#### Android Keystore (.keystore file)

**Current location:** Unknown (check with former devs)

**What it does:**
- Digitally signs every APK/AAB before uploading to Play Store
- **Cannot be regenerated** — Google Play remembers which keystore signed your app
- If lost and you upload with different keystore → **New app required** → Users won't auto-update

**If you don't have it:**
```
CRITICAL: Request from old developers or you're forced to create new app
```

**Backup location:**
- Should be stored in: `android/app/` or secure drive
- Password should be documented

---

#### iOS Signing Certificate & Provisioning Profile

**Location:** From Apple Developer Account

**What they do:**
- Sign the iOS app for App Store submission
- Control which devices can test the app

**How to obtain:**
1. Go to Apple Developer Account → Certificates, Identifiers & Profiles
2. Download current certificates (`.cer` files)
3. Download provisioning profiles (`.mobileprovision` files)
4. Store in: `ios/` folder with passwords documented

---

### Priority 3: Firebase Account

**URL:** https://firebase.google.com/console

**Purpose:** Handles push notifications for the app

**Actions:**
1. Verify you have access to Firebase project
2. Download Firebase config files:
   - **Android config:** `android/app/google-services.json`
   - **iOS config:** `ios/GoogleService-Info.plist`
3. Store securely
4. Ensure these files are in the correct locations (they're in `.gitignore`, so not in GitHub)

**Verify both files exist:**
```bash
ls -la android/app/google-services.json
ls -la ios/GoogleService-Info.plist
```

If missing, request from old devs or regenerate from Firebase Console.

---

### Priority 4: Backend Infrastructure

**Current Domain:** `https://app.ilabassistant.com`

**Current Status:** SSL in progress / Inaccessible

**Actions:**

#### 4.1 Domain Registrar
Find where the domain is registered (GoDaddy, Namecheap, Route53, etc.):
1. Search WHOIS: https://whois.com
2. Login to registrar account
3. Change password
4. Verify domain ownership
5. Check renewal settings (don't let it expire)

#### 4.2 Hosting Provider / Server
Where is the backend actually hosted?
- AWS, DigitalOcean, Heroku, custom VPS, etc.

**Actions:**
1. Get access credentials
2. Fix SSL certificate (likely expired or misconfigured)
3. Get backend source code (if available)
4. Document server configuration

#### 4.3 SSL Certificate
**Problem:** "SSL in progress" indicates certificate issue

**Solutions:**
1. Use Let's Encrypt (free) — auto-renew
2. Purchase new certificate from provider
3. Contact hosting support to diagnose

**Command to check cert status:**
```bash
openssl s_client -connect app.ilabassistant.com:443 -showcerts
```

---

## 📋 Complete Access Checklist

```
ACCOUNTS & CREDENTIALS
[ ] Apple Developer Account access confirmed
[ ] Google Play Console access confirmed  
[ ] Firebase Console access confirmed
[ ] Domain Registrar access (WHOIS check)
[ ] Backend hosting provider access
[ ] GitHub repository access (private)

SIGNING MATERIALS
[ ] Android keystore file (.keystore) located & password known
[ ] iOS signing certificate (.cer) downloaded & stored
[ ] iOS provisioning profile (.mobileprovision) downloaded & stored
[ ] Firebase config files present:
    [ ] android/app/google-services.json
    [ ] ios/GoogleService-Info.plist

BACKEND INFRASTRUCTURE
[ ] Backend server status: [ ] Working [ ] Down [ ] SSL issues
[ ] SSL certificate: [ ] Valid [ ] Expired [ ] Needs renewal
[ ] Backend source code: [ ] Accessible [ ] Lost [ ] Unknown
[ ] Database access: [ ] Have credentials [ ] Lost access
[ ] Monitoring/Logs: [ ] Can access [ ] No access
```

---

## 🚨 Critical Scenarios & Solutions

### Scenario 1: Android Keystore is Lost

**Problem:** Cannot update existing app on Play Store with different keystore

**Solutions:**
- **A: Best** — Get keystore from old devs
- **B: Acceptable** — If keystore is truly lost & cannot be recovered:
  - Create NEW app on Play Store
  - Update app description to explain transition
  - Users see it as new app (manual download, no auto-update)
  - Keep old app up with notice: "Please download the new version"
  
**Prevention:** Never lose the keystore file again. Store in:
- Password manager (1Password, LastPass)
- Secure cloud storage (Google Drive, encrypted)
- Physical backup (printed or USB)

---

### Scenario 2: iOS Signing Certificate Expired

**Problem:** Cannot submit iOS updates

**Solution:**
1. Go to Apple Developer Account
2. Certificates, Identifiers & Profiles → Certificates
3. Revoke old certificate
4. Create new certificate
5. Download and install in Xcode
6. Update provisioning profiles

**Timeline:** ~5 minutes to fix

---

### Scenario 3: Backend Source Code Lost

**Problem:** Cannot modify backend, only operate existing instance

**Options:**
1. **Keep existing backend running** — Only fix infrastructure issues
2. **Rebuild from scratch** — 
   - Reverse-engineer API from frontend code
   - Use backend code if documented anywhere
   - Estimate: 2-4 weeks depending on complexity
3. **Use Backend-as-a-Service** — Firebase, Supabase, or other BaaS

---

### Scenario 4: Can't Contact Old Developers

**Workaround:**
- Check if they ever shared credentials in:
  - Email forwards
  - Project documents
  - Shared password managers
  - Company password vault
  - Insurance/compliance records (they may have stored backups)

---

## 📱 Immediate Next Steps (Today)

### Step 1: Verify All Access (1 hour)
```bash
# Create a checklist verification document:
- [ ] Apple App Store Connect — Can log in?
- [ ] Google Play Console — Can log in?
- [ ] Firebase — Can log in?
- [ ] GitHub repo — Can you push changes?
```

### Step 2: Secure Signing Materials (1 hour)
```bash
# Find these files:
find . -name "*.keystore" 2>/dev/null
find . -name "*.cer" 2>/dev/null
find . -name "*.mobileprovision" 2>/dev/null
find . -name "*google-services*" 2>/dev/null
find . -name "*GoogleService*" 2>/dev/null

# Store securely with passwords documented
```

### Step 3: Fix Backend Infrastructure (Ongoing)
```bash
# Check SSL status:
openssl s_client -connect app.ilabassistant.com:443 -showcerts

# Find hosting provider and gain access
# Fix SSL certificate
# Verify API responds:
curl https://app.ilabassistant.com/ApiForApp
```

### Step 4: Document Everything (1-2 hours)
Create a `CREDENTIALS_AND_ACCESS.md` file (NOT in GitHub) containing:
- All account URLs
- Username/password (encrypted)
- Backup codes (2FA)
- Signing certificate passwords
- Keystore password
- Server access details

---

## 📖 Development Workflow Going Forward

### Making Updates to the App

#### For iOS:
```bash
# 1. Make code changes in src/
# 2. Update version in Xcode (or Build Settings)
# 3. Build for release
xcodebuild -workspace ios/imobile.xcworkspace \
  -scheme imobile \
  -configuration Release

# 4. Archive in Xcode → Product → Archive
# 5. Upload to App Store Connect via Xcode
```

#### For Android:
```bash
# 1. Make code changes in src/
# 2. Update version in android/app/build.gradle
# 3. Build release bundle
cd android
./gradlew bundleRelease

# 4. Upload AAB to Google Play Console
# 5. Submit for review
```

### Testing Before Release:
```bash
# Install locally
npm run android
npm run ios

# Run tests
npm test

# Lint
npm run lint
```

---

## 🛡️ Security Recommendations

1. **Never share credentials** with unknown parties
2. **Use 2FA everywhere:**
   - Apple Developer Account
   - Google Play Console
   - Firebase
   - GitHub
3. **Store signing materials securely:**
   - Not in Git (keep in `.gitignore`)
   - Use password manager
   - Physical backup
4. **Limit app store access:**
   - Only add team members who need it
   - Regularly audit access logs
5. **Version control for docs:**
   - Track changes to deployment docs
   - Keep release notes in GitHub
   - Document all access changes

---

## 📞 Getting Help

### If You're Stuck On:

**Apple Developer Account Issues:**
- https://developer.apple.com/support/
- Apple Developer Relations email

**Google Play Issues:**
- Google Play Console Help: https://support.google.com/googleplay/
- Contact Play Support directly in Console

**Firebase Issues:**
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support Chat

**Backend/SSL Issues:**
- Your hosting provider's support
- Let's Encrypt community: https://community.letsencrypt.org/
- SSL Labs: https://www.ssllabs.com/ssltest/

---

## 📊 Status Tracking

Create a status board:

| Component | Status | Owner | Next Action | Deadline |
|-----------|--------|-------|-------------|----------|
| Apple App Store | [Check] | You | Verify access | Today |
| Google Play Store | [Check] | You | Verify access | Today |
| Backend API | Down (SSL) | You | Fix certificate | ASAP |
| Firebase | [Check] | You | Verify config | Today |
| Android Keystore | [Check] | You | Locate & secure | Today |
| iOS Certificates | [Check] | You | Download & store | Today |
| GitHub Repo | Uploaded | You | Keep updated | Ongoing |

---

## ✅ Success Criteria

Once you complete this guide, you should have:

✅ Full control of both app stores  
✅ All signing materials secure & backed up  
✅ Backend server running with valid SSL  
✅ Firebase push notifications working  
✅ Ability to deploy updates independently  
✅ Complete documentation of your infrastructure  
✅ Team members trained on deployment process  

---

## Next Document

See [APP_ARCHITECTURE_AND_UPDATES.md](APP_ARCHITECTURE_AND_UPDATES.md) for technical details on how the app works and deployment procedures.
