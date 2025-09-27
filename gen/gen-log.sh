# longdust from https://github.com/lh3/longdust
# dna-brnn from https://github.com/lh3/dna-nn
# mgutils-es6.js from https://github.com/lh3/minigraph
# bedtk from https://github.com/lh3/bedtk
# bgzip from samtools
# *-464.call.bed.gz from https://zenodo.org/records/16728828

longdust hs38.fa | bgzip > hg38.ld.bed.gz
dna-brnn -Ai models/attcc-alpha.knm -t16 hs38.fa > hs38.brnn.bed

./mgutils-es6.js getlcr -r1 GRCh38-464.call.bed.gz|bgzip > hs38.lcr-mg.bed.gz
bedtk sub hg38.ld.bed.gz <(awk '$3-$2>=10000' ~/ref/hs38.brnn.bed)|awk '$3-$2>=19{l=$3-$2;$2=$2>5?$2-5:0;$3+=5;print $1"\t"$2"\t"$3"\tld\t"l}'|bgzip > hs38.lcr-ld.bed.gz
zcat hs38.lcr-mg.bed.gz hs38.lcr-ld.bed.gz|sort -S20G -k1,1 -k2,2n | pigz -p8 > hs38.lcr-merge.bed.gz
./merge-raw.js hs38.lcr-merge.bed.gz|awk '$5>=50&&$1~/^chr[0-9XY]+$/'|sort-alt -k1,1N -k2,2n|bgzip > hg38.lcr-v4.bed.gz

./mgutils-es6.js getlcr -r0 CHM13-462.call.bed.gz|bgzip > chm13.lcr-mg.bed.gz
bedtk sub chm13v2.ld.bed.gz <(awk '$3-$2>=10000' ~/ref/chm13v2.brnn.bed)|awk '$3-$2>=19{l=$3-$2;$2=$2>5?$2-5:0;$3+=5;print $1"\t"$2"\t"$3"\tld\t"l}'|bgzip > chm13.lcr-ld.bed.gz
zcat chm13.lcr-mg.bed.gz chm13.lcr-ld.bed.gz|sort -S20G -k1,1 -k2,2n | pigz -p8 > chm13.lcr-merge.bed.gz
./merge-raw.js chm13.lcr-merge.bed.gz|awk '$5>=50'|sort-alt -k1,1N -k2,2n|bgzip > chm13.lcr-v4.bed.gz
