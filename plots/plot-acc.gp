set t po eps co "Helvetica,24"

set size 0.75,1

set style histogram rowstacked
set xtics rotate by 40 right nomirror font "Helvetica,24"
set boxwidth 0.8 relative
set style data histograms
set style fill solid 1.0 border lt -1
set border 3

set key invert

set yran [0:25]
set out "fnr-Q100.eps"
set mytics 5
set ylab "False negative rate (%)" off +0.0,0
plot "<egrep -v 'Severus' 31eval-Q100.txt" u ($7/($2+$4+$6)*100):xtic(1) t "Other" ls 1, \
	"" u ($5/($2+$4+$6)*100):xtic(1) t "SegDup" ls 4, \
	"" u ($3/($2+$4+$6)*100):xtic(1) t "LCR" ls 2

set out "fnr-old.eps"
set mytics 5
set ylab "False negative rate (%)" off +0.0,0
plot "<egrep -v 'Severus' 32eval-old.txt" u ($7/($2+$4+$6)*100):xtic(1) t "Other" ls 1, \
	"" u ($5/($2+$4+$6)*100):xtic(1) t "SegDup" ls 4, \
	"" u ($3/($2+$4+$6)*100):xtic(1) t "LCR" ls 2

set yran [0:12]
set out "fdr-Q100.eps"
set mytics 4
set ylab "False discovery rate (%)" off +0.0,0
plot "<egrep -v 'Severus' 31eval-Q100.txt" u ($13/($8+$10+$12)*100):xtic(1) t "Other" ls 1, \
	"" u ($11/($8+$10+$12)*100):xtic(1) t "SegDup" ls 4, \
	"" u ($9/($8+$10+$12)*100):xtic(1) t "LCR" ls 2

set out "fdr-old.eps"
set mytics 4
set ylab "False discovery rate (%)" off +0.0,0
plot "<egrep -v 'Severus' 32eval-old.txt" u ($13/($8+$10+$12)*100):xtic(1) t "Other" ls 1, \
	"" u ($11/($8+$10+$12)*100):xtic(1) t "SegDup" ls 4, \
	"" u ($9/($8+$10+$12)*100):xtic(1) t "LCR" ls 2

set yran [0:33]
set mytics 5
set xtics rotate by 40 right nomirror font "Helvetica,22"
set ylab "# SVs ({/Symbol \264}1000)"
set out "dist-Q100.eps"
plot "<awk -f add-truth.awk 31eval-Q100.txt | grep -v Severus" u ($4/1000):xtic(1) t "Other" ls 1, \
	"" u ($3/1000):xtic(1) t "SegDup" ls 4, \
	"" u ($2/1000):xtic(1) t "LCR" ls 2

set out "dist-old.eps"
plot "<awk -f add-truth.awk 32eval-old.txt | grep -v Severus" u ($4/1000):xtic(1) t "Other" ls 1, \
	"" u ($3/1000):xtic(1) t "SegDup" ls 4, \
	"" u ($2/1000):xtic(1) t "LCR" ls 2
