import os
import json
import argparse
import subprocess
from datetime import datetime
from github import Github
from dotenv import load_dotenv
from time import sleep
from typing import Dict, Any

# === Load .env or CLI ===
load_dotenv()
parser = argparse.ArgumentParser()
parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN"))
parser.add_argument("--src_repo", default=os.getenv("SRC_REPO"))
parser.add_argument("--dst_repo", default=os.getenv("DST_REPO"))
parser.add_argument("--local_path", default=os.getenv("LOCAL_REPO_PATH"))
parser.add_argument("--prefix", default=os.getenv("BRANCH_PREFIX", "imported-pr"))
parser.add_argument("--base", default=os.getenv("BASE_BRANCH", "main"))
parser.add_argument("--issue_label", default=os.getenv("ISSUE_LABEL", "imported-from-upstream"))
parser.add_argument("--state_file", default=os.getenv("STATE_FILE", "import_state.json"))
parser.add_argument("--dry-run", action="store_true", help="Only show what would be imported without actually importing")
parser.add_argument("--sync-only", action="store_true", help="Only sync states without importing new items")
parser.add_argument("--import-issues", action="store_true", help="Import issues (default: False)")
parser.add_argument("--import-prs", action="store_true", help="Import pull requests (default: True)")
parser.add_argument("--max-retries", type=int, default=3, help="Maximum number of retries for API calls (default: 3)")
parser.add_argument("--interactive", action="store_true", help="Show PR details and ask for confirmation before creating")
args = parser.parse_args()

# === Connect to GitHub ===
g = Github(args.token)
src = g.get_repo(args.src_repo)
dst = g.get_repo(args.dst_repo)

# === Shell helper ===
def run(cmd, cwd=None, timeout=60):
    """Run a command with timeout and error handling"""
    print(f"\nExecuting: {cmd}")
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            timeout=timeout
        )
        if result.returncode != 0:
            error_msg = f"Command failed with exit code {result.returncode}\nError: {result.stderr}"
            print(f"[ERROR] {error_msg}")
            raise Exception(error_msg)
        print("Command completed successfully")
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print(f"[ERROR] Command timed out after {timeout} seconds")
        raise Exception(f"Command timed out: {cmd}")
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        raise
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise

# === State Management ===
def load_state():
    if os.path.exists(args.state_file):
        with open(args.state_file, 'r') as f:
            state = json.load(f)
            # Ensure error tracking exists in loaded state
            if 'errors' not in state:
                state['errors'] = {'issues': {}, 'prs': {}}
            return state
    return {
        'last_run': None,
        'imported_issues': {},  # {src_issue_num: {'dst_num': X, 'state': 'open/closed'}}
        'imported_prs': {},     # {src_pr_num: {'dst_num': X, 'state': 'open/closed/merged'}}
        'errors': {
            'issues': {},  # {src_issue_num: {'error': 'error message', 'timestamp': 'ISO timestamp'}}
            'prs': {}      # {src_pr_num: {'error': 'error message', 'timestamp': 'ISO timestamp'}}
        }
    }

def save_state(state):
    state['last_run'] = datetime.now().isoformat()
    with open(args.state_file, 'w') as f:
        json.dump(state, f, indent=2)
    print(f"State file updated: {args.state_file}")

# === Verify Existing Imports ===
def scan_all_existing_imports():
    """Scan destination repo for all previously imported issues/PRs"""
    print("\n== Scanning Destination Repo for All Imported Items ==")
    
    imported_issues = {}
    imported_prs = {}
    
    # Scan all issues (both open and closed) only if we're importing issues
    if args.import_issues:
        for issue in dst.get_issues(state='all'):
            if issue.pull_request:  # Skip PRs, they'll be handled in PR section
                continue
            # Check if this is an imported issue by looking for the import marker in body
            if issue.body and f"**Imported from [{args.src_repo}#" in issue.body:
                # Extract source issue number from the import marker
                import_line = issue.body.split('\n')[0]
                src_num = import_line.split('#')[1].split(']')[0]
                imported_issues[src_num] = {
                    'dst_num': issue.number,
                    'state': issue.state
                }
                print(f"Found imported issue: src #{src_num} -> dst #{issue.number} ({issue.state})")
    
    # Scan all PRs (both open and closed)
    if args.import_prs:
        for pr in dst.get_pulls(state='all'):
            if pr.body and f"**Imported from [{args.src_repo}#" in pr.body:
                import_line = pr.body.split('\n')[0]
                src_num = import_line.split('#')[1].split(']')[0]
                imported_prs[src_num] = {
                    'dst_num': pr.number,
                    'state': pr.state
                }
                print(f"Found imported PR: src #{src_num} -> dst #{pr.number} ({pr.state})")
    
    return imported_issues, imported_prs

def verify_imports(state):
    """Verify all imported items exist and update their states"""
    print("\n== Verifying Existing Imports ==")
    
    # First scan for all existing imports
    try:
        found_issues, found_prs = scan_all_existing_imports()
        
        # Update state with found items
        state['imported_issues'].update(found_issues)
        state['imported_prs'].update(found_prs)
    except Exception as e:
        print(f"❌ Failed to scan existing imports: {str(e)}")
        return state
    
    # Track items to remove from state
    issues_to_remove = []
    prs_to_remove = []
    
    # Check all issues in state
    if args.import_issues:
        for src_num, details in state['imported_issues'].items():
            if src_num in state['errors']['issues']:
                print(f"⚠ Skipping issue #{src_num} due to previous error: {state['errors']['issues'][src_num]['error']}")
                continue
            
            try:
                src_issue = src.get_issue(int(src_num))
                try:
                    dst_issue = dst.get_issue(details['dst_num'])
                    print(f"✓ Issue #{src_num} -> #{details['dst_num']} exists ({src_issue.state})")
                    if src_issue.state != details['state']:
                        details['state'] = src_issue.state
                        if not args.dry_run and src_issue.state == "closed" and dst_issue.state != "closed":
                            dst_issue.edit(state="closed")
                            print(f"  Closed destination issue to match source")
                except Exception as e:
                    print(f"⚠ Destination issue #{details['dst_num']} not found: {str(e)}")
                    issues_to_remove.append(src_num)
            except Exception as e:
                print(f"⚠ Error processing issue #{src_num}: {str(e)}")
                state['errors']['issues'][src_num] = {
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }
    
    # Check all PRs in state
    if args.import_prs:
        for src_num, details in state['imported_prs'].items():
            if src_num in state['errors']['prs']:
                print(f"⚠ Skipping PR #{src_num} due to previous error: {state['errors']['prs'][src_num]['error']}")
                continue
            
            try:
                src_pr = src.get_pull(int(src_num))
                try:
                    dst_pr = dst.get_pull(details['dst_num'])
                    print(f"✓ PR #{src_num} -> #{details['dst_num']} exists ({src_pr.state})")
                    if src_pr.state != details['state']:
                        details['state'] = src_pr.state
                        if not args.dry_run and src_pr.state == "closed" and dst_pr.state != "closed":
                            dst_pr.edit(state="closed")
                            print(f"  Closed destination PR to match source")
                except Exception as e:
                    print(f"⚠ Destination PR #{details['dst_num']} not found: {str(e)}")
                    prs_to_remove.append(src_num)
            except Exception as e:
                print(f"⚠ Error processing PR #{src_num}: {str(e)}")
                state['errors']['prs'][src_num] = {
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }
    
    # Remove invalid entries
    for num in issues_to_remove:
        del state['imported_issues'][num]
        print(f"Removed invalid issue #{num} from state")
    for num in prs_to_remove:
        del state['imported_prs'][num]
        print(f"Removed invalid PR #{num} from state")
    
    save_state(state)
    return state

# === Sync Issue/PR States ===
def sync_item_state(src_item, dst_item, state_dict, src_num):
    """Sync state between source and destination items"""
    if src_item.state != dst_item.state:
        if not args.dry_run:
            if src_item.state == "closed":
                dst_item.edit(state="closed")
                print(f"  Closed destination item to match source")
            state_dict[src_num]['state'] = src_item.state
        else:
            print(f"  Would update destination state to: {src_item.state}")

# === Find New Items to Import ===
def find_new_items():
    """Find items that need to be imported"""
    new_issues = []
    new_prs = []
    
    print("\n== Scanning for New Items ==")
    
    # Check for new issues
    if args.import_issues:
        for issue in src.get_issues(state="open"):
            if issue.pull_request:
                continue
            if str(issue.number) not in state['imported_issues'] and str(issue.number) not in state['errors']['issues']:
                new_issues.append(issue)
                print(f"Found new issue #{issue.number}: {issue.title}")
    
    # Check for new PRs
    if args.import_prs:
        for pr in src.get_pulls(state="open"):
            if str(pr.number) not in state['imported_prs'] and str(pr.number) not in state['errors']['prs']:
                new_prs.append(pr)
                print(f"Found new PR #{pr.number}: {pr.title}")
    
    return new_issues, new_prs

# === Helper Functions ===
def confirm_pr_creation(pr_details: Dict[str, str]) -> bool:
    """Show PR details and ask for confirmation"""
    print("\n=== Pull Request Details ===")
    print(f"Source Repository: {pr_details['source_repo']}")
    print(f"Target Repository: {pr_details['target_repo']}")
    print(f"Source Branch: {pr_details['source_branch']}")
    print(f"Target Branch: {pr_details['target_branch']}")
    print(f"Title: {pr_details['title']}")
    print(f"Owner: {pr_details['owner']}")
    print("\nFull PR will be created as:")
    print(f"{pr_details['owner']}/{pr_details['repo_name']}:{pr_details['target_branch']} <- {pr_details['owner']}/{pr_details['repo_name']}:{pr_details['source_branch']}")
    
    if args.dry_run:
        print("\nDRY RUN - Would create this PR")
        return False
    
    if not args.interactive:
        return True
    
    while True:
        response = input("\nCreate this PR? [y/n]: ").lower().strip()
        if response in ['y', 'yes']:
            return True
        if response in ['n', 'no']:
            return False
        print("Please answer 'y' or 'n'")

# === Main Process ===
print(f"Mode: {'DRY RUN - no changes will be made' if args.dry_run else 'LIVE RUN'}")
print(f"Import targets: {' issues' if args.import_issues else ''}{' PRs' if args.import_prs else ''}")
print(f"Maximum retries: {args.max_retries}")

# Load and verify state
state = load_state()
print(f"\nLast import run: {state['last_run'] or 'Never'}")

# Verify existing imports and update state
state = verify_imports(state)

if args.sync_only:
    print("\nSync-only mode - stopping here")
    exit(0)

# Find new items to import
new_issues, new_prs = find_new_items()

if args.dry_run:
    print(f"\nDry run summary:")
    print(f"Would import {len(new_issues)} new issues")
    print(f"Would import {len(new_prs)} new PRs")
    exit(0)

# === Import New Issues ===
print("\n== Importing New Issues ==")
for issue in new_issues:
    print(f"- Issue #{issue.number}: {issue.title}")
    
    title = issue.title
    body = f"""**Imported from [{args.src_repo}#{issue.number}](https://github.com/{args.src_repo}/issues/{issue.number})**

Original author: @{issue.user.login}

---

{issue.body or "*No original body*"}
"""
    labels = [args.issue_label] + [l.name for l in issue.labels]
    new_issue = dst.create_issue(title=title, body=body, labels=labels)
    
    # Add comments
    for comment in issue.get_comments():
        new_issue.create_comment(f"**Imported comment from @{comment.user.login}**\n\n{comment.body}")
    
    # Track in state
    state['imported_issues'][str(issue.number)] = {
        'dst_num': new_issue.number,
        'state': 'open'
    }
    save_state(state)

# === Import New Pull Requests ===
print("\n== Importing New Pull Requests ==")
for pr in new_prs:
    branch = f"{args.prefix}-{pr.number}"
    print(f"\n- Processing PR #{pr.number}: {pr.title}")
    
    try:
        # Extract owner and repo names
        dst_owner, dst_repo_name = args.dst_repo.split('/')
        
        # Prepare PR details first
        pr_details = {
            'source_repo': args.dst_repo,
            'target_repo': args.dst_repo,
            'source_branch': branch,
            'target_branch': args.base,
            'title': f"[Imported] {pr.title}",
            'owner': dst_owner,
            'repo_name': dst_repo_name
        }

        # Show details and get confirmation before git operations
        if not confirm_pr_creation(pr_details):
            print("Skipping PR creation")
            continue

        # Git operations with better error handling
        print(f"\nFetching PR #{pr.number} from original repo...")
        run(f"git fetch original pull/{pr.number}/head:{branch}", cwd=args.local_path, timeout=120)
        
        print(f"Pushing branch {branch} to fork...")
        run(f"git push origin {branch}", cwd=args.local_path, timeout=120)
        
        body = f"""**Imported from [{args.src_repo}#{pr.number}](https://github.com/{args.src_repo}/pull/{pr.number})**

Original author: @{pr.user.login}

---

{pr.body or "*No original body*"}
"""
        # Create PR against the fork's main branch
        print(f"\nCreating PR with following details:")
        print(f"Title: {pr_details['title']}")
        print(f"Head: {dst_owner}:{branch}")
        print(f"Base: {args.base}")
        print(f"In repository: {args.dst_repo}")
        
        try:
            new_pr = dst.create_pull(
                title=pr_details['title'],
                body=body,
                head=branch,  # Just use branch name since we're in the same repo
                base=args.base
            )
            print(f"✓ Created PR #{new_pr.number}")
            print(f"PR URL: {new_pr.html_url}")
            
            # PR comments
            print("\nAdding comments...")
            for comment in pr.get_issue_comments():
                new_pr.create_issue_comment(f"**Imported comment from @{comment.user.login}**\n\n{comment.body}")
            
            # PR reviews
            print("Adding reviews...")
            for review in pr.get_reviews():
                content = f"**Imported review by @{review.user.login}**\n\nState: {review.state}\n\n{review.body or '*No content*'}"
                new_pr.create_issue_comment(content)
            
            # Track in state
            state['imported_prs'][str(pr.number)] = {
                'dst_num': new_pr.number,
                'state': 'open'
            }
            save_state(state)
            print(f"✓ Successfully imported PR #{pr.number} as #{new_pr.number}")
            
        except Exception as e:
            print(f"\n❌ Failed to create PR. Error: {str(e)}")
            print("\nTrying alternative PR creation method...")
            try:
                # Alternative method using full reference
                new_pr = dst.create_pull(
                    title=pr_details['title'],
                    body=body,
                    head=f"{dst_owner}:{branch}",
                    base=args.base
                )
                print(f"✓ Created PR #{new_pr.number} using alternative method")
                print(f"PR URL: {new_pr.html_url}")
                
                # Continue with comments and reviews...
                print("\nAdding comments...")
                for comment in pr.get_issue_comments():
                    new_pr.create_issue_comment(f"**Imported comment from @{comment.user.login}**\n\n{comment.body}")
                
                print("Adding reviews...")
                for review in pr.get_reviews():
                    content = f"**Imported review by @{review.user.login}**\n\nState: {review.state}\n\n{review.body or '*No content*'}"
                    new_pr.create_issue_comment(content)
                
                # Track in state
                state['imported_prs'][str(pr.number)] = {
                    'dst_num': new_pr.number,
                    'state': 'open'
                }
                save_state(state)
                print(f"✓ Successfully imported PR #{pr.number} as #{new_pr.number}")
                
            except Exception as e2:
                print(f"\n❌ Both PR creation methods failed.")
                print(f"First error: {str(e)}")
                print(f"Second error: {str(e2)}")
                raise Exception("Failed to create PR using both methods")
        
    except Exception as e:
        print(f"❌ Failed to import PR #{pr.number}: {str(e)}")
        state['errors']['prs'][str(pr.number)] = {
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
        save_state(state)
        continue

print("\n✅ Import completed. State file updated.")

# Add new function to find orphaned PR branches
def find_orphaned_pr_branches():
    """Find branches that start with PR prefix but don't have associated PRs"""
    print("\n== Scanning for Orphaned PR Branches ==")
    
    # Get all branches that start with our PR prefix
    branches = run("git branch -r | grep origin/" + args.prefix, cwd=args.local_path).split('\n')
    branches = [b.strip().replace('origin/', '') for b in branches if b.strip()]
    
    # Get all existing PRs
    existing_prs = dst.get_pulls(state='all')
    pr_branches = set()
    for pr in existing_prs:
        if pr.head.ref.startswith(args.prefix):
            pr_branches.add(pr.head.ref)
    
    # Find orphaned branches
    orphaned = []
    for branch in branches:
        if branch not in pr_branches:
            print(f"Found orphaned branch: {branch}")
            # Extract PR number from branch name
            try:
                pr_num = branch.replace(f"{args.prefix}-", "")
                orphaned.append((branch, pr_num))
            except:
                print(f"Could not extract PR number from branch: {branch}")
    
    return orphaned

# Add orphaned PR handling to main process
# Add this right after loading state and before verifying imports
print("\n== Checking for Orphaned PR Branches ==")
if args.import_prs:
    try:
        orphaned_branches = find_orphaned_pr_branches()
        if orphaned_branches:
            print(f"\nFound {len(orphaned_branches)} orphaned PR branches")
            for branch, pr_num in orphaned_branches:
                try:
                    # Get original PR to import
                    src_pr = src.get_pull(int(pr_num))
                    print(f"\nCreating PR for orphaned branch {branch} (original PR #{pr_num})")
                    
                    # Extract owner and repo names
                    dst_owner, dst_repo_name = args.dst_repo.split('/')
                    
                    # Prepare PR details
                    pr_details = {
                        'source_repo': args.dst_repo,
                        'target_repo': args.dst_repo,
                        'source_branch': branch,
                        'target_branch': args.base,
                        'title': f"[Imported] {src_pr.title}",
                        'owner': dst_owner,
                        'repo_name': dst_repo_name
                    }
                    
                    if args.interactive:
                        if not confirm_pr_creation(pr_details):
                            print("Skipping PR creation")
                            continue
                    
                    body = f"""**Imported from [{args.src_repo}#{pr_num}](https://github.com/{args.src_repo}/pull/{pr_num})**

Original author: @{src_pr.user.login}

---

{src_pr.body or "*No original body*"}
"""
                    # Create PR
                    new_pr = dst.create_pull(
                        title=pr_details['title'],
                        body=body,
                        head=branch,
                        base=args.base
                    )
                    print(f"✓ Created PR #{new_pr.number} for orphaned branch")
                    print(f"PR URL: {new_pr.html_url}")
                    
                    # Add comments and reviews
                    print("Adding comments...")
                    for comment in src_pr.get_issue_comments():
                        new_pr.create_issue_comment(f"**Imported comment from @{comment.user.login}**\n\n{comment.body}")
                    
                    print("Adding reviews...")
                    for review in src_pr.get_reviews():
                        content = f"**Imported review by @{review.user.login}**\n\nState: {review.state}\n\n{review.body or '*No content*'}"
                        new_pr.create_issue_comment(content)
                    
                    # Track in state
                    state['imported_prs'][pr_num] = {
                        'dst_num': new_pr.number,
                        'state': 'open'
                    }
                    save_state(state)
                    
                except Exception as e:
                    print(f"❌ Failed to create PR for orphaned branch {branch}: {str(e)}")
                    if not args.interactive:
                        continue
                    while True:
                        response = input(f"\nDelete orphaned branch {branch}? [y/n]: ").lower().strip()
                        if response in ['y', 'yes']:
                            try:
                                run(f"git push origin --delete {branch}", cwd=args.local_path)
                                print(f"Deleted orphaned branch {branch}")
                            except Exception as e:
                                print(f"Failed to delete branch: {str(e)}")
                            break
                        if response in ['n', 'no']:
                            break
                        print("Please answer 'y' or 'n'")
        else:
            print("No orphaned PR branches found")
    except Exception as e:
        print(f"❌ Failed to check for orphaned branches: {str(e)}")


