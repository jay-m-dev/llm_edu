#!/usr/bin/env python3
import argparse
import csv
import os
import subprocess
import sys
import shutil


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create GitHub issues from a CSV file using the gh CLI."
    )
    parser.add_argument(
        "--csv",
        default="issues.csv",
        help="Path to CSV with headers: title,body (default: issues.csv).",
    )
    parser.add_argument(
        "--repo",
        default=None,
        help="Override target repo (e.g. owner/name). Defaults to gh's current repo.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print commands without creating issues.",
    )
    return parser.parse_args()


def gh_cmd(base_args, dry_run):
    if dry_run:
        print("DRY RUN:", " ".join(base_args))
        return 0
    if not shutil.which(base_args[0]):
        print(
            "Missing dependency: 'gh' CLI not found in PATH. "
            "Install from https://cli.github.com/ and authenticate with `gh auth login`.",
            file=sys.stderr,
        )
        return 127
    result = subprocess.run(base_args, check=False)
    return result.returncode


def main():
    args = parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV not found: {args.csv}", file=sys.stderr)
        return 1

    with open(args.csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        missing = {"title", "body"} - set(reader.fieldnames or [])
        if missing:
            print(
                f"CSV missing required headers: {', '.join(sorted(missing))}",
                file=sys.stderr,
            )
            return 1

        for row_num, row in enumerate(reader, start=2):
            title = (row.get("title") or "").strip()
            body = (row.get("body") or "").strip()

            if not title:
                print(f"Row {row_num}: missing title; skipping.", file=sys.stderr)
                continue

            cmd = ["gh", "issue", "create", "--title", title, "--body", body]
            if args.repo:
                cmd.extend(["--repo", args.repo])

            rc = gh_cmd(cmd, args.dry_run)
            if rc != 0:
                print(f"Row {row_num}: gh command failed with code {rc}", file=sys.stderr)
                return rc

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
