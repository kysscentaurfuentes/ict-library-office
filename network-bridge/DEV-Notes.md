# Network Bridge Git Sync Guide

## Purpose

Ginagamit ang GitHub repository na:

https://github.com/kysscentaurfuentes/network-bridge.git

bilang tulay para magpasa ng code sa pagitan ng NEW COMPUTER at OLD COMPUTER.

Flow:

NEW COMPUTER
→ GitHub (network-bridge)
→ OLD COMPUTER

Ang NEW COMPUTER ang source of truth. Kapag may bagong code sa NEW COMPUTER, ito ang itutulak sa GitHub at hihilahin ng OLD COMPUTER.

---

## Verify Current Repository

Laging i-check muna kung anong repository ang nakakabit bago mag-push.

```powershell
git remote -v
```

Expected:

```text
origin  https://github.com/kysscentaurfuentes/network-bridge.git (fetch)
origin  https://github.com/kysscentaurfuentes/network-bridge.git (push)
```

Kapag ibang URL ang lumabas (hal. ict-library-office.git), maling repository ang mapu-push.

---

## Push Latest Code From NEW COMPUTER

Check changes:

```powershell
git status
```

Stage files:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Describe changes here"
```

Push:

```powershell
git push origin main
```

Kung gusto na ang local copy ang masunod at i-overwrite ang nasa GitHub:

```powershell
git push origin main --force
```

---

## Pull Latest Code On OLD COMPUTER

Normal update:

```powershell
git pull origin main
```

---

## If Pull Fails With:

```text
fatal: refusing to merge unrelated histories
```

Ibig sabihin magkaiba ang history ng local repository at GitHub repository.

Gawing eksaktong kopya ng GitHub ang OLD COMPUTER:

```powershell
git fetch origin
git reset --hard origin/main
git clean -fd
```

WARNING:

`git clean -fd` ay magbubura ng untracked files/folders.

---

## Check Current Branch

```powershell
git branch
```

Expected:

```text
* main
```

---

## Check Recent Commits

```powershell
git log --oneline -10
```

---

## Full Workflow

### NEW COMPUTER

```powershell
git status
git add .
git commit -m "Update network bridge"
git push origin main
```

### OLD COMPUTER

```powershell
git fetch origin
git reset --hard origin/main
```

---

## Internet Requirement

Requires Internet:

```powershell
git push origin main
git pull origin main
git fetch origin
git clone <repo>
```

Does NOT Require Internet:

```powershell
git status
git add .
git commit -m "message"
git log
git branch
git remote -v
```

---

## Emergency Recovery

If the repository becomes messy or out of sync:

```powershell
git fetch origin
git reset --hard origin/main
git clean -fd
```

This forces the local repository to become an exact copy of GitHub.