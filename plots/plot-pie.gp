set t po eps co so "Helvetica,22"

# adapted from https://stackoverflow.com/questions/31896718/generation-of-pie-chart-using-gnuplot

set linetype 1 lc rgb "#b0b0b0" lw 1
set linetype 2 lc rgb "#009e73" lw 1
set linetype 3 lc rgb "#e69f00" lw 1
set linetype 4 lc rgb "#9400d3" lw 1

set out "test.eps"

filename = "23len.txt"

rowi = 1
rowf = 7

# obtain sum(column(2)) from rows `rowi` to `rowf`
stats filename u 2 every ::rowi::rowf noout prefix "A"

# rowf should not be greater than length of file
rowf = (rowf-rowi > A_records - 1 ? A_records + rowi - 1 : rowf)

angle(x)=x*360/A_sum
percentage(x)=x*100/A_sum

# circumference dimensions for pie-chart
centerX=0
centerY=0
radius=1

# label positions
yposmin = 0.0
yposmax = 0.9*radius
xpos = 1.15*radius
ypos(i) = yposmax - i*(yposmax-yposmin)/(1.6*rowf-rowi)

#-------------------------------------------------------------------
# now we can configure the canvas
set style fill solid 1     # filled pie-chart
unset key                  # no automatic labels
unset tics                 # remove tics
unset border               # remove borders; if some label is missing, comment to see what is happening

set size ratio -1              # equal scale length
set xrange [-radius:2*radius]  # [-1:2] leaves space for labels
set yrange [-radius:radius]    # [-1:1]

#-------------------------------------------------------------------
pos = 0             # init angle
colour = 0          # init colour

# 1st line: plot pie-chart
# 2nd line: draw colored boxes at (xpos):(ypos)
# 3rd line: place labels at (xpos+offset):(ypos)
plot filename u (centerX):(centerY):(radius):(pos):(pos=pos+angle($2)):(colour=colour+1) every ::rowi::rowf w circle lc var,\
     for [i=0:rowf-rowi] '+' u (xpos):(ypos(i)) w p pt 5 ps 4 lc i+1,\
     for [i=0:rowf-rowi] filename u (xpos):(ypos(i)):(sprintf('%s (%.2f%%)', stringcolumn(1), percentage($2))) every ::i+rowi::i+rowi w labels left offset 3,0
