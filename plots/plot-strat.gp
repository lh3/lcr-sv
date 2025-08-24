set t po eps co so "Helvetica,20"

set style line 1 lt 1 lc rgb '#9400d3' pt 5
set style line 2 lt 1 lc rgb '#009e73' pt 4
set style line 3 lt 1 lc rgb '#56b4e9' pt 7
set style line 4 lt 1 lc rgb '#e69f00' pt 6
set style line 5 lt 1 lc rgb '#0072b2' pt 9
set style line 6 lt 1 lc rgb '#E31A1C' pt 8
set style line 7 lt 1 lc rgb '#FDBF6F' pt 11
set style line 8 lt 1 lc rgb '#FF7F00' pt 10

set pointsize 1.5
set size 0.75,1

set xtics rotate by 40 right nomirror font "Helvetica,20"
set xtics ("[50,100)" 1, "[100,200)" 2, "[200,500)" 3, "[500,1k)" 4, "[1k,2k)" 5, "[2k,inf)" 6)
set rmargin 3

set key top left

set out "fnr-stra.eps"
set ylab "False negative rate (%)"
set xlab "Maximum allele length in an LCR (bp)"
set yran [0:60]
set mytics 5
plot "<awk -f format.awk 33len-Q100.txt | grep FN | grep cuteSV" u 2:($6/$5*100) t "cuteSV" w lp ls 1 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FN | grep Delly" u 2:($6/$5*100) t "Delly" w lp ls 2 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FN | grep longcallD" u 2:($6/$5*100) t "longcallD" w lp ls 3 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FN | grep sawfish" u 2:($6/$5*100) t "sawfish" w lp ls 4 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FN | grep Sniffles" u 2:($6/$5*100) t "Sniffles" w lp ls 5 lw 2

set out "fdr-stra.eps"
set ylab "False discovery rate (%)"
set xlab "Maximum allele length in an LCR (bp)"
set yran [0:35]
set mytics 5
plot "<awk -f format.awk 33len-Q100.txt | grep FP | grep cuteSV" u 2:($6/$5*100) t "cuteSV" w lp ls 1 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FP | grep Delly" u 2:($6/$5*100) t "Delly" w lp ls 2 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FP | grep longcallD" u 2:($6/$5*100) t "longcallD" w lp ls 3 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FP | grep sawfish" u 2:($6/$5*100) t "sawfish" w lp ls 4 lw 2, \
	"<awk -f format.awk 33len-Q100.txt | grep FP | grep Sniffles" u 2:($6/$5*100) t "Sniffles" w lp ls 5 lw 2
