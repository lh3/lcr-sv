set t po eps co "Helvetica,24"

set size 0.75,1

set style histogram rowstacked
set xtics rotate by 40 right nomirror font "Helvetica,24"
set boxwidth 0.7 relative
set style data histograms
set style fill solid 1.0 border lt -1
set border 3

set yran [0:25]
set out "fnr-Q100.eps"
set mytics 5
set ylab "False negative rate (%)" off +0.0,0
plot "<grep -v Severus 31eval-Q100.txt" u ($7/($2+$4+$6)*100):xtic(1) t "Other" ls 1, \
	"" u ($5/($2+$4+$6)*100):xtic(1) t "SVLCR" ls 2, \
	"" u ($3/($2+$4+$6)*100):xtic(1) t "SegDup" ls 4

set out "fnr-old.eps"
set mytics 5
set ylab "False negative rate (%)" off +0.0,0
plot "<grep -v Severus 32eval-old.txt" u ($7/($2+$4+$6)*100):xtic(1) t "Other" ls 1, \
	"" u ($5/($2+$4+$6)*100):xtic(1) t "SVLCR" ls 2, \
	"" u ($3/($2+$4+$6)*100):xtic(1) t "SegDup" ls 4

set yran [0:12]
set out "fdr-Q100.eps"
set mytics 4
set ylab "False discovery rate (%)" off +0.0,0
plot "<grep -v Severus 31eval-Q100.txt" u ($13/($8+$10+$12)*100):xtic(1) t "Other" ls 1, \
	"" u ($11/($8+$10+$12)*100):xtic(1) t "SVLCR" ls 2, \
	"" u ($9/($8+$10+$12)*100):xtic(1) t "SegDup" ls 4

set out "fdr-old.eps"
set mytics 4
set ylab "False discovery rate (%)" off +0.0,0
plot "<grep -v Severus 32eval-old.txt" u ($13/($8+$10+$12)*100):xtic(1) t "Other" ls 1, \
	"" u ($11/($8+$10+$12)*100):xtic(1) t "SVLCR" ls 2, \
	"" u ($9/($8+$10+$12)*100):xtic(1) t "SegDup" ls 4
