[![Resource](https://img.shields.io/badge/resource-10.5281/zenodo.10903864-blue)][zenodo]

```sh
# Download low-complexity regions (LCRs) for GRCh38
wget https://zenodo.org/records/17204470/files/hg38.lcr-v4.bed.gz

# Get variants overlapping with LCRs, requiring >=70% of variant regions in LCRs
bedtk flt -cf.7 hg38.lcr-v4.bed.gz var.vcf.gz

# Filter out variants overlapping with LCRs
bedtk flt -vcf.7 hg38.lcr-v4.bed.gz var.vcf.gz

# Stratify "truvari refine" reports. Output: name all-truth FN all-call FP
k8 scripts/truvari-count.js truvari-out-dir hg38.lcr-v4.bed.gz
```

Data files and GNUplot scripts in the [plots/](plots) directory generate plots
in the preprint. Scripts in [gen/](gen) log the process to generate
low-complexity regions on GRCh38 and CHM13. They are not meant for enduers to
run.

Data files are released under CC0 [at Zenodo][zenodo] (file
`hg38.lcr-v4.bed.gz` and `chm13v2.0.lcr-v4.bed.gz`). Source code are covered by
the MIT license.

[zenodo]: https://doi.org/10.5281/zenodo.10903864
