import os
import sys
import pandas as pd

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from app.services.data_loader import data_loader
from app.services.data_cleaner import data_cleaner

def main():
    raw_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "raw"))
    proc_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed"))
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(proc_dir, exist_ok=True)

    synthetic_records = data_loader.generate_synthetic_dataset(num_records=1250)
    
    # Raw dataframe
    raw_df = pd.DataFrame(synthetic_records)
    # Format skills as comma separated string for CSV export
    raw_df["skills"] = raw_df["skills"].apply(lambda x: ", ".join(x) if isinstance(x, list) else str(x))
    raw_csv_path = os.path.join(raw_dir, "sample_jobs.csv")
    raw_df.to_csv(raw_csv_path, index=False, encoding="utf-8")

    # Processed cleaned dataframe
    cleaned_records = [data_cleaner.clean_and_normalize_record(r) for r in synthetic_records]
    cleaned_df = pd.DataFrame(cleaned_records)
    cleaned_df["skills"] = cleaned_df["skills"].apply(lambda x: ", ".join(x) if isinstance(x, list) else str(x))
    proc_csv_path = os.path.join(proc_dir, "cleaned_jobs.csv")
    cleaned_df.to_csv(proc_csv_path, index=False, encoding="utf-8")

    sys.stdout.buffer.write(b"Successfully exported sample raw and processed datasets.\n")

if __name__ == "__main__":
    main()
