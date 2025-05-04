import pandas as pd

# Define the file path (assuming it's in the same folder)
file_path = "professors_final_combined2.csv"

# Load the CSV
df = pd.read_csv(file_path)

# Define mapping from informal/abbreviated to full university names
school_name_mapping = {
    "CMU": "Carnegie Mellon University",
    "Brown": "Brown University",
    "Penn": "University of Pennsylvania",
    "MIT": "Massachusetts Institute of Technology",
    "Stanford": "Stanford University",
    "Berkeley": "University of California, Berkeley",
    "UC Berkeley": "University of California, Berkeley",
    "UCLA": "University of California, Los Angeles",
    "Columbia": "Columbia University",
    "Harvard": "Harvard University",
    "Princeton": "Princeton University",
    "Yale": "Yale University",
    "Cornell": "Cornell University",
    "Dartmouth": "Dartmouth College",
    "Illinois": "University of Illinois Urbana-Champaign",
    "Georgia Tech": "Georgia Institute of Technology",
    "UW": "University of Washington",
    "USC": "University of Southern California",
    "UT Austin": "University of Texas at Austin",
    "Michigan": "University of Michigan, Ann Arbor",
    "UCSD": "University of California, San Diego",
    "Wisconsin": "University of Wisconsin–Madison"
}

# Check if 'school' column exists, then apply mapping
if 'school' in df.columns:
    df['school'] = df['school'].replace(school_name_mapping)

# Save the modified CSV (overwrite in place)
df.to_csv(file_path, index=False)