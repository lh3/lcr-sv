.SUFFIXES: .gp .tex .eps .pdf .eps.gz

.eps.pdf:
		epstopdf --outfile $@ $<

.eps.gz.pdf:
		gzip -dc $< | epstopdf --filter > $@

.pdf.eps:
		pdftops -eps $< $@

all:lcr-sv.pdf

lcr-sv.pdf:lcr-sv.tex lcr-sv.bib
		pdflatex lcr-sv; bibtex lcr-sv; pdflatex lcr-sv; pdflatex lcr-sv;

clean:
		rm -fr *.toc *.aux *.bbl *.blg *.idx *.log *.out *~ lcr-sv.pdf
