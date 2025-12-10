BEGIN { OFS = "\t" }
NR == 1 {
	print "Truth", $2, $4, $6;
}
{
	print $1, $8, $10, $12;
}
