"""
Data Import Utility
Convert various data formats to CSV for model training
"""

import pandas as pd
import numpy as np
from pathlib import Path


class DataImporter:
    """
    Import and convert dataset formats
    """
    
    @staticmethod
    def from_excel(excel_path, sheet_name=0, output_csv='leprosy_dataset.csv'):
        """
        Import data from Excel file
        
        Args:
            excel_path: Path to Excel file
            sheet_name: Sheet name or index
            output_csv: Output CSV path
        """
        print(f"Loading Excel file: {excel_path}")
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        print(f"Loaded {len(df)} rows")
        df.to_csv(output_csv, index=False)
        print(f"Saved to {output_csv}")
        return df
    
    @staticmethod
    def from_csv(csv_path, output_path=None):
        """Import CSV file"""
        print(f"Loading CSV file: {csv_path}")
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} rows")
        if output_path:
            df.to_csv(output_path, index=False)
        return df
    
    @staticmethod
    def from_json(json_path, output_csv='leprosy_dataset.csv'):
        """Import JSON file"""
        print(f"Loading JSON file: {json_path}")
        df = pd.read_json(json_path)
        print(f"Loaded {len(df)} rows")
        df.to_csv(output_csv, index=False)
        print(f"Saved to {output_csv}")
        return df
    
    @staticmethod
    def merge_files(file_list, output_csv='leprosy_dataset_merged.csv'):
        """
        Merge multiple data files
        
        Args:
            file_list: List of file paths
            output_csv: Output CSV path
        """
        dfs = []
        
        for file_path in file_list:
            print(f"Loading {file_path}...")
            if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                df = pd.read_excel(file_path)
            elif file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.json'):
                df = pd.read_json(file_path)
            else:
                print(f"Unsupported format: {file_path}")
                continue
            
            dfs.append(df)
            print(f"  Loaded {len(df)} rows")
        
        print(f"Merging {len(dfs)} files...")
        merged_df = pd.concat(dfs, ignore_index=True)
        print(f"Total rows: {len(merged_df)}")
        
        merged_df.to_csv(output_csv, index=False)
        print(f"Saved merged data to {output_csv}")
        return merged_df
    
    @staticmethod
    def validate_dataset(csv_path):
        """
        Validate dataset for model training
        
        Args:
            csv_path: Path to CSV file
        """
        df = pd.read_csv(csv_path)
        
        print("\n" + "="*60)
        print("DATASET VALIDATION REPORT")
        print("="*60)
        
        print(f"\nDataset Shape: {df.shape}")
        print(f"Total Samples: {len(df)}")
        print(f"Total Features: {len(df.columns)}")
        
        print(f"\nColumns: {list(df.columns)}")
        print(f"\nData Types:\n{df.dtypes}")
        
        print(f"\nMissing Values:")
        missing = df.isnull().sum()
        if missing.sum() > 0:
            print(missing[missing > 0])
        else:
            print("  No missing values ✓")
        
        print(f"\nDuplicate Rows: {df.duplicated().sum()}")
        
        print(f"\nNumeric Columns Summary:")
        print(df.describe())
        
        print(f"\nCategorical Columns:")
        for col in df.select_dtypes(include=['object']).columns:
            print(f"  {col}: {df[col].nunique()} unique values")
        
        # Check for target column
        if 'leprosy_type' in df.columns:
            print(f"\n✓ Target column 'leprosy_type' found")
            print(f"  Class distribution:\n{df['leprosy_type'].value_counts()}")
        else:
            print(f"\n⚠ Target column 'leprosy_type' not found")
            print(f"  Available columns: {list(df.columns)}")
        
        print("\n" + "="*60)
        return df


def quick_import():
    """
    Interactive data import wizard
    """
    print("\n" + "="*60)
    print("DATA IMPORT WIZARD")
    print("="*60)
    
    print("\nWhat file format do you have?")
    print("1. Excel (.xlsx, .xls)")
    print("2. CSV (.csv)")
    print("3. JSON (.json)")
    print("4. Multiple files (merge)")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        filepath = input("Enter Excel file path: ").strip()
        output = input("Output CSV path (default: leprosy_dataset.csv): ").strip() or 'leprosy_dataset.csv'
        DataImporter.from_excel(filepath, output_csv=output)
    
    elif choice == '2':
        filepath = input("Enter CSV file path: ").strip()
        output = input("Output CSV path (default: same): ").strip() or filepath
        DataImporter.from_csv(filepath, output_path=output)
    
    elif choice == '3':
        filepath = input("Enter JSON file path: ").strip()
        output = input("Output CSV path (default: leprosy_dataset.csv): ").strip() or 'leprosy_dataset.csv'
        DataImporter.from_json(filepath, output_csv=output)
    
    elif choice == '4':
        files = []
        print("Enter file paths (enter blank line to finish):")
        while True:
            filepath = input(f"File {len(files)+1}: ").strip()
            if not filepath:
                break
            files.append(filepath)
        
        if files:
            output = input("Output CSV path (default: leprosy_dataset_merged.csv): ").strip() or 'leprosy_dataset_merged.csv'
            DataImporter.merge_files(files, output_csv=output)
    
    else:
        print("Invalid choice!")
        return
    
    # Validate
    print("\nValidating dataset...")
    print("-"*60)
    DataImporter.validate_dataset(output if choice in ['1', '4'] else (output if choice in ['2', '3'] else filepath))


if __name__ == '__main__':
    print("\nData Import Utility for Leprosy Prediction Model")
    print("="*60)
    
    import sys
    
    if len(sys.argv) > 1:
        # Command line usage
        if sys.argv[1] == 'validate':
            DataImporter.validate_dataset(sys.argv[2])
        elif sys.argv[1] == 'excel':
            DataImporter.from_excel(sys.argv[2])
        elif sys.argv[1] == 'csv':
            DataImporter.from_csv(sys.argv[2])
        else:
            print("Usage:")
            print("  python data_importer.py validate <csv_path>")
            print("  python data_importer.py excel <excel_path>")
            print("  python data_importer.py csv <csv_path>")
    else:
        # Interactive mode
        quick_import()
