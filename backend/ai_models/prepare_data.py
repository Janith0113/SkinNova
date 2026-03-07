"""
Data Preparation Utility for Skin Cancer CNN
==============================================
Helper functions to organize and validate training data
"""

import os
import sys
import csv
import argparse
import shutil
from pathlib import Path
from collections import defaultdict


def validate_images(folder_path):
    """
    Validate all images in folder structure
    
    Args:
        folder_path: Path to data folder
        
    Returns:
        Validation report dict
    """
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    folder = Path(folder_path)
    
    report = {
        'total_files': 0,
        'valid_images': 0,
        'invalid_files': [],
        'class_distribution': defaultdict(int),
        'folder_structure': {}
    }
    
    print("Validating images...")
    
    for root, dirs, files in os.walk(folder):
        if root == str(folder):
            report['folder_structure']['root_files'] = len(files)
            for d in dirs:
                report['folder_structure'][d] = 0
        
        for file in files:
            file_path = Path(root) / file
            report['total_files'] += 1
            
            # Check extension
            if file_path.suffix.lower() not in valid_extensions:
                report['invalid_files'].append(str(file_path))
                continue
            
            # Check file size (should be > 100 bytes)
            if os.path.getsize(file_path) < 100:
                report['invalid_files'].append(f"{file_path} (corrupted/too small)")
                continue
            
            report['valid_images'] += 1
            
            # Track class if in subfolder
            class_name = Path(root).name
            if class_name != folder.name:
                report['class_distribution'][class_name] += 1
                if class_name in report['folder_structure']:
                    report['folder_structure'][class_name] += 1
    
    return report


def print_validation_report(report):
    """Print formatted validation report"""
    print("\n" + "="*60)
    print("VALIDATION REPORT")
    print("="*60)
    print(f"Total Files: {report['total_files']}")
    print(f"Valid Images: {report['valid_images']}")
    print(f"Invalid Files: {len(report['invalid_files'])}")
    
    if report['invalid_files']:
        print("\nInvalid Files:")
        for f in report['invalid_files'][:10]:  # Show first 10
            print(f"  - {f}")
        if len(report['invalid_files']) > 10:
            print(f"  ... and {len(report['invalid_files']) - 10} more")
    
    if report['class_distribution']:
        print("\nClass Distribution:")
        min_count = float('inf')
        max_count = 0
        for cls, count in report['class_distribution'].items():
            print(f"  {cls:20} {count:5} images")
            min_count = min(min_count, count)
            max_count = max(max_count, count)
        
        balance_ratio = max_count / min_count if min_count > 0 else 0
        print(f"\nBalance Ratio: {balance_ratio:.2f}:1")
        if balance_ratio > 2:
            print("⚠️  Classes are imbalanced! Consider collecting more data.")
        else:
            print("✓ Classes are well balanced")
    
    print("="*60)


def create_csv_from_folder(folder_path, output_file='labels.csv'):
    """
    Create CSV file from folder structure
    
    Args:
        folder_path: Path to data folder (with class subfolders)
        output_file: Output CSV filename
    """
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    folder = Path(folder_path)
    
    rows = []
    
    print(f"Scanning {folder_path}...")
    
    for class_folder in folder.iterdir():
        if not class_folder.is_dir():
            continue
        
        class_name = class_folder.name
        image_count = 0
        
        for ext in valid_extensions:
            images = list(class_folder.glob(f'*{ext}'))
            images.extend(list(class_folder.glob(f'*{ext.upper()}')))
            
            for img in images:
                rel_path = str(img.relative_to(folder))
                rows.append({'filename': rel_path, 'label': class_name})
                image_count += 1
        
        print(f"  {class_name}: {image_count} images")
    
    # Write CSV
    if rows:
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['filename', 'label'])
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"\n✓ Created {output_file} with {len(rows)} entries")
        return output_file
    else:
        print("No valid images found!")
        return None


def reorganize_flat_folder(source_folder, output_folder, labels_csv):
    """
    Reorganize flat folder of images with CSV labels into class subfolders
    
    Args:
        source_folder: Path to folder with all images
        output_folder: Path to output folder (will be created)
        labels_csv: Path to CSV with filename,label columns
    """
    source = Path(source_folder)
    output = Path(output_folder)
    output.mkdir(exist_ok=True)
    
    print(f"Reading labels from {labels_csv}...")
    
    # Read CSV
    labels = {}
    with open(labels_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            labels[row['filename']] = row['label']
    
    # Create class folders
    classes = set(labels.values())
    for cls in classes:
        class_folder = output / cls
        class_folder.mkdir(exist_ok=True)
    
    # Copy/move files
    print(f"Organizing {len(labels)} images...")
    successful = 0
    failed = 0
    
    for filename, label in labels.items():
        source_file = source / filename
        if not source_file.exists():
            print(f"  ✗ Not found: {filename}")
            failed += 1
            continue
        
        dest_file = output / label / source_file.name
        try:
            shutil.copy2(source_file, dest_file)
            successful += 1
        except Exception as e:
            print(f"  ✗ Error copying {filename}: {e}")
            failed += 1
    
    print(f"\n✓ Organized {successful} images")
    if failed > 0:
        print(f"✗ Failed to organize {failed} images")
    
    return output


def main():
    parser = argparse.ArgumentParser(
        description="Prepare data for skin cancer CNN training"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Validate command
    validate_parser = subparsers.add_parser('validate', 
                                           help='Validate image folder')
    validate_parser.add_argument('folder', help='Folder to validate')
    
    # Create CSV command
    csv_parser = subparsers.add_parser('csv', 
                                       help='Create CSV from folder structure')
    csv_parser.add_argument('folder', help='Folder with class subfolders')
    csv_parser.add_argument('--output', default='labels.csv',
                           help='Output CSV filename')
    
    # Reorganize command
    reorganize_parser = subparsers.add_parser('reorganize',
                                             help='Reorganize flat folder using CSV')
    reorganize_parser.add_argument('source', help='Source folder with all images')
    reorganize_parser.add_argument('--output', default='organized_data',
                                  help='Output folder')
    reorganize_parser.add_argument('--labels', required=True,
                                  help='CSV file with labels')
    
    args = parser.parse_args()
    
    if args.command == 'validate':
        if not os.path.isdir(args.folder):
            print(f"Error: Folder not found: {args.folder}")
            sys.exit(1)
        
        report = validate_images(args.folder)
        print_validation_report(report)
    
    elif args.command == 'csv':
        if not os.path.isdir(args.folder):
            print(f"Error: Folder not found: {args.folder}")
            sys.exit(1)
        
        create_csv_from_folder(args.folder, args.output)
    
    elif args.command == 'reorganize':
        if not os.path.isdir(args.source):
            print(f"Error: Source folder not found: {args.source}")
            sys.exit(1)
        
        if not os.path.exists(args.labels):
            print(f"Error: Labels file not found: {args.labels}")
            sys.exit(1)
        
        reorganize_flat_folder(args.source, args.output, args.labels)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    # Example usage if no arguments
    if len(sys.argv) == 1:
        print("Skin Cancer CNN - Data Preparation Utility")
        print("="*60)
        print("\nUsages:")
        print("\n1. Validate image folder:")
        print("   python prepare_data.py validate ./data")
        print("\n2. Create CSV from folder structure:")
        print("   python prepare_data.py csv ./data --output labels.csv")
        print("\n3. Reorganize flat folder using CSV:")
        print("   python prepare_data.py reorganize ./images \\")
        print("       --labels labels.csv --output organized_data")
        print("\n" + "="*60)
        sys.exit(0)
    
    main()
