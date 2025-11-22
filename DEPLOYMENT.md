# 🚀 Deployment Instructions for Communiatec

## The "Golden Rule" of Deployment

**ALWAYS deploy by pushing to GitHub.**
Do NOT try to build the frontend manually on the server.

## Why?

Our AWS EC2 instance (`t3.micro`) has 1GB of RAM. The React build process requires ~2GB+.
Building on the server will cause it to crash (CPU credits exhausted, Disk thrashing).

## How to Deploy (The Right Way)

1.  Make your changes locally.
2.  Commit and push to the `master` branch:
    ```bash
    git add .
    git commit -m "feat: amazing new feature"
    git push origin master
    ```
3.  **Relax.** GitHub Actions will:
    - Build the React app on a powerful cloud runner.
    - Compress the files.
    - Securely transfer them to your EC2 instance.
    - Restart the server automatically.

## How to Monitor

- **Check Build Status:** Go to the "Actions" tab in your GitHub Repository.
- **Check Server Logs:**
  ```bash
  ssh ubuntu@<your-ec2-ip>
  pm2 logs
  ```

## Emergency / Manual Updates

If you are on the server and run `scripts/update-app.sh`:

- It will **ONLY** update the Backend code (Node.js).
- It will **SKIP** the Frontend build to prevent a crash.
- It will restart the server.

## Architecture Overview

[Local Dev] -> (git push) -> [GitHub Actions] -> (Build & Compress) -> [EC2 Server]
