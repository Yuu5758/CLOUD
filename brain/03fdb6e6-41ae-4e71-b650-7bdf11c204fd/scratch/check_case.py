import os
import re

base_dir = r"c:\Users\RADITYA\Documents\CLOUD\backend\crates\ecstore\src"

def check_dir(dir_path):
    try:
        entries = os.listdir(dir_path)
    except OSError:
        return
    for entry in entries:
        full_path = os.path.join(dir_path, entry)
        if os.path.isdir(full_path):
            check_dir(full_path)
        elif entry.endswith(".rs"):
            check_file(full_path, entries)

def check_file(file_path, sibling_entries):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Strip single line comments
    content_no_comments = re.sub(r'//.*', '', content)
    # Strip block comments
    content_no_comments = re.sub(r'/\*.*?\*/', '', content_no_comments, flags=re.DOTALL)

    matches = re.findall(r'(?:^|[^a-zA-Z0-9_])(?:pub\s+)?mod\s+([a-zA-Z0-9_]+)\s*;', content_no_comments)
    
    file_name = os.path.basename(file_path)
    if file_name == "mod.rs" or file_name == "lib.rs":
        sub_dir = os.path.dirname(file_path)
    else:
        sub_dir = os.path.join(os.path.dirname(file_path), file_name[:-3])

    sub_entries = []
    if os.path.isdir(sub_dir):
        sub_entries = os.listdir(sub_dir)

    for mod_name in matches:
        if mod_name in ["tests", "test"]:
            continue
        
        expected_file = f"{mod_name}.rs"
        expected_dir = mod_name
        
        if file_name in ["lib.rs", "mod.rs"]:
            if expected_file in sibling_entries or expected_dir in sibling_entries:
                pass
            else:
                print(f"ERROR: Sibling mod '{mod_name}' declared in {file_path} not found case-sensitively in {os.path.dirname(file_path)}")
        else:
            if expected_file in sub_entries or expected_dir in sub_entries:
                pass
            else:
                print(f"ERROR: Sub-mod '{mod_name}' declared in {file_path} not found case-sensitively in {sub_dir}")

print("Starting case-sensitivity check...")
check_dir(base_dir)
print("Finished check.")
